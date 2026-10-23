<script setup lang="ts">
import type { Message } from '@/types/chat'
import { useTimeoutFn } from '@vueuse/core'
import { flatten } from 'lodash-es'
import { NAlert, NButton, NModal, NSpin } from 'naive-ui'
import { computed, ref } from 'vue'
import Markdown from '@/components/common/Markdown/index.vue'
import { parseJson } from '@/utils/misc'
import Thinking from '../Thinking.vue'
import ThinkBlock from '../ThinkBlock.vue'
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
interface Segment {
  type: 'think' | 'answer'
  text: string
  /** 流式中还没出现 </think>，思考尚未结束 */
  streaming: boolean
}

/**
 * 把正文按 <think>...</think> 切成「思考」和「回答」两类片段。
 * - 流式过程中可能只有 <think> 没有闭合标签
 * - 网关在思考结束、正文开始时可能只补一个 </think>，开头要先清掉
 */
function splitThink(raw: string): Segment[] {
  const text = raw.replace(/^\s*<\/think>\s*/i, '')
  const out: Segment[] = []
  const re = /<think>([\s\S]*?)(<\/think>|$)/gi
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: 'answer', text: text.slice(last, m.index), streaming: false })
    }
    out.push({ type: 'think', text: m[1], streaming: !m[2] })
    last = m.index + m[0].length
    if (!m[2]) break
  }
  if (last < text.length) {
    out.push({ type: 'answer', text: text.slice(last), streaming: false })
  }
  return out
}

const parts = computed<Segment[]>(() => splitThink(normalizedContent.value))

const PLACEHOLDER_RE = /->\[[^\]]+\]/g

/** 取出片段里的工具占位符（保持顺序） */
function extractPlaceholders(text: string): string {
  return (text.match(PLACEHOLDER_RE) || []).join('\n\n')
}

/** 确保占位符独占一行，remark-teleport 才能解析；否则会以纯文本显示 */
function normalizePlaceholders(text: string): string {
  return text.replace(PLACEHOLDER_RE, m => `\n\n${m}\n\n`)
}

/** 一条消息里所有思考内容合并成一个块，统一放在正文前面（思考里的占位符不显示） */
const thinkText = computed(() =>
  parts.value
    .filter(s => s.type === 'think')
    .map(s => s.text.replace(PLACEHOLDER_RE, '').trim())
    .filter(Boolean)
    .join('\n\n'),
)
const thinkStreaming = computed(() => parts.value.some(s => s.type === 'think' && s.streaming))

/**
 * 回答正文：去掉思考文字，但保留思考块里的工具占位符。
 * 模型经常在 <think> 还没闭合时就写 ->[call_xxx]，占位符跟着思考一起被折叠掉，
 * 正文里就找不到锚点，工具卡片也就插不进去了。
 */
const answerContent = computed(() =>
  normalizePlaceholders(
    parts.value
      .map(s => (s.type === 'think' ? extractPlaceholders(s.text) : s.text))
      .join('\n\n'),
  ),
)

/** 回答片段（保留引用过滤） */
const answerSegments = computed(() => {
  const text = filterCites(answerContent.value)
  return text.trim() === '' ? [] : [{ type: 'answer' as const, text, streaming: false }]
})

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
      <div style="width:100%;min-width:0;max-width:100%;font-size:15px;background:#fff;color:#1f2937;padding:20px;border-radius:16px;border-top-left-radius:4px;box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);border:1px solid rgb(243 244 246 / 0.5);">
        <Transition mode="out-in" name="fade">
          <template v-if="!content">
            <div key="thinking">
              <Thinking v-if="isTalking" />
            </div>
          </template>
          <template v-else>
            <div key="content">
              <ThinkBlock
                v-if="thinkText || thinkStreaming"
                :text="thinkText"
                :streaming="thinkStreaming && isTalking"
              />
              <Markdown
                v-for="(seg, i) in answerSegments"
                :key="i"
                :allow-dangerous-html="true"
                :text="seg.text"
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
