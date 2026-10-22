<script setup lang="ts">
import type { ToolCall } from '@/types/chat'
import { useIntersectionObserver } from '@vueuse/core'
import { NBadge, NButton, NButtonGroup } from 'naive-ui'
import { computed, nextTick, ref, shallowRef, useTemplateRef } from 'vue'
import { ToolCallStatus } from '@/types/chat'
import { copy } from '@/utils/misc'
import ContentItem from './ContentItem.vue'
import Duration from './Duration.vue'

const props = defineProps<{
  toolCall: ToolCall
  error?: boolean
}>()

const status = computed(() => {
  switch (props.toolCall.status) {
    case ToolCallStatus.Finished:
      return 'success'
    case ToolCallStatus.Error:
      return 'error'
    default:
      return props.error ? 'error' : 'info'
  }
})
const name = computed(() => {
  if (!props.toolCall.name && !props.toolCall.database) return 'Info'
  return [props.toolCall.name, props.toolCall.database].filter(Boolean).join(': ')
})

const showInput = ref(false)
const showOutput = ref(false)
const showSummary = ref(false)

const container = useTemplateRef('container')
const button = useTemplateRef('button')
const buttonIsVisible = shallowRef(false)
useIntersectionObserver(button, ([entry]) => {
  buttonIsVisible.value = entry?.isIntersecting || false
})

function scrollToContainer() {
  if (container.value && button.value && !buttonIsVisible.value) {
    container.value.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
}
async function foldInput() {
  showInput.value = false
  await nextTick()
  scrollToContainer()
}
async function foldOutput() {
  showOutput.value = false
  await nextTick()
  scrollToContainer()
}
</script>

<template>
  <div ref="container" style="margin:16px 0 24px;border:1px solid #e5e5e5;border-radius:4px;background:#fafafa;box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);">
    <div style="font-size:14px;">
      <div
        style="height:40px;padding:0 12px;background:#f5f5f5;display:flex;justify-content:space-between;align-items:center;gap:8px;"
        :style="toolCall.resultSummary ? 'cursor:pointer' : ''"
        @click="showSummary = !showSummary"
      >
        <div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          {{ toolCall.callSummary || name }}
        </div>
        <div ref="button" style="display:flex;align-items:center;gap:8px;">
          <NButtonGroup>
            <NButton
              v-if="toolCall.result"
              :type="showOutput ? 'primary' : 'default'"
              size="tiny"
              :focusable="false"
              @click.prevent.stop="showOutput = !showOutput"
            >
              OUTPUT
            </NButton>
            <NButton
              v-if="toolCall.arguments"
              :type="showInput ? 'primary' : 'default'"
              size="tiny"
              :focusable="false"
              @click.prevent.stop="showInput = !showInput"
            >
              INPUT
            </NButton>
          </NButtonGroup>
          <div style="display:flex;align-items:center;gap:8px;min-width:56px;justify-content:flex-end;font-size:12px;">
            <span v-if="status === 'error'">
              {{ toolCall?.status === ToolCallStatus.Error ? 'Error' : 'Aborted' }}
            </span>
            <Duration v-else-if="toolCall.startAt" :start-time="toolCall.startAt" :end-time="toolCall.endAt" />
            <NBadge :type="status" dot :processing="status === 'info'" />
          </div>
        </div>
      </div>
      <div v-if="toolCall.resultSummary && showSummary" style="padding:12px;">
        {{ toolCall.resultSummary }}
      </div>
    </div>
    <div v-if="toolCall.arguments" :style="showInput ? 'height:auto' : 'height:0;overflow:hidden'">
      <div style="position:sticky;top:0;height:40px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:14px;padding:0 12px;background:#f5f5f5;">
        <strong>Input</strong>
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:16px;font-size:14px;">
          <NButton size="small" text :focusable="false" @click.stop.prevent="copy(JSON.stringify(toolCall.arguments, null, 2))">
            Copy
          </NButton>
          <NButton size="small" text :focusable="false" @click.stop.prevent="foldInput">
            Hide
          </NButton>
        </div>
      </div>
      <ContentItem :value="toolCall.arguments" />
    </div>
    <div v-if="toolCall.result" :style="showOutput ? 'height:auto' : 'height:0;overflow:hidden'">
      <div style="position:sticky;top:0;height:40px;display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:14px;padding:0 12px;background:#f5f5f5;">
        <strong>Output</strong>
        <div style="display:flex;justify-content:flex-end;align-items:center;gap:16px;font-size:14px;">
          <NButton size="small" text @click.stop.prevent="copy(toolCall.result)">
            Copy
          </NButton>
          <NButton size="small" text @click.stop.prevent="foldOutput">
            Hide
          </NButton>
        </div>
      </div>
      <ContentItem v-if="toolCall.result" :value="toolCall.result" />
    </div>
  </div>
</template>
