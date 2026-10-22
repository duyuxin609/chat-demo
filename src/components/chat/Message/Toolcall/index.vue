<script setup lang="ts">
import type { ToolCall } from '@/types/chat'
import Item from './Item.vue'

defineProps<{
  toolCalls: ToolCall[]
  error?: boolean
}>()
</script>

<template>
  <Item v-for="call in toolCalls" :key="call.id" :tool-call="call" :error="error" />
</template>
