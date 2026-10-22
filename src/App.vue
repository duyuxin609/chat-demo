<script setup lang="ts">
import { NButton, NCard, NConfigProvider, NInput, NRadioButton, NRadioGroup, zhCN } from 'naive-ui'
import { ref } from 'vue'
import { chatConfig, createSession } from '@/apis/chat'
import ChatPanel from '@/components/chat/ChatPanel.vue'

// 接入方式：existing=直接用已有 session_id；new=用 attachment_id 新开会话
const entryMode = ref<'existing' | 'new'>('existing')
const token = ref(localStorage.getItem('CHAT_DEMO_TOKEN') || '')
const sessionId = ref(localStorage.getItem('CHAT_DEMO_SESSION') || '')
const attachmentId = ref(localStorage.getItem('CHAT_DEMO_ATTACHMENT') || '')
const chatMode = ref(localStorage.getItem('CHAT_DEMO_MODE') || 'herita')

const activeSessionId = ref('')
const started = ref(false)
const creating = ref(false)
const createError = ref('')

async function start() {
  localStorage.setItem('CHAT_DEMO_TOKEN', token.value)
  localStorage.setItem('CHAT_DEMO_SESSION', sessionId.value)
  localStorage.setItem('CHAT_DEMO_ATTACHMENT', attachmentId.value)
  localStorage.setItem('CHAT_DEMO_MODE', chatMode.value)
  createError.value = ''

  if (entryMode.value === 'existing') {
    activeSessionId.value = sessionId.value.trim()
    started.value = true
    return
  }

  // 新开会话：调 POST /v1/sessions 拿 session_id
  creating.value = true
  try {
    const id = await createSession({
      attachment_id: attachmentId.value.trim(),
      ...(chatMode.value ? { mode: chatMode.value } : {}),
    })
    if (!id) throw new Error('后端未返回 session_id')
    activeSessionId.value = id
    sessionId.value = id // 记下来，下次可直接用 existing 模式
    started.value = true
  }
  catch (e: any) {
    createError.value = e?.message || '创建会话失败'
  }
  finally {
    creating.value = false
  }
}

function reset() {
  started.value = false
  createError.value = ''
}

const canStart = () => {
  if (!token.value.trim()) return false
  if (entryMode.value === 'existing') return !!sessionId.value.trim()
  return true // 新开会话：attachment_id 可选，只要 token 即可
}
</script>

<template>
  <NConfigProvider :locale="zhCN">
    <div style="height:100%;display:flex;flex-direction:column;">
      <!-- 配置栏 -->
      <div style="padding:12px 24px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
        <strong style="font-size:16px;">AI 会话 Demo（直连 OpenAPI）</strong>

        <template v-if="!started">
          <NRadioGroup v-model:value="entryMode" size="small">
            <NRadioButton value="existing">
              已有会话 ID
            </NRadioButton>
            <NRadioButton value="new">
              新开会话
            </NRadioButton>
          </NRadioGroup>

          <NInput
            v-model:value="token"
            placeholder="鉴权 Token（Bearer）"
            style="width:300px;"
            size="small"
            type="password"
            show-password-on="click"
          />

          <NInput
            v-if="entryMode === 'existing'"
            v-model:value="sessionId"
            placeholder="会话 ID（session_id）"
            style="width:220px;"
            size="small"
          />

          <template v-else>
            <NInput
              v-model:value="attachmentId"
              placeholder="附件 ID（可选，不填=独立会话）"
              style="width:240px;"
              size="small"
            />
            <NRadioGroup v-model:value="chatMode" size="small">
              <NRadioButton value="herita">
                herita
              </NRadioButton>
              <NRadioButton value="herita-interpret">
                herita-interpret
              </NRadioButton>
            </NRadioGroup>
          </template>

          <NButton type="primary" size="small" :loading="creating" :disabled="!canStart()" @click="start">
            {{ entryMode === 'new' ? '创建并开始' : '开始会话' }}
          </NButton>
          <span v-if="createError" style="color:#dc2626;font-size:12px;">{{ createError }}</span>
        </template>

        <template v-else>
          <span style="color:#6b7280;font-size:13px;">会话 ID：<strong>{{ activeSessionId }}</strong></span>
          <NButton size="small" @click="reset">
            重新配置
          </NButton>
        </template>

        <span style="color:#9ca3af;font-size:12px;margin-left:auto;">
          API 前缀：{{ chatConfig.baseUrl }}（在 vite.config.ts 配代理 target）
        </span>
      </div>

      <!-- 聊天区 -->
      <div style="flex:1;overflow:hidden;">
        <div v-if="!started" style="height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;">
          <NCard style="max-width:560px;text-align:left;">
            <p style="font-size:14px;line-height:1.9;margin:0;">
              <strong>对接 epsilon-openapi 的两种方式：</strong><br>
              ① <strong>已有会话 ID</strong>：直接填 <code>session_id</code>，进入后自动加载历史。<br>
              ② <strong>新开会话</strong>：<code>attachment_id</code> <strong>可选</strong>。填了则绑定该报告附件（需处理完成）；
              不填则创建<strong>独立会话</strong>（通用助手，默认 scene 为 herita）。demo 会先调
              <code>POST /v1/sessions</code> 创建会话再进入对话。<br><br>
              Token 存于浏览器 localStorage（key: CHAT_DEMO_TOKEN）。<br>
              开发环境下 <code>/v1</code> 请求被 vite proxy 转发到 vite.config.ts 配置的 openapi 地址。
            </p>
          </NCard>
        </div>
        <ChatPanel v-else :no="activeSessionId" welcome="你好，有任何问题都可以向我提问！" />
      </div>
    </div>
  </NConfigProvider>
</template>
