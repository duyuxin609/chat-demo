<script setup lang="ts">
import type { NodeComponents } from '@futuregene/vue-remark'
import { remarkGfm, remarkMath, remarkTeleport, VueRemark } from '@futuregene/vue-remark'
import { computed } from 'vue'
import defaultCustomNodeComponents from './Nodes'
import remarkCite2 from './Plugins/remarkCite2'

const props = defineProps<{
  text?: string
  allowDangerousHtml?: boolean
  customNodeComponents?: Partial<NodeComponents>
}>()

const plugins = [
  remarkGfm,
  remarkMath,
  remarkCite2,
  remarkTeleport,
]

const mergedCustomNodeComponents = computed(() => ({
  ...defaultCustomNodeComponents,
  ...props.customNodeComponents,
}))
</script>

<template>
  <VueRemark
    v-if="props.text"
    :markdown="props.text"
    :allow-dangerous-html="props.allowDangerousHtml"
    :components="mergedCustomNodeComponents"
    :plugins="plugins"
  />
</template>
