<script setup lang="ts">
import type { Link } from '@futuregene/vue-remark'
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ node: Link }>()

const regCite = /\[(\d+)\]/
const isCite = computed(() => {
  return (
    props.node.url.startsWith('#')
    && Array.isArray(props.node.children)
    && props.node.children.length === 1
    && props.node.children[0]?.type === 'text'
    && regCite.test((props.node.children[0] as any).value)
  )
})
const citeNo = computed(() => {
  const match = isCite.value ? regCite.exec((props.node.children[0] as any).value) : null
  return match ? match[1] : null
})
</script>

<template>
  <a
    v-if="!isCite"
    :href="node.url"
    :title="node.title || undefined"
    target="_blank"
    rel="noopener noreferrer"
    style="color:#009dab;text-decoration:none;"
    onmouseover="this.style.textDecoration='underline'"
    onmouseout="this.style.textDecoration='none'"
  >
    <slot />
  </a>
  <sup v-else>
    <a
      :href="`${node.url}`"
      rel="noopener noreferrer"
      style="display:inline-block;background:#009dab;color:#fff;font-size:11px;border:1px solid #009dab;border-radius:4px;min-width:20px;padding:0 4px;text-align:center;text-decoration:none;"
    >
      {{ citeNo }}
    </a>
  </sup>
</template>
