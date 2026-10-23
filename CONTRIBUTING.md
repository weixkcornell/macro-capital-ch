# 贡献指南（CONTRIBUTING）

> 这个包是"一个人 + 一套机器判据"维护的。**改动能否合入，不看说法，看判据能不能过。**

## 一、本地准备

```bash
node --version          # 需要 ≥ 22（脚本全是 .mjs，无第三方依赖）
python3 --version       # 技能脚本自检需要
```

平台私有库（`@zhijian/dsh-expert-library`）**可选**：设 `EXPERT_LIB_ROOT` 指向它，`check-pack` 会额外跑一层平台校验器；
不设则那层以 `skip` note 声明后跳过，其余检查照跑。

## 二、改之前先知道"我们查什么、不查什么"

```bash
node scripts/check-pack.mjs --criteria    # 判据登记表（对象／量程／不查什么／能报出的 code）
node scripts/check-pack.mjs --coverage   # 哪些文件有针对性判据、哪些只有通用扫描、哪些没人读
```

`CRITERIA.md` 是这两件事的**文档化版本**，由代码生成（**不要手改**）。

## 三、提交前必须全绿

```bash
bash scripts/release-check.sh
```

| # | 检查 | 抓什么 |
|---|---|---|
| ① | `check-pack.mjs` | 版本一致、digest 可复现、引用可解析、占位符残留、fileRef 安全、结构完整性、判据对照矩阵、note 预算 |
| ② | `selftest-gates.mjs` | **门禁自己的负向对照**：52 例注入式缺陷，任一未被抓住即失败 |
| ③ | `repin-digests.mjs --dry-run` | digest 是否该重钉 |
| ④ | `i1_collision_check.py --selftest` | 技能脚本解析层自检（8 例含负向样本） |
| ⑤ | `smoke-test.mjs` | 照 transport 声明**真跑一次**（静态存在 ≠ 可执行） |
| ⑥ | `check-doc-commands.mjs` | 文档-契约一致性（离线） |
| ⑦ | `check-template-conformance.mjs --selftest` | 输出模板一致性门自身的负向对照（2 正向 + 7 负向） |
| ⑧ | `audit-mobile.py --selftest` ＋ `check-wind-provenance.py --selftest` | 判据来源自校准（移动端 7 项 + Wind 6 项） |
| ⑨ | `check-gate-wiring.mjs` | 门禁接线：每道有 `config` 的门都声明了 wiring |
| ⑩ | `tests/test-repo-skeleton.mjs` | 仓库骨架：AI 入口页在位、文档链接可解析、LF 行尾、无占位符残留 |

**新增/修改任何判据时，必须同时补它的负向对照**（在 `selftest-gates.mjs` 里加一例）——
`check-pack` 的 `negative-control-gap` 是硬门，缺了直接 FAIL。理由是实测过的：
一道从未在坏件上失败过的门禁，与一道永远返回 PASS 的死门禁，观感完全一样。

**改过判据之后**，重新生成登记表：

```bash
node scripts/check-pack.mjs --criteria-md CRITERIA.md
```

## 四、内容改动的约定

- **凡是会演进的对象，判据里不要写死取值**（哈希、版本号、行数、时刻）—— 写指针，或写可复跑的命令。
- **引用别的文件请用可解析的完整路径**（文档里点名的 `scripts/...` 会被逐条核对存在性）。
- **不要手改生成物**：`CRITERIA.md` 由代码生成并有逐字比对判据。
- **门禁必须带 `config`**：没有可执行判据的门 = "纸上硬门"，`structure-gate-no-config` 会拦下。
- 改 `skills/macro-capital-framework/SKILL.md`（改版本号也算）之后要重钉 digest：
  `node scripts/repin-digests.mjs`（`bump-version.mjs` 会自动做）。

## 四b、改到"产物侧"判据时

产物侧门禁的入口是 `scripts/audit-delivery.sh`（用法见 [`RELEASING.md`](RELEASING.md) 的「交付级门禁」一节）。
两条约定：**判据必须写在包里**（工具只执行、不内置阈值）；**改判据要同时改 `config` 与文档**，
否则同一份产物在不同执行者手里会得到不同结论。

## 四c、改到"仓库骨架层"时

骨架层（`AGENTS.md` / `AGENTS.en.md` / `llms.txt` / `spec/` / `docs/` / `examples/` / `NOTICE`）
与包内十维度是**两套东西**：

- 骨架层讲「这个包是什么、怎么用、哪里弱」——改它不影响任何判据。
- 十维度讲「这个包怎么工作」——改它会波及 9 处引用（见 [`docs/architecture.md`](docs/architecture.md)）。

两条纪律：

- **骨架层也要有判据**。`tests/test-repo-skeleton.mjs` 会逐条解析文档里的相对链接、
  检查 AI 入口页在位、全仓 LF 行尾、无占位符残留。
  写了失效链接或漏了入口页，提交前就会红——**这类缺陷靠人读是读不出来的**。
- **文档里不要点名尚不存在的脚本**。`doc-script-ref` 判据会把「计划中要写的脚本」
  当成「点名的脚本必须存在」而 FAIL。确实要提，写「计划名 X，尚未实现」。

## 五、发布

见 [`RELEASING.md`](RELEASING.md)：`bump-version` → 补发布说明 → `release-check` → 同步安装副本 → 提交推送 → 打 tag / 建 Release。
