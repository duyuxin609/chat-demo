import copyToClipboard from 'copy-to-clipboard'

export function copy(content?: string | null, format?: string) {
  if (content) {
    copyToClipboard(content.trim(), { format: format ?? 'text/plain' })
  }
}

export function parseJson(text = ''): any {
  if (!text)
    return undefined
  try {
    return JSON.parse(text.trim())
  }
  catch {
    return undefined
  }
}

export async function sleep(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}
