export enum Role {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
}

export enum ToolCallStatus {
  Running = 1,
  Finished = 2,
  Error = 3,
}

export interface ToolCall {
  id: string
  class?: string
  name?: string
  database?: string
  arguments?: Record<string, any>
  callSummary?: string
  result?: any
  resultSummary?: string
  status?: ToolCallStatus
  startAt?: number
  endAt?: number
}

export interface MessageBase {
  role: Role
  content: string
}

export interface Message extends MessageBase {
  symbol: symbol
  toolCalls?: ToolCall[]
  error?: boolean
  errorMessage?: string
  abort?: boolean
  debug?: string[]
  finished: boolean
}

export interface ChatRequest {
  id: string
  messages: string
  enable_deep_research?: boolean
}
