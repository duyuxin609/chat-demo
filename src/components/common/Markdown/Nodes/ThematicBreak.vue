<script setup lang="ts">
import type { ThematicBreak } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{ node: ThematicBreak }>()
</script>

<template>
  <hr style="margin:24px 0;height:2px;background:#d1d5db;border:0;">
</template>
