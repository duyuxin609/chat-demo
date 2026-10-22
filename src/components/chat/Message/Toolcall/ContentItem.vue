<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { loadHighlight } from '@/utils/loader'

const props = defineProps<{ value: string | object }>()

const formatted = computed(() => {
  if (!props.value) {
    return { value: '', type: 'text' }
  }
  else if (typeof props.value === 'object') {
    return { value: JSON.stringify(props.value, null, 2), type: 'json' }
  }
  else if ((props.value.startsWith('{') && props.value.endsWith('}')) || (props.value.startsWith('[') && props.value.endsWith(']'))) {
    try {
      return { value: JSON.stringify(JSON.parse(props.value), null, 2), type: 'json' }
    }
    catch {
      return { value: props.value, type: 'text' }
    }
  }
  return { value: props.value, type: 'text' }
})

const hljs = ref<any>(null)
const code = computed(() => {
  if (hljs.value) {
    return hljs.value.highlight(formatted.value.value, { language: 'json', ignoreIllegals: true }).value.trim()
  }
  return formatted.value.value
})

onMounted(async () => {
  if (formatted.value.type === 'json')
    hljs.value = await loadHighlight()
})
</script>

<template>
  <div style="padding:12px;font-size:14px;">
    <pre v-if="hljs && formatted.type === 'json'" style="white-space:pre-wrap;margin:0;" v-html="code" />
    <pre v-else style="white-space:pre-wrap;margin:0;">{{ formatted.value }}</pre>
  </div>
</template>
