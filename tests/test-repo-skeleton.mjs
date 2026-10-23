#!/usr/bin/env node
/**
 * 仓库骨架自检 —— 断言「AI 优先的骨架层」在位且链接可解析。
 *
 * 为什么要单独一层：check-pack 管的是「包对不对」（十个维度、门禁绑定、DAG），
 * 这一层管的是「仓库骨架对不对」（AI 入口页在不在、文档互相指向的文件在不在）。
 * 两者是不同的失败模式，混在一起就有一类永远没人查。
 *
 * 跑法：node tests/test-repo-skeleton.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

let failed = 0
const ok = (m) => console.log('ok   ' + m)
const bad = (m) => { failed++; console.log('FAIL ' + m) }

// ---------------------------------------------------------------- 1. 骨架层必须在位
const REQUIRED = [
  'AGENTS.md',              // AI 入口页
  'AGENTS.en.md',          // 英文版
  'llms.txt',              // 机器可读索引
  'NOTICE',                // 署名
  'README.md',
  'README.en.md',
  'LICENSE',
  'CRITERIA.md',
  'docs/architecture.md',
  'docs/status.md',
  'docs/decisions.md',
  'docs/roadmap.md',
  'docs/threat-model.md',
  'spec/contracts.md',
  'spec/provenance.md',
  'examples/README.md',
  'examples/minimal-board/README.md',
  'examples/gate-triage/README.md',
  '.github/workflows/check.yml',
]
for (const rel of REQUIRED) {
  existsSync(join(ROOT, rel)) ? ok(`骨架层在位：${rel}`) : bad(`骨架层缺失：${rel}`)
}

// ---------------------------------------------------------------- 2. 文档里的相对链接必须可解析
const DOCS = REQUIRED.filter(f => f.endsWith('.md')).concat(['llms.txt'])
const LINK = /\]\(([^)#]+?)(?:#[^)]*)?\)/g
for (const rel of DOCS) {
  const abs = join(ROOT, rel)
  if (!existsSync(abs)) continue
  const text = readFileSync(abs, 'utf8')
  const dir = dirname(abs)
  for (const m of text.matchAll(LINK)) {
    const href = m[1]
    if (/^(https?:|mailto:|#)/.test(href)) continue          // 外链与锚点不解析
    if (href.startsWith('/')) continue                       // 站点根路径不解析
    const target = resolve(dir, href)
    if (!existsSync(target)) bad(`${rel} 指向不存在的文件：${href}`)
  }
}
ok('文档相对链接已逐条解析')

// ---------------------------------------------------------------- 3. AGENTS.md 必须先说清「三件事」
const agents = readFileSync(join(ROOT, 'AGENTS.md'), 'utf8')
for (const kw of ['三件事', '闸门', 'AGENTS']) {
  agents.includes(kw) ? ok(`AGENTS.md 含关键说明：${kw}`) : bad(`AGENTS.md 缺关键说明：${kw}`)
}

// ---------------------------------------------------------------- 4. llms.txt 的链接目标必须在仓内
const llms = readFileSync(join(ROOT, 'llms.txt'), 'utf8')
for (const m of llms.matchAll(/\]\((https:\/\/github\.com\/[^)]+?\/blob\/[^)]+?)\)/g)) {
  const url = m[1]
  // 形如 .../blob/main/<path> ⇒ 取 <path>（跳过分支名 main）
  const afterBlob = url.split('/blob/')[1]
  if (!afterBlob) continue
  const rel = afterBlob.split('#')[0].replace(/^[^/]+\//, '')   // 去掉分支名
  if (!rel) continue
  const local = join(ROOT, rel)
  if (!existsSync(local)) bad(`llms.txt 指向仓内不存在的文件：${rel}`)
}
ok('llms.txt 的仓内链接已逐条解析')

// ---------------------------------------------------------------- 5. 仓库内不得出现 CRLF（digest 可复现性的前提）
function walk(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git') continue
    const p = join(d, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}
let crlf = 0
for (const f of walk(ROOT)) {
  if (!/\.(md|mjs|json|csv|yml|yaml|py|sh|txt)$/.test(f)) continue
  if (readFileSync(f).includes(Buffer.from('\r\n'))) { crlf++; bad(`含 CRLF 行尾：${relative(ROOT, f)}`) }
}
crlf === 0 ? ok('全部文本文件为 LF 行尾') : bad(`${crlf} 个文件含 CRLF`)

// ---------------------------------------------------------------- 6. 不得有残留占位符
// 规则与 scripts/check-pack.mjs 的 placeholder-scan 一致：
//   记法（不算残留）：空体 ／ 省略号 ／ 含正则元字符 ／ 尖括号体 ／ 被引号或反引号包住的"提及"
//   残留：其余 —— 即"写着具体内容却没被替换掉"
// 文件级豁免：行首注释写 `check-pack-allow: placeholder-residue` 即整文件跳过。
const RESIDUE = /【替换：([^】]*)】/g
const QUOTE_PAIRS = [['`', '`'], ['「', '」'], ['『', '』']]
const EXEMPT = /^[ \t]*(?:\/\/|#|<!--)[ \t]*check-pack-allow:[ \t]*placeholder-residue/m

const isNotation = (text, m) => {
  const body = m[0].slice(4, -1)
  if (body === '' || body === '…') return true
  if (/[()\[\]{}\\*+?|^$.]/.test(body)) return true
  if (/^[<＜][^>＞]*[>＞]$/.test(body)) return true
  const before = text[m.index - 1], after = text[m.index + m[0].length]
  return QUOTE_PAIRS.some(([o, c]) => before === o && after === c)
}

for (const f of walk(ROOT)) {
  if (!/\.(md|mjs|json|csv|yml|yaml|py|sh|txt)$/.test(f)) continue
  const rel = relative(ROOT, f)
  const text = readFileSync(f, 'utf8')
  if (EXEMPT.test(text)) continue                 // 声明了豁免（按设计含残留样本）
  const hits = [...text.matchAll(RESIDUE)].filter(m => !isNotation(text, m)).map(m => m[0])
  if (hits.length) bad(`${rel} 含占位符残留 ${hits.length} 处：${hits.slice(0, 2).join(' ')}`)
}
ok('无占位符残留（记法与声明豁免不计）')

console.log('')
if (failed) {
  console.log(`FAIL: ${failed} 项骨架自检未通过`)
  process.exit(1)
}
console.log('PASS: 仓库骨架自检全部通过')
