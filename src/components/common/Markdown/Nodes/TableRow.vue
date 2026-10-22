<script setup lang="ts">
import type { TableRow } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{
  node: TableRow
  rowIndex?: number
}>()
</script>

<template>
  <tr :style="rowIndex && rowIndex % 2 === 0 ? 'background:#f5f5f5;' : ''">
    <slot />
  </tr>
</template>
