export class HttpError extends Error {
  status: number
  statusText?: string
  code?: string
  message: string
  data?: any

  constructor({ status, statusText, code, message, data }: {
    status: number
    statusText?: string
    code?: string
    message?: string
    data?: any
  }) {
    super(message)
    this.status = status
    this.statusText = statusText
    this.code = code
    this.message = message || statusText || 'network error'
    this.data = data
  }
}
