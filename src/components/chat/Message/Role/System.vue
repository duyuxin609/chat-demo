<script setup lang="ts">
import type { Message } from '@/types/chat'
import { computed } from 'vue'
import Markdown from '@/components/common/Markdown/index.vue'

const props = defineProps<{ item: Message }>()
const content = computed(() => props.item.content)
</script>

<template>
  <div style="display:flex;min-width:40px;margin-right:56px;">
    <div style="font-size:15px;background:#fff;color:#525252;padding:12px;border-radius:8px;box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);">
      <Markdown :text="content" />
    </div>
  </div>
</template>
