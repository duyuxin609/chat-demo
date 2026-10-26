/**
 * 工具超时概率测试脚本
 * 对同一个会触发大量工具调用的问题，并发/串行发起 N 次会话，
 * 统计每次：耗时、是否报错、卡死的工具、是否跑完。
 *
 * 用法：
 *   node scripts/test-timeout.mjs [次数] [并发数]
 * 环境变量：
 *   OPENAPI_BASE  默认 http://localhost:8172
 *   OPENAPI_TOKEN 必填（openapi 的 Bearer 令牌）
 *   QUERY         默认会触发工具调用的问题
 */

const BASE = process.env.OPENAPI_BASE || 'http://localhost:8172'
const TOKEN = process.env.OPENAPI_TOKEN || ''
if (!TOKEN) {
  console.error('缺少环境变量 OPENAPI_TOKEN（openapi 的 Bearer 令牌）')
  process.exit(1)
}
const TOTAL = parseInt(process.argv[2] || '8', 10)
const CONCURRENCY = parseInt(process.argv[3] || '2', 10)
const QUERY = process.env.QUERY || 'COL11A2:6:33,132,181:C>T 解释一下这个变异'
// 单次会话最长等待（超过则判定为"卡死/超时"）
const HARD_TIMEOUT_MS = parseInt(process.env.HARD_TIMEOUT_MS || '420000', 10) // 7 分钟

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
  'language': 'zh-cn',
}

async function createSession() {
  const r = await fetch(`${BASE}/v1/sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ mode: 'herita' }),
  })
  const j = await r.json()
  const id = j?.data?.session_id
  if (!id) throw new Error('建会话失败: ' + JSON.stringify(j))
  return String(id)
}

// 解析 SSE 流，记录工具调用与耗时
async function runOnce(index) {
  const sessionId = await createSession()
  const start = Date.now()
  const toolCalls = new Map() // id -> {name, status, startAt, endAt}
  let contentLen = 0
  let finished = false
  let errorInfo = null
  let lastEventAt = Date.now()
  const timeline = []

  const controller = new AbortController()
  const hardTimer = setTimeout(() => controller.abort(), HARD_TIMEOUT_MS)

  try {
    const resp = await fetch(`${BASE}/v1/sessions/${sessionId}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: QUERY }),
      signal: controller.signal,
    })
    if (!resp.ok || !resp.body) {
      const t = await resp.text().catch(() => '')
      throw new Error(`HTTP ${resp.status}: ${t.slice(0, 200)}`)
    }

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    let curEvent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      lastEventAt = Date.now()
      buf += decoder.decode(value, { stream: true })

      // 按行解析 SSE
      let idx
      while ((idx = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, idx).replace(/\r$/, '')
        buf = buf.slice(idx + 1)
        if (line === '') { curEvent = ''; continue }
        if (line.startsWith('event:')) { curEvent = line.slice(6).trim(); continue }
        if (!line.startsWith('data:')) continue
        const data = line.slice(5).trimStart()

        if (curEvent === 'meta' || (curEvent === '' && data.startsWith('{'))) {
          let obj = null
          try { obj = JSON.parse(data) } catch {}
          if (obj) {
            if (obj.toolcall) {
              const tc = obj.toolcall
              const prev = toolCalls.get(tc.id) || {}
              toolCalls.set(tc.id, { ...prev, ...tc })
            }
            if (obj.finish === 1) finished = true
            if (obj.error) errorInfo = String(obj.error)
          }
        } else if (curEvent === '' || curEvent === 'msg') {
          contentLen += data.length
        }
      }
    }
  } catch (e) {
    if (controller.signal.aborted) {
      errorInfo = `HARD_TIMEOUT(${HARD_TIMEOUT_MS / 1000}s无新数据判卡死)`
    } else {
      errorInfo = String(e?.message || e)
    }
  } finally {
    clearTimeout(hardTimer)
  }

  const elapsedMs = Date.now() - start
  // 统计工具
  const tools = [...toolCalls.values()]
  const running = tools.filter(t => Number(t.status) === 1)
  const toolStats = {}
  for (const t of tools) {
    const n = t.name || '?'
    toolStats[n] = (toolStats[n] || 0) + 1
  }
  return {
    index,
    sessionId,
    elapsedMs,
    elapsedSec: (elapsedMs / 1000).toFixed(1),
    finished,
    errorInfo,
    contentLen,
    toolTotal: tools.length,
    toolStats,
    runningTools: running.map(t => t.name),
    idleSec: ((Date.now() - lastEventAt) / 1000).toFixed(1),
  }
}

function fmt(r) {
  const tag = r.errorInfo ? '❌' : (r.finished ? '✅' : '⚠️')
  const tools = Object.entries(r.toolStats).map(([k, v]) => `${k.replace('raremcp-', '')}×${v}`).join(' ')
  const running = r.runningTools.length ? ` | Running: ${r.runningTools.join(',')}` : ''
  return `${tag} #${r.index} ${r.elapsedSec}s | 工具${r.toolTotal}次 [${tools}]${running} | ${r.errorInfo || (r.finished ? 'OK' : '未完')} | clen=${r.contentLen}`
}

async function main() {
  console.log(`测试目标: ${BASE}`)
  console.log(`问题: ${QUERY}`)
  console.log(`总次数: ${TOTAL}, 并发: ${CONCURRENCY}, 单次的卡死阈值: ${HARD_TIMEOUT_MS / 1000}s\n`)

  const results = []
  let i = 0
  while (i < TOTAL) {
    const batch = []
    for (let c = 0; c < CONCURRENCY && i < TOTAL; c++, i++) {
      batch.push(runOnce(i + 1))
    }
    const rs = await Promise.all(batch)
    for (const r of rs) {
      results.push(r)
      console.log(fmt(r))
    }
  }

  // 汇总
  console.log('\n===== 汇总 =====')
  const ok = results.filter(r => r.finished && !r.errorInfo)
  const timeout = results.filter(r => r.errorInfo && r.errorInfo.includes('TIMEOUT'))
  const withRunning = results.filter(r => r.runningTools.length > 0)
  const errored = results.filter(r => r.errorInfo)
  console.log(`总数: ${results.length}`)
  console.log(`正常完成: ${ok.length}`)
  console.log(`出错(含卡死): ${errored.length}`)
  console.log(`判卡死(HARD_TIMEOUT): ${timeout.length}`)
  console.log(`结束时仍有工具Running: ${withRunning.length}`)
  const times = results.map(r => r.elapsedMs).sort((a, b) => a - b)
  if (times.length) {
    const p = q => (times[Math.min(times.length - 1, Math.floor(q * times.length))] / 1000).toFixed(1)
    console.log(`耗时分布(s): min=${(times[0] / 1000).toFixed(1)} p50=${p(0.5)} p90=${p(0.9)} max=${(times[times.length - 1] / 1000).toFixed(1)}`)
  }
  // 卡死工具分布
  const runningCount = {}
  for (const r of withRunning) for (const n of r.runningTools) runningCount[n] = (runningCount[n] || 0) + 1
  if (Object.keys(runningCount).length) {
    console.log(`结束时仍Running的工具分布:`, runningCount)
  }
  console.log(`\n超时/失败概率 = ${(errored.length / results.length * 100).toFixed(1)}%`)
}

main().catch(e => { console.error('脚本错误:', e); process.exit(1) })
