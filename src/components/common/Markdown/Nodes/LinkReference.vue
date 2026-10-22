<script setup lang="ts">
import type { Definition, LinkReference } from '@futuregene/vue-remark'
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  node: LinkReference
  definitions?: Definition[]
}>()

const definition = computed(() => {
  return props.definitions?.find(def => def.identifier === props.node.identifier)
})
</script>

<template>
  <a
    v-if="definition"
    :href="definition.url"
    :title="definition.title || undefined"
    target="_blank"
    rel="noopener noreferrer"
    style="color:#009dab;text-decoration:none;"
    onmouseover="this.style.textDecoration='underline'"
    onmouseout="this.style.textDecoration='none'"
  >
    <slot />
  </a>
</template>
