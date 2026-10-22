<script setup lang="ts">
import type { ToolCall } from '@/types/chat'
import { computed, nextTick, onMounted, ref } from 'vue'
import { sleep } from '@/utils/misc'
import Common from './Common.vue'

const props = defineProps<{
  toolCall: ToolCall
  error?: boolean
}>()

// 工具调用卡片会被 teleport 到 markdown 中对应的 [[teleport:id]] 占位处
const ready = ref(false)
const target = computed(() => `[data-teleport-id="${props.toolCall.id}"]`)
onMounted(async () => {
  let count = 30
  while (!(props.toolCall.id && document.querySelector(target.value))) {
    if (count <= 0) break
    await sleep(100)
    await nextTick()
    count--
  }
  ready.value = !!(props.toolCall.id && document.querySelector(target.value))
})
</script>

<template>
  <Teleport v-if="ready && toolCall" :to="target" defer>
    <Common :tool-call="toolCall" :error="error" />
  </Teleport>
</template>
