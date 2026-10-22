<script setup lang="ts">
import type { Math } from '@futuregene/vue-remark'
import { computed, onMounted, ref } from 'vue'
import { loadKatex } from '@/utils/loader'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ node: Math }>()

const katex = ref<any>(null)
const html = computed(() => {
  if (katex.value) {
    return katex.value.renderToString(props.node.value, { throwOnError: false })
  }
  return props.node.value
})

onMounted(async () => {
  katex.value = await loadKatex()
})
</script>

<template>
  <div style="margin-bottom:16px;text-align:center;" v-html="html" />
</template>
