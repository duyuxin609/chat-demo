<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  startTime: number
  endTime?: number
}>()

// Demo 简化：直接用本地时钟计时（原项目会拉取服务器时间对齐）
const now = ref<number>(Date.now())
let timer: ReturnType<typeof setTimeout> | undefined

function tick() {
  now.value = Date.now()
  const duration = now.value - props.startTime
  if (duration > 5 * 60 * 1000) return
  timer = setTimeout(tick, duration > 60 * 1000 ? 60 * 1000 : 1000)
}

onMounted(() => {
  if (!props.endTime) tick()
})
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

const time = computed(() => {
  const end = props.endTime || now.value
  if (!props.startTime || !end) return null
  const duration = end - props.startTime
  if (duration < 1000) return props.endTime ? `${duration}ms` : '0ms'
  if (duration < 60 * 1000) return `${(duration / 1000).toFixed(props.endTime ? 1 : 0)}s`
  if (duration <= 5 * 60 * 1000) return `${(duration / 60000).toFixed(props.endTime ? 1 : 0)}m`
  return '>5m'
})
</script>

<template>
  <span v-if="time" style="font-family:monospace;">{{ time }}</span>
</template>
