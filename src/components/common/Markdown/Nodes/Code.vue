<script setup lang="ts">
import type { Code } from '@futuregene/vue-remark'
import { computed } from 'vue'
import { copy } from '@/utils/misc'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ node: Code }>()

const lang = computed(() => props.node.lang ? props.node.lang.toLowerCase() : undefined)
</script>

<template>
  <div style="border:1px solid #e5e5e5;background:#f9fafb;border-radius:6px;margin-bottom:16px;">
    <div style="height:40px;line-height:40px;display:flex;justify-content:space-between;align-items:center;padding:0 8px;color:#6b7280;background:#e5e7eb;">
      <div>{{ lang || ' ' }}</div>
      <button
        style="border:none;background:none;cursor:pointer;color:#374151;font-size:14px;"
        @click="copy(node.value || '')"
      >
        复制
      </button>
    </div>
    <div style="padding:12px;overflow-x:auto;">
      <pre style="white-space:pre-wrap;background:transparent;font-size:13px;margin:0;" v-text="props.node.value.trim()" />
    </div>
  </div>
</template>
