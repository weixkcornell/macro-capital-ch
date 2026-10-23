# 样例：A股观点看板（最小可跑骨架）

**这是结构骨架，不是真实产出。** 里面没有任何真实市场数据，也没有任何真实结论。
它的用途是让你看清「一次看板发布要落哪些文件、每个文件里该有什么、哪道门禁会检查它」。

对应定义：`scenarios/a-share-outlook.json` + `team-templates/a-share-outlook-team.json`

## 任务 DAG（5 步，有依赖）

```
  ┌──────────────────┐
  │ 0 data-selfcalc  │  一手数据自算
  │   → data-base.json / data-base.md
  └────────┬─────────┘
           ↓
  ┌──────────────────┐
  │ 1 consensus-scan │  市场共识检索（对照组）
  │   → consensus.md
  └────────┬─────────┘
           ↓
  ┌──────────────────┐
  │ 2 six-step-gate  │  六步研判 + 闸门校验
  │   → six-step.md / gate-a-stats.json / gate-b.json
  └────────┬─────────┘
           ↓
  ┌──────────────────┐
  │ 3 fusion-render  │  融合成文 + 渲染
  │   → final.md / index.html
  └────────┬─────────┘
           ↓
  ┌──────────────────┐
  │ 4 style-render   │  文风渲染（末位，事实层冻结）
  │   → final.md / style-report.json / index.html
  └──────────────────┘
```

**依赖的含义**：第 2 步必须同时拿到 0 与 1 的产物（自算数据 + 市场共识），
否则就是「闭门造车」；第 4 步必须等第 3 步定稿。

## 每个产物文件里该有什么

### `data-base.json` / `data-base.md`（第 0 步）
所有自算数字的底座。**每个数字必须带口径与截至期。**
至少覆盖：四档分位、年化波动、最大回撤、相关矩阵与 regime、拥挤度、风险贡献分解。
另需 ≥3 条本人测算的市场结构结论。

对应门禁：`number-consistency`（要与正文对撞）、`data-quality-rule-version`（闸门 C 的质检三件套证据）。

### `consensus.md`（第 1 步）
近一周券商/研究号的公开观点，**逐条标注可点击来源**。
这一份只作对照组，用途是形成「市场共识与我的分歧」底稿——
**不得把别人的观点当自己的观点**，也不得因为共识强就调整自己的判断。

### `six-step.md`（第 2 步）
按六步内化流程重构观点，顺序不可换：

| 步 | 问题 |
|---|---|
| 1 | 钱从哪来 |
| 2 | 钱怎么变利润 |
| 3 | 价格里装了多少预期 |
| 4 | 结构定价自不自洽 |
| 5 | 周期定位与风险归属 |
| 6 | 错了会怎样 |

**判断「因子表达周」时要补做因子归因三要素。**
动手前须完整读 `skills/macro-capital-framework/SKILL.md`。

### `gate-a-stats.json` / `gate-b.json`（第 2 步）
闸门 A 与闸门 B 的判定留痕。**这不是形式**——没有这两个文件，
「过了闸门」就是自述；而「自述」与「产物真的在」无法区分。

### `final.md` / `index.html`（第 3 步）
自包含 HTML（浅色、学术排版，**涨=红、跌=绿**），强制章节：

1. 摘要
2. 分歧表
3. 六步主体
4. 上期判断回顾
5. 方法可靠性声明
6. 脚注与来源回链

文末固定一行「不构成投资建议」。
`index.html` 必须是**自包含**的（无外链），因为审核要在 `file://` 下用无头浏览器逐视口测，
任何外链都会让读数依赖网络。

对应门禁：`render-overflow`（六视口 0 溢出 + WCAG AA 对比度）、
`mobile-readability`（320/375/390 三档）、`template-conformance`（token 逐字相同、指令白名单）、
`section-outline`（章节齐备与顺序）、`placeholder-clean`（无未注入空值）、
`layout-audit`、`collision-check`。

### `style-report.json`（第 4 步）
文风渲染的证据，8 条逐条结果 + **反例命中数须为 0** + **刊名出现次数须为 0**。
**缺这个文件视同未渲染。** 渲染后须重出 `index.html`，使产物与定稿一致。

## 13 道门禁绑在哪

全部绑在 `appliesTo: ["deliverable"]` 上，即对最终交付物生效：

| 门禁 | 它卡什么 |
|---|---|
| `banned-tokens` | 题名/作者词干与语言硬规则（禁「腿」等比喻） |
| `number-consistency` | 摘要—正文—底座三方对撞 |
| `render-overflow` | 六视口溢出 + 对比度 |
| `layout-audit` | 版式 |
| `section-outline` | 章节齐备与顺序 |
| `placeholder-clean` | 占位符残留 + 未注入空值 |
| `collision-check` | 脚本解析层 |
| `gate-a-double-calibration` | 收益口径折减 + p-hacking 拦截 |
| `wind-provenance` | Wind 主定量源口径 + 凭据 fail-closed |
| `mobile-readability` | 正文/图内字号、触控目标、表格滚动、零溢出 |
| `template-conformance` | 产物 ↔ 输出模板一致性 |
| `style-render` | 发表前必须过文风渲染 |
| `data-quality-rule-version` | 质检三件套 / 规则版本绑定 / 命中率账本对照 / 口径快照 |

## 两个最容易漏的点

1. **闸门 C 的质检在取数之后、研判之前。** 漏了它，后面所有数字都建在未验证的数据上。
2. **文风渲染在最后。** 漏了它，产物内容正确但表达不达发布标准——**而「事实层冻结」这件事
   只有在真的跑过渲染之后才被验证过**。

## 交付级验收（对着真实产物跑）

```bash
bash scripts/audit-delivery.sh --md final.md --html index.html \
    --template output-templates/a-share-outlook.json \
    --pool "data/computed.json data/alpha.json data/cycle-inputs.json"
```

它跑七件（判据全部**从包里读**，不写死在工具里）。
注意：**中间任务的产物由队长按 `deliverablePaths` 逐条核在不在**——
完成与否以文件存在为证据，不以执行者自述为证据。
