#!/usr/bin/env node
/**
 * 经 GitHub Git Data API 推送 —— 当 git 协议经代理不通时的备用通道。
 * 用法：node .push-via-api.mjs <token> <owner/repo> <localDir>
 * 只推 main 一个分支；不做增量（空仓一次性建树）。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const [, , TOKEN, SLUG, DIR] = process.argv
if (!TOKEN || !SLUG || !DIR) { console.error('参数缺失'); process.exit(2) }
const API = `https://api.github.com/repos/${SLUG}`
const H = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'mca-ch-pusher',
}

async function call(path, method = 'GET', body) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(`${API}${path}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined })
      const txt = await r.text()
      if (!r.ok) throw new Error(`${r.status} ${txt.slice(0, 300)}`)
      return txt ? JSON.parse(txt) : null
    } catch (e) {
      if (i === 3) throw e
      await new Promise(r => setTimeout(r, 1500 * (i + 1)))
    }
  }
}

const SKIP = new Set(['.git'])
function walk(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue
    const p = join(d, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

// 二进制检测：含 NUL 即按 base64，否则按 utf-8 文本（保证行尾不被改写）
const isBinary = (buf) => buf.includes(0)

const files = walk(DIR).map(abs => ({ abs, rel: relative(DIR, abs).split(sep).join('/') }))
console.log(`待上传 ${files.length} 个文件`)

// 1) blobs（串行小并发，避免限流）
const tree = []
const CONC = 6
for (let i = 0; i < files.length; i += CONC) {
  const batch = files.slice(i, i + CONC)
  const res = await Promise.all(batch.map(async ({ abs, rel }) => {
    const buf = readFileSync(abs)
    const body = isBinary(buf)
      ? { content: buf.toString('base64'), encoding: 'base64' }
      : { content: buf.toString('utf8'), encoding: 'utf-8' }
    const blob = await call('/git/blobs', 'POST', body)
    return { path: rel, mode: '100644', type: 'blob', sha: blob.sha }
  }))
  tree.push(...res)
  process.stdout.write(`  blobs ${Math.min(i + CONC, files.length)}/${files.length}\r`)
}
console.log('')

// 2) tree（不带 base_tree：空仓）
const t = await call('/git/trees', 'POST', { tree })
console.log('tree:', t.sha)

// 3) commit
const msg = readFileSync(join(DIR, '.commit-msg.txt'), 'utf8')
// 空仓已由 Contents API 建了首个提交 ⇒ 必须把它作为 parent，否则历史断开
const head = await call('/git/ref/heads/main')
const c = await call('/git/commits', 'POST', { message: msg, tree: t.sha, parents: [head.object.sha] })
console.log('commit:', c.sha)

// 4) ref
await call('/git/refs/heads/main', 'PATCH', { sha: c.sha, force: true })
console.log('ref refs/heads/main ->', c.sha)
console.log('DONE ' + c.sha)
