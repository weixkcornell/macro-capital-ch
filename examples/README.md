# examples/ — 照着做就能跑起来的最小样例

这个目录给出**一个足够小的完整链路**：从任务 DAG 到产物落点，
让你不必读完全部包就能确认「这个包怎么用」。

## 两个例子

| 例子 | 说明 | 适合谁 |
|---|---|---|
| [`minimal-board/`](minimal-board/) | 「A股观点看板」的最小可跑样例：5 个任务、13 道门禁、9 个产物文件 | 第一次用这个包的人 |
| [`gate-triage/`](gate-triage/) | 三道闸门的判定演示：给三个已完成的产物，判定该发还是不发 | 想知道「闸门到底卡什么」的人 |

## 为什么样例是「最小」而不是「完整」

完整的一次看板发布涉及取数、自算、检索、研判、渲染、文风六段，
样例里没有真实数据也没有真实结论——**放一个看起来完整的样例，比不放更危险**，
因为读者会以为那些数字是算出来的。

所以这里的样例只演示**结构与判定**：

- `minimal-board/` 里是**空骨架 + 说明**：每个任务该产出什么文件、文件里该有哪些节、
  哪个门禁会检查它。文件是模板，数值是占位说明。
- `gate-triage/` 里是**判定逻辑的演练**：给定三组条件，闸门 A/B/C 各自怎么判、
  什么情况下结论「不发布」。

**所有样例文件都不构成投资建议，也都不含任何真实市场数据。**

## 跑一遍

```bash
# 样例不依赖任何外部数据，照着读就能验证结构
cat examples/minimal-board/README.md
cat examples/gate-triage/README.md
```

如果想验证这个包本身的自检是绿的（而不是样例好看而已）：

```bash
bash scripts/release-check.sh
```

## 样例与包的对应关系

样例里出现的每个路径，在包里都有对应定义——这不是巧合，是刻意的：

| 样例里写的 | 包里定义的 |
|---|---|
| 5 个任务与依赖顺序 | `scenarios/a-share-outlook.json` |
| 每个任务谁做、产出哪些文件 | `team-templates/a-share-outlook-team.json` |
| 13 道门禁绑定 | `quality-policies/baseline.json` + 上表的 `gates` 字段 |
| 产物该有哪些章节 | `output-templates/a-share-outlook.json` |
| 研判该按什么顺序做 | `method-packs/six-step-internalization.json` |
| 三道闸门的判据全文 | `method-packs/tri-gates.json` |
| 每层能力的机制与硬边界 | `method-packs/fifteen-layer-framework.json` |
