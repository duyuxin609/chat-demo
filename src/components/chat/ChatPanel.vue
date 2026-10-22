<script setup lang="ts">
import type { ChatRequest, Message } from '@/types/chat'
import { NButton, NInput, NTag } from 'naive-ui'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { chat, getChatHistory } from '@/apis/chat'
import { Role } from '@/types/chat'
import MessageList from './Message/index.vue'

const props = defineProps<{
  /** 会话 ID（必填，对应 openapi /v1/sessions/{id} 的 id） */
  no: string
  /** 系统欢迎语 */
  welcome?: string
}>()

const prompt = ref('')
const refQuote = ref<string | null>(null)
const hasChatHistory = ref(false)
const chatList = ref<Message[]>([
  {
    symbol: Symbol('chat'),
    role: Role.System,
    content: props.welcome ?? '你好，有任何问题都可以向我提问！',
    finished: true,
  },
])

const isTalking = computed(() => {
  if (chatList.value.length > 0) {
    const last = chatList.value[chatList.value.length - 1]
    return last && last.role === Role.Assistant && !last.finished && !last.error && !last.abort
  }
  return false
})

const scrollContainer = ref<HTMLElement | null>(null)
async function scrollToBottom() {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

async function appendedChatList(data: Message) {
  const last = chatList.value[chatList.value.length - 1]
  if (last?.symbol === data.symbol) {
    chatList.value.splice(-1, 1, data)
  }
  else {
    chatList.value.push(data)
  }
  scrollToBottom()
}

const abortController = ref<AbortController | null>(null)
async function handleChat() {
  if (!prompt.value || !props.no || isTalking.value) return

  const userContent = refQuote.value ? `引用：${refQuote.value}\n问题：${prompt.value}` : prompt.value
  chatList.value.push({
    symbol: Symbol('chat'),
    role: Role.User,
    content: userContent,
    finished: true,
  })
  prompt.value = ''
  refQuote.value = null
  await nextTick()
  scrollToBottom()

  const request: ChatRequest = {
    id: props.no,
    messages: userContent,
  }
  hasChatHistory.value = true

  if (abortController.value) abortController.value.abort()
  abortController.value = new AbortController()
  const result = await chat(request, abortController.value, appendedChatList)
  if (abortController.value.signal.aborted) result.abort = true
  await appendedChatList(result)
  abortController.value = null
}

function handleAbort() {
  if (abortController.value && isTalking.value) {
    abortController.value.abort()
  }
}

function handleKeypress(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleChat()
  }
}

async function loadChatHistory(id: string) {
  try {
    const historyData = await getChatHistory(id)
    const history = historyData.messages || []
    if (history.length > 0) {
      chatList.value = history
      hasChatHistory.value = true
    }
    await nextTick()
    scrollToBottom()
  }
  catch {
    // session not found 等情况忽略
  }
}

watch(() => props.no, (newNo) => {
  if (newNo) loadChatHistory(newNo)
})

onMounted(() => {
  if (props.no) loadChatHistory(props.no)
})

/** 供父组件调用：引用一段文本并聚焦输入框 */
function ask(text: string) {
  if (!text || isTalking.value) return
  refQuote.value = text
  nextTick(() => {
    document.querySelector<HTMLTextAreaElement>('#chat-input-textarea')?.focus()
  })
}
defineExpose({ ask })
</script>

<template>
  <div ref="scrollContainer" style="overflow-y:auto;background:#f9fafb;height:100%;">
    <div style="min-height:100%;display:flex;flex-direction:column;">
      <MessageList style="flex:1;padding:0 16px;" :chat-list="chatList" />

      <div style="position:sticky;bottom:0;width:100%;padding:24px;z-index:20;pointer-events:none;">
        <div style="display:flex;flex-direction:column;gap:12px;background:#fff;padding:16px;border-radius:16px;box-shadow:0 20px 25px -5px rgb(0 0 0 / 0.05),0 8px 10px -6px rgb(0 0 0 / 0.05);border:1px solid #f3f4f6;pointer-events:auto;max-width:56rem;margin:0 auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0 8px;">
            <div v-if="refQuote">
              <NTag :bordered="false" closable style="background:#f3f4f6;" @close="refQuote = null">
                提问：{{ refQuote.length > 30 ? (`${refQuote.slice(0, 30)}...`) : refQuote }}
              </NTag>
            </div>
            <div v-else />
          </div>
          <div style="display:flex;gap:12px;align-items:flex-end;">
            <NInput
              id="chat-input-textarea"
              v-model:value="prompt"
              type="textarea"
              size="large"
              placeholder="输入你的问题..."
              :autosize="{ minRows: 1, maxRows: 10 }"
              style="max-height:30vh;flex:1;"
              @keypress="handleKeypress"
            />
            <NButton
              v-if="!isTalking"
              size="large"
              type="primary"
              :disabled="prompt.trim() === ''"
              circle
              style="margin-bottom:2px;"
              @click="handleChat"
            >
              ▶
            </NButton>
            <NButton
              v-else
              size="large"
              type="error"
              circle
              style="margin-bottom:2px;"
              @click="handleAbort"
            >
              ■
            </NButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
