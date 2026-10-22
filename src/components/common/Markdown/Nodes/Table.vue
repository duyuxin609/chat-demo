<script setup lang="ts">
import type { Table } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{ node: Table }>()
</script>

<template>
  <div style="overflow-x:auto;max-width:100%;margin-bottom:16px;">
    <table style="width:max-content;border-collapse:collapse;">
      <slot />
    </table>
  </div>
</template>
