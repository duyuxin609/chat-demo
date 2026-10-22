<script setup lang="ts">
import type { Heading } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{ node: Heading }>()
</script>

<template>
  <!-- text-2xl=24px / xl=20 / lg=18 / base=16 -->
  <h1 v-if="node.depth === 1" class="md-heading" style="font-size:24px;font-weight:700;margin:24px 0 16px;">
    <slot />
  </h1>
  <h2 v-else-if="node.depth === 2" class="md-heading" style="font-size:20px;font-weight:600;margin:24px 0 16px;">
    <slot />
  </h2>
  <h3 v-else-if="node.depth === 3" class="md-heading" style="font-size:18px;font-weight:600;margin:24px 0 16px;">
    <slot />
  </h3>
  <h4 v-else-if="node.depth === 4" class="md-heading" style="font-size:16px;font-weight:600;margin:24px 0 16px;">
    <slot />
  </h4>
  <h5 v-else-if="node.depth === 5" class="md-heading" style="font-size:16px;font-weight:600;margin:24px 0 16px;">
    <slot />
  </h5>
  <h6 v-else class="md-heading" style="font-size:16px;font-weight:600;margin:24px 0 16px;">
    <slot />
  </h6>
</template>

<style scoped>
.md-heading:first-child { margin-top: 0; }
</style>
