import type { Cite, Plugin } from '@futuregene/vue-remark'

// Micromark 扩展：解析 [[a1b2c3d4]] 引用语法
const cite = {
  name: 'cite',
  tokenize: tokenizeCite,
}

const codeA = 'a'.charCodeAt(0)
const codeZ = 'z'.charCodeAt(0)
const code0 = '0'.charCodeAt(0)
const code9 = '9'.charCodeAt(0)

function tokenizeCite(effects: any, ok: any, nok: any) {
  return start

  function start(code: any) {
    if (code !== 91) {
      return nok(code) // '['
    }
    effects.enter('cite')
    effects.enter('citeSequence')
    effects.consume(code)
    return openSecond
  }

  function openSecond(code: any) {
    if (code !== 91) {
      return nok(code)
    }
    effects.consume(code)
    effects.exit('citeSequence')
    effects.enter('citeText')
    return text
  }

  function text(code: any) {
    if (code !== null && ((code >= code0 && code <= code9) || (code >= codeA && code <= codeZ))) {
      effects.consume(code)
      return text
    }
    if (code === 93) { // ']'
      effects.exit('citeText')
      effects.enter('citeSequence')
      effects.consume(code)
      return closeSecond
    }
    return nok(code)
  }

  function closeSecond(code: any) {
    if (code !== 93) {
      return nok(code)
    }
    effects.consume(code)
    effects.exit('citeSequence')
    effects.exit('cite')
    return checkNotLink
  }

  function checkNotLink(code: any) {
    if (code === 40) { // '(' → 交给链接解析器
      return nok(code)
    }
    return ok(code)
  }
}

export function citeHtml() {
  return { text: { 91: cite } }
}

export function citeFromMarkdown() {
  return {
    enter: { cite: enterCite },
    exit: { cite: exitCite, citeText: exitCiteText },
  }
}

function enterCite(this: any, token: any) {
  this.enter({ type: 'cite', value: '' }, token)
}

function exitCite(this: any, token: any) {
  this.exit(token)
}

function exitCiteText(this: any, token: any) {
  const node = this.stack[this.stack.length - 1] as Cite
  node.value = this.sliceSerialize(token)
}

export function citeToMarkdown() {
  return {
    handlers: {
      cite: (node: Cite): string => `[[${node.value}]]`,
    },
  }
}

const remarkCite: Plugin = function () {
  const data = this.data() as any
  const add = (field: string, value: any): void => {
    const list = data[field] ? data[field] : (data[field] = [])
    list.push(value)
  }
  add('micromarkExtensions', citeHtml())
  add('fromMarkdownExtensions', citeFromMarkdown())
  add('toMarkdownExtensions', citeToMarkdown())
}

export default remarkCite
