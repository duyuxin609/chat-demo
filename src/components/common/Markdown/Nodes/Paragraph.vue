<script setup lang="ts">
import type { AlignType, Paragraph } from '@futuregene/vue-remark'
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  node: Paragraph
  parent?: any
  align?: AlignType[]
  rowIndex?: number
  colIndex?: number
}>()

const onlyChild = computed(() => props.parent?.children?.length === 1)
const isBlockContent = computed(() => ['listItem', 'blockquote'].includes(props.parent?.type))
</script>

<template>
  <template v-if="isBlockContent && onlyChild">
    <slot />
  </template>
  <p v-else style="white-space:pre-wrap;margin:0 0 8px;">
    <slot />
  </p>
</template>

<style scoped>
p:last-child { margin-bottom: 0; }
</style>
