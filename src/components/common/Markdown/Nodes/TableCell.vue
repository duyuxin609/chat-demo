<script setup lang="ts">
import type { AlignType, TableCell } from '@futuregene/vue-remark'
import { computed, onMounted, onUpdated, ref } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  node: TableCell
  rowIndex?: number
  colIndex?: number
  align?: AlignType[]
}>()

const align = computed(() => {
  return Array.isArray(props.align) && props.colIndex !== undefined && props.align[props.colIndex] ? props.align[props.colIndex] : null
})

const cellRef = ref<HTMLElement>()

function fixLayout() {
  if (!cellRef.value) return
  const divs = cellRef.value.querySelectorAll('div')
  divs.forEach((div) => {
    const parent = div.parentNode
    if (!parent) return
    const prev = div.previousElementSibling
    if (prev && ['span', 'a'].includes(prev.tagName.toLowerCase())) {
      const fragment = document.createDocumentFragment()
      let firstNode = div.firstChild
      while (firstNode && firstNode.nodeType === Node.TEXT_NODE && !firstNode.textContent?.trim()) {
        firstNode = firstNode.nextSibling
      }
      if (!firstNode || firstNode.nodeName.toLowerCase() !== 'br') {
        fragment.appendChild(document.createElement('br'))
      }
      while (div.firstChild) {
        fragment.appendChild(div.firstChild)
      }
      parent.replaceChild(fragment, div)
    }
  })
}

onMounted(fixLayout)
onUpdated(fixLayout)
</script>

<template>
  <th
    v-if="rowIndex === 0"
    ref="cellRef"
    style="border:1px solid #e5e5e5;padding:0 8px;text-align:left;"
  >
    <slot />
  </th>
  <td
    v-else
    ref="cellRef"
    style="border:1px solid #e5e5e5;padding:4px 8px;"
    :style="align ? `text-align:${align};` : ''"
  >
    <slot />
  </td>
</template>
