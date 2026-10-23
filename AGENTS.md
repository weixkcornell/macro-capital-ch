# macro-capital-ch：给 AI 助手的说明（先读这一页）

English version: [AGENTS.en.md](AGENTS.en.md)

你拿到的是一个 **Expert Profile v2 领域包**，不是一段提示词、也不是一堆笔记。
它描述一位名叫「观澜」的宏观与 A 股分析师：他的判断方法、能力层级、硬门禁、输出格式，
以及这些结论各自可追溯到哪些书。

**你不需要读全部文件。** 按下面的顺序取用，读到够用就停。

---

## 第 0 步：先判断你拿到的是什么

| 你的处境 | 该做什么 |
|---|---|
| 要产出「A股观点看板」 | 读 §A |
| 要产出「周期定位与配置研判」 | 读 §B |
| 要把这套方法接进你自己的系统 | 读 §C |
| 只是想了解它能干什么 | 读 [README.md](README.md) 就够 |

**三件事先说清楚（否则你会用错）**：

1. **这个包不产出观点，它产出「有约束的判断流程」。** 观点要你自己按流程跑出来。
   包里给的是判断依据、门槛、失效条款、输出契约——不是结论。
2. **原著原文不在包里。** 51 源全部只保留「方法论内化摘要层」（观澜自己的提炼，MIT），
   原著与教材原文版权归原作者，不随包分发。`source/SOURCE-MANIFEST.json` 里的
   `fileRef` 在本仓**一律解析不到**，这是设计而非缺文件。
3. **它只对自己声明的口径负责。** 基准是沪深300（价格指数口径），取数优先级是
   Wind CLI → westock CLI → 公开接口自算 → 外部口径（须标来源与 as-of）。
   换市场、换基准、换数据源，结论不能直接搬。

---

## §A · 产出「A股观点看板」

```bash
# 1. 先读方法论工艺规范（这是唯一必读的长文档）
skills/macro-capital-framework/SKILL.md

# 2. 再读这个场景的任务 DAG 与产出结构
scenarios/a-share-outlook.json
team-templates/a-share-outlook-team.json
output-templates/a-share-outlook.json

# 3. 按 DAG 跑；每一步的完成以「产物文件存在」为证据，不以执行者自述为证据
```

**三道横切闸门任一不过 = 不合格**，不是「尽量满足」：

- **闸门 A 统计可信**（七条）——t 阈值分档 + 多重检验校正 + Haircut/Deflated Sharpe 正反双校准
- **闸门 B 实施成本与可执行**（六条）——E[R_A] − 实施成本 = 净预期主动收益，净额 ≤ 0 不发布
- **闸门 C 数据质量与规则版本**（四条）——数据质检三件套 / 规则版本绑定 / 命中率账本对照 / 口径快照

**十五层能力全部并用**，不是挑着用。第 0 层（基准与目标函数）是总开关：
它决定「超额相对谁、额度多少、回撤对谁」。

**失效条款优先于任何结论。** 包里每条主动收益口径都配了失效条件
（carry 已降级、因子双锚两侧都要报、⑭⑮ 两层参数须本地重标定）——
失效条件触发时，先失效，再谈结论。

---

## §B · 产出「周期定位与配置研判」

同上，但场景换成 `scenarios/cycle-positioning.json`，
输出模板换成 `output-templates/cycle-positioning.json`。
这个场景出的是**配置研判**（E[R_A] 分解 + 实施成本），不发超配/低配结论——
净额 ≤ 0 就明说不发布。

---

## §C · 把这套方法接进你的系统

### 目录速查

| 你要什么 | 去哪 |
|---|---|
| 方法论工艺规范（全量） | `skills/macro-capital-framework/SKILL.md` |
| 专家 Profile（人设、能力、否决规则） | `experts/macro-capital-analyst.json` |
| 专家 Profile（文风渲染，末位工序） | `experts/style-renderer.json` |
| 能力分层（⑭⑮ 层的机制与硬边界） | `method-packs/fifteen-layer-framework.json` |
| 闸门定义（A/B/C 三道） | `method-packs/tri-gates.json` |
| 六步内化流程 | `method-packs/six-step-internalization.json` |
| 质量门禁的可机检配置 | `quality-policies/baseline.json` |
| 本体（实体/关系，可检索） | `domain-knowledge/macro-capital-analyst-kb.json` |
| 51 源溯源清单 | `source/SOURCE-MANIFEST.json` |
| 输出版式契约（tokens/组件/指令） | `output-templates/*.json` |
| 数据能力契约表 | `data-contracts/*.csv` |

### 三条硬规则（违反即产出无效）

1. **取数优先级不可跳过。** 任何数据先试 Wind CLI，取不到才退回 westock CLI →
   公开接口自算 → 外部口径。**当期实际落在哪一档、以及为什么没走 Wind，必须写进
   「方法可靠性声明」**。跳过 Wind 直接走公开接口是违规。
2. **数字一致性靠三处对撞。** 摘要、正文、底座三方的同一数字必须一致
   （`skills/macro-capital-framework/references/scripts/i1_collision_check.py`）。
3. **发表前必过文风渲染。** 定稿后由 `style-renderer` 改写一遍并出 `style-report.json`，
   事实层（数字/口径/结论方向/脚注）冻结不动。缺报告视同未渲染。

### 跑自检（改包之后必跑）

```bash
bash scripts/release-check.sh        # 发布前九件套，全绿才能发布
node scripts/check-pack.mjs          # 包级自检
node scripts/selftest-gates.mjs      # 门禁自身的负向对照
```

---

## 关于这个包的两条元规则（了解它为什么长这样）

1. **每道门禁都必须能被证伪。** `selftest-gates.mjs` 往包里注入已知缺陷，
   断言对应判据真的报错；任何一个判据抓不住自己的缺陷，发布就被拦下。
2. **「0 problems」有明确范围。** `CRITERIA.md` 逐条写明查了什么、**不查什么**、
   能报出哪些 code。不查的部分是明说的，不是漏掉的。

所以当你读到某个检查通过时，可以问 `CRITERIA.md` 那一栏：它到底保证了什么。
答案写在「不查什么」里。

---

## 不要做的事

- **不要凭印象补数据。** 取不到就写「未获取」，标原因——包里的 `gap-003` 就是这种登记项。
- **不要跨版本直接加总命中率。** 账本每条带 `skill_version`，跨版本必须分组呈现。
- **不要把 PCA 解释度更高当成宏观因子更有效。** 包里明确禁这条推理。
- **不要在正文写书名、刊名或「仿某某风格」。** 文风内化，刊名不可见。
  刊名只允许作为被引用的数据来源出现在脚注。
- **不要单腿下结论。** 三道闸门都过，才谈得上发布。
