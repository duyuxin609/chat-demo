<script setup lang="ts">
import type { List } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{ node: List }>()
</script>

<template>
  <ol
    v-if="node.ordered" :start="node.start || undefined"
    style="list-style:decimal;padding-left:24px;margin:0 0 16px;"
  >
    <slot />
  </ol>
  <ul
    v-else
    style="list-style:disc;padding-left:24px;margin:8px 0;"
  >
    <slot />
  </ul>
</template>

<style scoped>
ol:last-child, ul:last-child { margin-bottom: 0; }
</style>
