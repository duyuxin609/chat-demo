<script setup lang="ts">
import type { Blockquote } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{ node: Blockquote }>()
</script>

<template>
  <blockquote style="border-left:4px solid #e2e8f0;background:rgb(226 232 240 / 0.2);padding:4px 16px;border-radius:4px;margin:0 0 16px;">
    <slot />
  </blockquote>
</template>
