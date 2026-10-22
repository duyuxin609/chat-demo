import type { ChatRequest, Message, ToolCall } from '@/types/chat'
import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source'
import { clone } from 'lodash-es'
import { HttpError } from '@/types/error'
import { Role } from '@/types/chat'
import { parseJson } from '@/utils/misc'

/**
 * Demo 配置：客户只需修改这里
 * - baseUrl: epsilon-openapi 的 API 前缀（默认 '/v1'，开发环境通过 vite proxy 转发到 openapi 服务）
 * - getToken: 返回鉴权 token（openapi 用 `Authorization: Bearer {token}`）
 */
export const chatConfig = {
  baseUrl: '/v1',
  getToken: (): string => localStorage.getItem('CHAT_DEMO_TOKEN') || '',
  /** language 请求头：zh-cn / en-us（openapi 用的是 language 头，不是 Accept-Language） */
  getLanguage: (): string => 'zh-cn',
}

function authHeaders(): Record<string, string> {
  const token = chatConfig.getToken()
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'language': chatConfig.getLanguage(),
  }
}

function mergeToolCalls(current: ToolCall[], incoming: ToolCall): ToolCall[] {
  const index = current.findIndex(item => item.id === incoming.id)
  if (index >= 0) {
    current.splice(index, 1, Object.assign({}, current[index], incoming))
  }
  else {
    current.push(incoming)
  }
  return Array.from(current)
}

/** 兼容 snake_case / camelCase 两种字段命名 */
function convertToolCall(toolCall: any): ToolCall {
  return {
    id: toolCall.id,
    class: toolCall.class,
    name: toolCall.name,
    database: toolCall.database,
    arguments: toolCall.arguments,
    callSummary: toolCall.call_summary ?? toolCall.callSummary,
    result: toolCall.result,
    resultSummary: toolCall.result_summary ?? toolCall.resultSummary,
    status: toolCall.status,
    startAt: toolCall.start_at ?? toolCall.startAt,
    endAt: toolCall.end_at ?? toolCall.endAt,
  }
}

/** openapi 的错误响应是 {message}（无 code 包装），HTTP 状态码即错误码 */
async function throwOnError(response: Response): Promise<void> {
  if (response.ok) return
  const body = await response.json().catch(() => null)
  throw new HttpError({
    status: response.status,
    statusText: response.statusText,
    code: body?.code?.toString(),
    message: body?.message || response.statusText || '',
    data: body?.data,
  })
}

export interface CreateSessionParams {
  /** 附件 ID（报告文件，必填，且附件必须处理完成） */
  attachment_id: string
  /** 会话模式：herita / herita-interpret（可选） */
  mode?: string
}

/**
 * 1. 创建会话  POST {baseUrl}/sessions
 * 返回 session_id（后续 chat / detail 的 {id}）
 */
export async function createSession(params: CreateSessionParams): Promise<string> {
  const response = await fetch(`${chatConfig.baseUrl}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({
      // attachment_id 可选：缺省/空串时后端创建不绑定报告的独立会话
      ...(params.attachment_id ? { attachment_id: params.attachment_id } : {}),
      ...(params.mode ? { mode: params.mode } : {}),
    }),
  })
  await throwOnError(response)
  const body = await response.json()
  return String(body?.session_id ?? body?.data?.session_id ?? '')
}

/**
 * 2. 流式对话  POST {baseUrl}/sessions/{id}/chat
 * 请求体：{ query }（注意：不是 messages）
 * SSE 事件：msg_id / (空)=增量正文 / meta{toolcall,finish,error} / debug
 */
export async function chat(
  request: ChatRequest,
  controller: AbortController,
  callback: (data: Message) => void,
): Promise<Message> {
  const data: Message = {
    symbol: Symbol('chat'),
    role: Role.Assistant,
    content: '',
    toolCalls: [],
    error: false,
    abort: false,
    debug: [],
    finished: false,
  }

  await fetchEventSource(`${chatConfig.baseUrl}/sessions/${encodeURIComponent(request.id)}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({
      query: request.messages,
    }),
    signal: controller.signal,
    openWhenHidden: true,
    async onopen(response) {
      if (response.ok && response.headers.get('content-type') === EventStreamContentType) {
        return
      }
      await throwOnError(response)
      // 既不是 SSE 也不是可识别的错误，按文本错误抛出
      const text = await response.text()
      throw new HttpError({
        status: response.status,
        statusText: response.statusText,
        message: text || response.statusText || '',
      })
    },
    onmessage(ev) {
      switch (ev.event) {
        case 'msg_id':
          callback(clone(data))
          break
        case '': // EventMsg 默认事件：增量正文
          data.content = data.content + ev.data
          break
        case 'meta': {
          const metaData = parseJson(ev.data) as Partial<Record<string, any>>
          Object.keys(metaData).forEach((key) => {
            if (key === 'toolcall') {
              const incoming = convertToolCall(metaData[key])
              data.toolCalls = mergeToolCalls(data.toolCalls || [], incoming)
            }
            else if (key === 'finish') {
              if (metaData[key] === 1) data.finished = true
            }
            else if (key === 'error') {
              data.error = true
              data.errorMessage = String(metaData[key] ?? '对话出错')
            }
          })
          break
        }
        case 'debug': {
          data.debug?.push(ev.data)
          break
        }
      }
      callback(clone(data))
    },
    onerror(error) {
      throw error // 禁止自动重试
    },
  }).catch((error) => {
    if (controller.signal.aborted) {
      data.abort = true
      data.error = false
    }
    else {
      data.error = true
      data.errorMessage = error instanceof HttpError ? error.message : (data.errorMessage || '对话错误，请稍后重试')
    }
    if (!(error instanceof HttpError) && !controller.signal.aborted) console.error(error)
  })
  data.finished = true
  return clone(data)
}

/**
 * 3. 获取会话详情（含历史）  GET {baseUrl}/sessions/{id}
 * 响应 SessionDetail：{ id, mode, context, messages[], updatedAt, createdAt }
 * messages[].toolCalls 是 camelCase 结构（call_summary/result_summary 仍可能是 snake_case）
 */
export async function getChatHistory(sessionId: string): Promise<{ messages: Message[], enableDeepResearch: boolean }> {
  const response = await fetch(`${chatConfig.baseUrl}/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  await throwOnError(response)
  const body = await response.json()
  const detail = body?.data ?? body
  const messages = detail?.messages || []
  return {
    messages: messages.map((msg: any) => {
      const { id, tool_calls, toolCalls, ...rest } = msg
      const rawToolCalls = tool_calls || toolCalls || []
      return {
        ...rest,
        symbol: Symbol('chat'),
        toolCalls: rawToolCalls.map(convertToolCall),
        finished: true,
      } as Message
    }),
    enableDeepResearch: false, // openapi 的 session 无 enable_deep_research 概念
  }
}
