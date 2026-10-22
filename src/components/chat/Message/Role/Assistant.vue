<script setup lang="ts">
import type { Message } from '@/types/chat'
import { useTimeoutFn } from '@vueuse/core'
import { flatten } from 'lodash-es'
import { NAlert, NButton, NModal, NSpin } from 'naive-ui'
import { computed, ref } from 'vue'
import Markdown from '@/components/common/Markdown/index.vue'
import { parseJson } from '@/utils/misc'
import Thinking from '../Thinking.vue'
import Toolcall from '../Toolcall/index.vue'

const props = defineProps<{ item: Message }>()

interface Evidence {
  evidence: string
  source?: string
  source_url?: string
  link?: string
  query?: string
  hash: string
}

const content = computed(() => props.item.content)

/** 将 [[id1],[id2]] 归一化为 [[id1]] [[id2]] */
function normalizeCites(text?: string): string {
  if (!text) return ''
  return text.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    const raw = String(inner)
    const splitByBracket = raw.split(/\],\s*\[/).map(s => s.replace(/^\[/, '').replace(/\]$/, '').trim())
    const parts = (splitByBracket.length > 1 ? splitByBracket : raw.split(',').map(s => s.trim())).filter(Boolean)
    if (parts.length <= 1) return `[[${inner}]]`
    return parts.map(p => `[[${p}]]`).join(' ')
  })
}
const normalizedContent = computed(() => normalizeCites(content.value))

const toolCalls = computed(() => props.item.toolCalls || [])
const hasError = computed(() => !!props.item.error || !!props.item.abort)
const isAbort = computed(() => !!props.item.abort)
const isTalking = computed(() => !props.item.finished && !props.item.error && !props.item.abort)

function parseOutput(output?: string | object) {
  if (typeof output === 'object' && output !== null) return output
  if (typeof output === 'string') {
    const t = output.trim()
    if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
      return parseJson(t) ?? {}
    }
  }
  return {}
}

/** 从工具调用结果中收集 evidence_list */
const evidences = computed<Evidence[]>(() => {
  const calls = Array.isArray(toolCalls.value) ? toolCalls.value : []
  return flatten(calls.map((call) => {
    const output = parseOutput(call.result)
    return Array.isArray((output as any).evidence_list) ? (output as any).evidence_list : []
  }))
})

const evidenceHashSet = computed(() => new Set(evidences.value.map(e => String(e.hash || '').trim().toLowerCase())))

/** 只保留有对应证据的 cite，其余剔除 */
function filterCites(text?: string): string {
  if (!text) return ''
  return text.replace(/\[\[([^\]]+)\]\]/g, (m, inner) => {
    const id = String(inner).replace(/^\[/, '').replace(/\]$/, '').trim().toLowerCase()
    return /^[a-z0-9]{8}$/.test(id) && evidenceHashSet.value.has(id) ? m : ''
  })
}
const filteredContent = computed(() => filterCites(normalizedContent.value))

const evidenceHash = ref('')
const evidence = computed(() => evidences.value.find(e => e.hash === evidenceHash.value))
const evidenceMarkdown = computed(() => {
  if (!evidence.value) return ''
  return evidence.value.evidence + (evidence.value.link ? `\n\n ${evidence.value.link}` : '')
})
const showEvidence = ref(false)

const regHash = /^#([a-z0-9]{8})$/
function delegateAnchorClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  const anchor = el.closest('a') as HTMLAnchorElement | null
  if (!anchor) return
  const href = anchor.getAttribute('href')
  const hash = (href ? new URL(href, location.href) : null)?.hash
  const m = hash ? hash.match(regHash) : null
  if (!m?.[1]) return
  e.preventDefault()
  e.stopPropagation()
  const ev = evidences.value.find(item => item.hash === m[1])
  if (!ev) return
  evidenceHash.value = m[1]
  showEvidence.value = true
}

// 停顿检测：3 秒无更新显示"正在思考"
const isStalled = ref(false)
const { start, stop } = useTimeoutFn(() => { isStalled.value = true }, 3000)

import { watch } from 'vue'
if (!content.value && isTalking.value) start()
watch(() => props.item.content, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    stop()
    isStalled.value = false
    if (isTalking.value) start()
  }
})
</script>

<template>
  <div style="min-width:40px;max-width:calc(100% - 3.5rem);margin-right:auto;">
    <div style="display:flex;">
      <div style="max-width:100%;font-size:15px;background:#fff;color:#1f2937;padding:20px;border-radius:16px;border-top-left-radius:4px;box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);border:1px solid rgb(243 244 246 / 0.5);">
        <Transition mode="out-in" name="fade">
          <template v-if="!content">
            <div key="thinking">
              <Thinking v-if="isTalking" />
            </div>
          </template>
          <template v-else>
            <div key="content">
              <Markdown
                :allow-dangerous-html="true"
                :text="filteredContent"
                class="prose prose-sm max-w-none"
                @click="delegateAnchorClick"
              />
              <Transition name="fade">
                <p v-if="isTalking && isStalled" style="margin-top:16px;font-size:14px;display:flex;align-items:center;gap:8px;padding:0 4px;color:#6b7280;">
                  <NSpin :size="16" />
                  <span>正在思考...</span>
                </p>
              </Transition>
            </div>
          </template>
        </Transition>
      </div>
    </div>
    <div v-if="hasError">
      <NAlert v-if="isAbort" type="error" style="margin-top:8px;">
        对话已中止。
      </NAlert>
      <NAlert v-else type="error" style="margin-top:8px;">
        {{ props.item.errorMessage || '对话出错，请稍后重试。' }}
      </NAlert>
    </div>
    <NModal v-model:show="showEvidence">
      <div style="max-width:80vw;max-height:80vh;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 25px 50px -12px rgb(0 0 0 / 0.25);position:relative;">
        <div style="position:absolute;right:16px;top:16px;z-index:10;">
          <NButton text :focusable="false" @click="showEvidence = false">
            ✕
          </NButton>
        </div>
        <div style="max-height:80vh;overflow-y:auto;">
          <div style="padding:32px;">
            <Markdown :text="evidenceMarkdown" class="prose max-w-none" />
          </div>
        </div>
      </div>
    </NModal>
    <Toolcall
      v-if="Array.isArray(toolCalls) && toolCalls.length"
      :tool-calls="toolCalls"
      :error="hasError"
      style="margin-top:12px;"
    />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
