<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  /** 合并后的思考内容（不含 <think> 标签） */
  text: string
  /** 是否仍在思考（流式中还没出现 </think>） */
  streaming?: boolean
}>()

// 流式中默认展开，思考结束自动收起
const open = ref(!!props.streaming)
watch(() => props.streaming, (v) => {
  open.value = !!v
})
</script>

<template>
  <!-- 外形与工具调用卡片保持一致：40px 灰底标题栏 + 浅灰内容区 -->
  <div style="margin:16px 0 24px;border:1px solid #e5e5e5;border-radius:4px;background:#fafafa;box-shadow:0 1px 2px 0 rgb(0 0 0 / 0.05);">
    <div
      style="height:40px;padding:0 12px;background:#f5f5f5;display:flex;justify-content:space-between;align-items:center;gap:8px;cursor:pointer;font-size:14px;"
      @click="open = !open"
    >
      <div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        思考过程
      </div>
      <div style="display:flex;align-items:center;gap:8px;min-width:56px;justify-content:flex-end;font-size:12px;color:#6b7280;">
        <span v-if="streaming" style="display:inline-flex;align-items:center;gap:4px;color:#009dab;">
          思考中
          <span class="think-dot" />
          <span class="think-dot" style="animation-delay:200ms" />
          <span class="think-dot" style="animation-delay:400ms" />
        </span>
        <span>{{ open || streaming ? '收起' : '展开' }}</span>
        <span style="color:#cbd5e1;font-size:11px;">{{ open || streaming ? '▲' : '▼' }}</span>
      </div>
    </div>

    <div
      v-show="open || streaming"
      style="padding:12px;font-size:13px;line-height:1.75;color:#6b7280;white-space:pre-wrap;overflow-wrap:anywhere;max-height:320px;overflow-y:auto;"
    >
      {{ text }}
    </div>
  </div>
</template>

<style scoped>
.think-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: think-dot-flow 1.2s ease-in-out infinite;
}

@keyframes think-dot-flow {
  0%, 100% { opacity: 0.2; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-2px); }
}
</style>
