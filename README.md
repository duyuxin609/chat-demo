# AI 会话渲染 Demo（直连 epsilon-openapi）

从 epsilon-web 提取的 AI 会话（流式对话）前端渲染逻辑独立 Demo，**直接对接 epsilon-openapi 的 `/v1/sessions` 接口**，不经过 epsilon-be。

## 快速开始

```bash
npm install        # 或 pnpm install（@futuregene/vue-remark 已 vendor，无需凭证）
npm run dev        # 默认端口 5173
```

打开 http://localhost:5173 ，页面上有两种进入方式：

1. **已有会话 ID** — 填 Token + `session_id`，进入后自动加载历史。
2. **新开会话** — 填 Token + 模式（`attachment_id` **可选**：填了绑定报告附件，不填创建独立的通用助手会话），demo 会先调 `POST /v1/sessions` 创建会话再进入。

## 配置后端地址

打开 `vite.config.ts`，把代理 `target` 改成你的 epsilon-openapi 地址（也可以通过环境变量 `VITE_API_TARGET` 指定，默认 `http://localhost:8172`）：

```ts
server: {
  proxy: {
    '/v1': {
      target: 'http://你的openapi地址:端口',   // ← 改这里
      changeOrigin: true,
    },
  },
}
```

> 前端请求 `/v1/*` 会被转发到 `${target}/v1/*`，开发期无跨域问题。
> 若要让前端**直连**后端，改 `src/apis/chat.ts` 的 `chatConfig.baseUrl` 为完整地址（如 `http://你的openapi地址:端口/v1`），此时需后端配 CORS。

## 鉴权

所有接口走统一的 Token 鉴权：

```
Authorization: Bearer {token}
language: zh-cn          # openapi 用 language 头（zh-cn / en-us），不是 Accept-Language
```

Token 在页面顶部填写，存于浏览器 localStorage（key: `CHAT_DEMO_TOKEN`）。

## 后端接口协议（epsilon-openapi）

### 1. 创建会话 `POST /v1/sessions`

```json
// 请求（attachment_id 可选）
{ "attachment_id": "A123456", "mode": "herita" }
// 或不传 attachment_id 创建独立会话：
{ "mode": "herita" }

// 响应
{ "session_id": "123456" }
```

- `attachment_id` **可选**：
  - 传了 → 绑定该报告附件，附件必须属于当前用户且**处理完成**，否则返回 `CodeAttachmentNotFinished`。
  - 不传 → 创建不绑定报告的**独立会话**（通用助手）。
- `mode` 可选（`herita` / `herita-interpret`）。scene 默认值规则：显式 `mode` 优先；未指定时，绑报告的会话默认 `herita-interpret`，无附件独立会话默认 `herita`。
- 创建会话会**扣配额**，失败自动退款。

### 2. 流式对话 `POST /v1/sessions/{id}/chat`

```json
// 请求（注意字段是 query，不是 messages）
{ "query": "用户的问题" }
```

- 响应 `Content-Type: text/event-stream`（SSE）。
- 报告内容（附件 Markdown）和历史消息由**后端自动带入上下文**，前端无需传历史。
- 会话有轮次上限（`MaxTurns`），超限返回错误。

**SSE 事件格式**（与渲染层约定）：

| event | data | 说明 |
|---|---|---|
| `msg_id` | 数字 | 一条助手消息开始 |
| *(空)* | 文本片段 | 增量正文，追加到 content |
| `meta` | JSON | `{"toolcall":{...}}` 工具调用 / `{"finish":1}` 结束 / `{"error":"..."}` 错误 |
| `debug` | 文本 | 调试信息（生产模式被过滤） |

**meta 中 toolcall 结构**：

```json
{"toolcall": {
  "id": "call_xxx",
  "name": "工具名",
  "class": "think",
  "database": "数据库名",
  "arguments": {...},
  "call_summary": "调用摘要",
  "result": "...",
  "result_summary": "结果摘要",
  "status": 2,
  "start_at": 1729000000000,
  "end_at": 1729000001000
}}
```

**错误**：非 SSE 时返回 `{ "message": "错误信息" }`（无 code 包装，HTTP 状态码即错误码）。轮次超限返回 `session conversation limit exceeded (n/m)`。

### 3. 会话详情（含历史）`GET /v1/sessions/{id}`

