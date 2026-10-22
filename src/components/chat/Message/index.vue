<script setup lang="ts">
import type { Message } from '@/types/chat'
import { RoleComponents } from './Role'

defineProps<{ chatList: Message[] }>()
</script>

<template>
  <ul style="list-style:none;margin:0;padding:0;">
    <li
      v-for="item of chatList"
      :key="item.symbol"
      style="padding:24px;"
    >
      <component :is="RoleComponents[item.role]" :item="item" />
    </li>
  </ul>
</template>
