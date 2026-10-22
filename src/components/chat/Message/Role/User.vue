<script setup lang="ts">
import type { Message } from '@/types/chat'
import { NButton } from 'naive-ui'
import { computed } from 'vue'
import { copy } from '@/utils/misc'

const props = defineProps<{ item: Message }>()

const raw = computed(() => props.item.content || '')
const hasRef = computed(() => raw.value.startsWith('引用：'))
const refText = computed(() => {
  if (!hasRef.value) return ''
  const rest = raw.value.replace(/^引用：/, '')
  const idx = rest.indexOf('\n问题：')
  return idx >= 0 ? rest.slice(0, idx) : rest
})
const question = computed(() => {
  if (!hasRef.value) return raw.value
  const rest = raw.value.replace(/^引用：/, '')
  const boundary = '\n问题：'
  const idx = rest.indexOf(boundary)
  if (idx >= 0) return rest.slice(idx + boundary.length)
  const parts = rest.split('\n')
  return parts.length > 1 ? parts.slice(1).join('\n') : ''
})
const displayRefText = computed(() => {
  const t = refText.value
  return t.length > 30 ? `${t.slice(0, 30)}...` : t
})
</script>

<template>
  <div style="display:flex;flex-direction:column;align-items:flex-end;max-width:calc(100% - 3.5rem);margin-left:auto;">
    <div style="background:#009dab;color:#fff;border-radius:16px;border-top-right-radius:4px;box-shadow:0 4px 6px -1px rgb(0 157 171 / 0.1);padding:12px 16px;max-width:100%;font-size:15px;">
      <div v-if="hasRef">
        <div style="font-weight:700;opacity:0.9;">提问：</div>
        <div style="background:rgb(255 255 255 / 0.1);padding:12px;margin:12px 0;border-radius:8px;border:1px solid rgb(255 255 255 / 0.1);">
          <div style="overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-style:italic;">
            {{ displayRefText }}
          </div>
        </div>
      </div>
      <div style="white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.625;">{{ question }}</div>
    </div>
    <div style="margin-top:4px;display:flex;padding:0 4px;">
      <NButton text size="tiny" title="复制" @click="copy(item.content)">
        <span style="font-size:12px;color:#9ca3af;">复制</span>
      </NButton>
    </div>
  </div>
</template>
