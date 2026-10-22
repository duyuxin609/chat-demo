<script setup lang="ts">
import type { InlineCode } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{ node: InlineCode }>()
</script>

<template>
  <code style="background:#f3f4f6;font-size:13px;border-radius:6px;padding:4px;">{{ node.value }}</code>
</template>
