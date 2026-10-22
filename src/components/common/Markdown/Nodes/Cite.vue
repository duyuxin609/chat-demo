<script setup lang="ts">
import type { Cite } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{ node: Cite }>()
</script>

<template>
  <sup>
    <a
      :href="`#${node.value}`"
      rel="noopener noreferrer"
      class="inline-block bg-westlake-blue text-white text-xs border rounded min-w-4 px-1 text-center scale-90"
      style="background-color:#009dab;color:#fff;border-radius:4px;min-width:16px;padding:0 4px;font-size:11px;display:inline-block;text-decoration:none;"
    > ↗</a>
  </sup>
</template>
