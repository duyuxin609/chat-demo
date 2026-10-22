<script setup lang="ts">
import type { Teleport } from '@futuregene/vue-remark'

defineOptions({ inheritAttrs: false })

defineProps<{ node: Teleport }>()
</script>

<template>
  <div :data-teleport-id="node.value" role="teleport" />
</template>