```json
// 响应 SessionDetail
{
  "id": "123456",
  "mode": "herita",
  "context": {...},
  "messages": [
    { "role": "user", "content": "...", "finished": true, "id": "1" },
    {
      "role": "assistant",
      "content": "...",
      "finished": true,
      "id": "2",
      "toolCalls": [
        { "id": "...", "name": "...", "call_summary": "...", "result": "...", "status": 2, "end_at": 1729000001000 }
      ]
    }
  ],
  "updatedAt": "...", "createdAt": "..."
}
```

> 历史里 `toolCalls` 是 camelCase 键（`call_summary`/`result_summary`/`end_at` 等仍可能是 snake_case），demo 的 `convertToolCall` 已兼容两种命名。

## 渲染能力说明

| 能力 | 说明 |
|---|---|
| 流式输出 | SSE 增量文本实时渲染 |
| Markdown | GFM 表格、代码块（复制）、KaTeX 公式（CDN 懒加载） |
| 引用标记 `[[hash8]]` | 正文 `[[a1b2c3d4]]` 渲染为角标，点击弹证据详情 |
| 证据收集 | 自动从工具调用 result 的 `evidence_list` 收集证据 |
| 工具调用卡片 | 调用摘要、耗时、状态点，可展开 Input/Output（JSON 高亮） |
| 卡片内嵌正文 | 工具调用通过 `[[teleport:id]]` 占位插入正文指定位置 |
| 中止 | 对话中可点击 ■ 中止（AbortController） |
| 思考提示 | 流式停顿超 3 秒显示「正在思考...」 |
| 历史加载 | 进入会话自动拉取 `GET /v1/sessions/{id}` |

### 证据列表（evidence_list）格式

工具调用 result 中如含 `evidence_list`，前端自动收集用于 `[[hash]]` 引用渲染：

```json
{
  "evidence_list": [
    {
      "hash": "a1b2c3d4",
      "evidence": "证据内容（支持 Markdown）",
      "source": "来源",
      "source_url": "https://...",
      "link": "https://..."
    }
  ]
}
```

正文出现 `[[a1b2c3d4]]` 时渲染为可点击角标；无对应证据的引用会被剔除。

## 嵌入到你自己的页面

核心组件是 `src/components/chat/ChatPanel.vue`：

```vue
<script setup>
import ChatPanel from '@/components/chat/ChatPanel.vue'
</script>

<template>
  <div style="height: 600px;">
    <!-- no 就是 session_id -->
    <ChatPanel no="你的session_id" welcome="你好！" />
  </div>
</template>
```

同时复制 `src/apis/chat.ts` 并配好 `chatConfig.baseUrl` 与 token。

## 依赖说明

- `vue` 3.5+
- `@futuregene/vue-remark` — Markdown 渲染引擎（**已 vendor 在 `vendor/vue-remark`，本地 file: 依赖，无需任何凭证**）
- `@microsoft/fetch-event-source` — SSE 客户端
- `naive-ui` — UI 组件库
- `@vueuse/core` — 工具函数
- `lodash-es` — clone/flatten

> `@futuregene/vue-remark` 是内部私有包（GitHub Packages）。本 demo 已将其完整拷贝到 `vendor/vue-remark` 并通过 `file:` 本地引用，`npm install` 即可，不访问私有 registry。

## 构建

```bash
npm run build     # 输出到 dist/
npm run preview   # 本地预览构建产物
```

生产部署：把 `dist/` 交给静态服务器，并配反向代理把 `/v1` 转发到 epsilon-openapi：

```nginx
location /v1/ {
    proxy_pass http://你的openapi地址:端口;
    proxy_set_header Authorization $http_authorization;  # 透传鉴权头
    # SSE 需要
    proxy_buffering off;
    proxy_cache off;
}
```

## 与 epsilon-web 的差异（重要）

| 维度 | 本 demo（直连 openapi） | epsilon-web（经 epsilon-be） |
|---|---|---|
| 发消息字段 | `query` | `messages` |
| 会话 ID | URL 路径 `/sessions/{id}` | 请求体 `id` |
| 建会话 | `POST /v1/sessions`（需 attachment_id） | 无独立接口 |
| 深度研究 | **不支持**（openapi 无此参数） | 有 `enable_deep_research` |
| 语言头 | `language` | `Accept-Language` |
| 上下文 | 后端自动带报告 Markdown | 前端拼 |
| 错误格式 | `{message}`（无 code） | `{code, message, data}` 包装 |
