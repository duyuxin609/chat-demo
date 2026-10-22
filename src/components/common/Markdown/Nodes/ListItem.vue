<script setup lang="ts">
import type { ListItem } from '@futuregene/vue-remark'
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ node: ListItem }>()

const oneChild = computed(() => props.node.children.length === 1)
</script>

<template>
  <li :style="oneChild ? '' : 'margin-bottom:4px;'">
    <input
      v-if="typeof node.checked === 'boolean'"
      type="checkbox"
      :checked="node.checked"
      disabled
    >
    <slot />
  </li>
</template>

<style scoped>
li:last-child { margin-bottom: 0; }
</style>
