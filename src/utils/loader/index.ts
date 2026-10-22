// 简易 CDN 脚本/CSS 加载器
function loadJS(url: string, globalName?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (globalName && (window as any)[globalName]) {
      resolve((window as any)[globalName])
      return
    }
    const script = document.createElement('script')
    script.src = url
    script.onload = () => resolve(globalName ? (window as any)[globalName] : undefined)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function loadCSS(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.onload = () => resolve()
    link.onerror = reject
    document.head.appendChild(link)
  })
}

let hljsInstance: Promise<any> | null = null
export async function loadHighlight() {
  if (!hljsInstance) {
    hljsInstance = Promise.all([
      loadJS('https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/highlight.min.js', 'hljs'),
      loadCSS('https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css'),
    ]).then(([hljs]) => hljs)
  }
  return hljsInstance
}

let katexInstance: Promise<any> | null = null
export async function loadKatex() {
  if (!katexInstance) {
    // 用变量存 URL，避免 TS/vite 静态解析远程模块
    const katexUrl = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/katex.mjs'
    katexInstance = Promise.all([
      import(/* @vite-ignore */ katexUrl),
      loadCSS('https://cdn.jsdelivr.net/npm/katex@0.16.22/katex.min.css'),
    ]).then(([m]) => (m as any).default ?? m)
  }
  return katexInstance
}
