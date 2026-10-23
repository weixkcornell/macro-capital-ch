# Macro Capital Analyst — domain pack (English summary)

> 观澜 · 宏观与资本市场分析师 —— a **zhijian-style Expert Profile v2 domain pack** for macro & A-share analysis.
> This is a short English summary. The authoritative documents are in Chinese:
> [`README.md`](README.md) (structure, version history), [`CRITERIA.md`](CRITERIA.md) (what the self-checks actually verify),
> [`RELEASING.md`](RELEASING.md) (release flow), [`SUBMISSION-CHECKLIST.md`](SUBMISSION-CHECKLIST.md) (acceptance checklist).

## Start here

**Whoever picks this up is most likely an AI assistant, not a person.** So the entry page is
[`AGENTS.md`](AGENTS.md) (English: [`AGENTS.en.md`](AGENTS.en.md)) — it says what this is, what
the three hard rules are, and what not to do, before it says where the files are.

One line for an AI assistant:

```text
Read https://github.com/weixkcornell/macro-capital-ch/blob/main/AGENTS.en.md and follow it.
```

For humans, four routes:

| You want | Read |
|---|---|
| To understand what it can do | This file, then the Chinese [`README.md`](README.md) |
| To use it | [`AGENTS.en.md`](AGENTS.en.md) §A / §B |
| To change it | [`docs/architecture.md`](docs/architecture.md) (what a change touches) + [`spec/contracts.md`](spec/contracts.md) |
| To know where it is weak | [`docs/threat-model.md`](docs/threat-model.md) |
| To see it work | [`examples/`](examples/) |

Machine-readable index: [`llms.txt`](llms.txt).

## What it is

A pack with two experts: one macro / A-share analyst ("观澜") who does the judging, and one
style renderer ("砚边") who runs **last** and changes expression only, never facts. Together they
carry

- a **benchmark-and-objective layer** (CSI 300 as the baseline; absolute-return risk constraints),
- an **active-return framework** (active weight, active risk σ_A, Euler MCTR/CTR decomposition, E[R_A] three-way split, IR = IC × √BR, IC\*),
- **three cross-cutting gates**: Gate A (statistical credibility: BH-FDR + Bonferroni, Haircut / Deflated Sharpe, forward *and* reverse calibration), Gate B (implementation cost & executability), and Gate C (data quality & rule versioning),
- a **six-step internalisation workflow** and a **fifteen-layer capability map**,
- 2 scenarios (`a-share-outlook`, `cycle-positioning`) with team templates and DAGs,
- 15 deliverable quality gates, and a self-check stack (see below).

## Layout

```
AGENTS.md / AGENTS.en.md     entry page for AI assistants (read this first)
llms.txt                     machine-readable index of this repository
pack.json                    pack metadata (id / version / license / repository / caliber declarations)
experts/                     the expert profiles (Expert Profile v2)
method-packs/                six-step internalisation, fifteen-layer framework, tri gates, style-render pipeline
scenarios/ + team-templates/   scenario definitions and their task DAGs
output-templates/            section structure per deliverable
quality-policies/            the 15 deliverable gates (each with an executable `config`)
data-contracts/              capability contract table for the self-built data engine
domain-knowledge/            knowledge-base ontology + snapshot (digest of SOURCE-MANIFEST)
source/SOURCE-MANIFEST.json  provenance ledger for the 51 source materials
docs/                        architecture / status / decisions / roadmap / threat-model
spec/                        stable contracts: contracts.md, provenance.md
examples/                    runnable minimal examples
tests/                       repo-skeleton self-check
skills/                    the framework skill (SKILL.md + references + scripts)
scripts/                   self-checks, release tooling, smoke test
CRITERIA.md                machine-verified criteria registry (generated)
```

## Self-checks (this is the part most packs omit)

```bash
bash scripts/release-check.sh        # the ten release checks + 2 reports
node scripts/check-pack.mjs          # pack-level checks (works without the platform library)
node scripts/selftest-gates.mjs      # 52 injected-defect cases: proves each check can actually fail
node tests/test-repo-skeleton.mjs    # repo skeleton: AI entry pages, doc links, LF endings, no residue
node scripts/check-pack.mjs --criteria    # what is checked, and what is deliberately NOT checked
node scripts/check-pack.mjs --coverage    # which files a check reads; which are unread
```

Two properties are enforced mechanically rather than by discipline:

- **every check must be provably able to fail** — `selftest-gates.mjs` injects known defects and asserts the
  expected failure code; `check-pack` fails if any of our own codes has no such negative control;
- **"0 problems" has a declared scope** — `CRITERIA.md` lists, per criterion, the object, the scope, and
  **what is not checked**.

## Versioning

Releases are tagged `vX.Y.Z` and published as GitHub Releases. Archived snapshots are downloadable, e.g.
`https://github.com/weixkcornell/macro-capital-ch/archive/refs/tags/v2.9.0.tar.gz`.

## Knowledge base (important)

The pack ships only the **internalised-summary layer** (the analyst's own frameworks, MIT). The 51 source
materials (copyrighted books, textbooks and papers) are **not distributed**: `materials[].fileRef` entries
resolve against a private local root declared as `fileRefRoot`, and are intentionally unresolvable in this
repository. See [`knowledge/experts/macro-capital-analyst/README.md`](knowledge/experts/macro-capital-analyst/README.md)
for how to build your own knowledge base.

## License

MIT (see [`LICENSE`](LICENSE)). Source materials remain the property of their authors/publishers.

## Data sources and acquisition priority

Data is always fetched from the **Wind CLI first**; if Wind is unavailable (not installed / no entitlement / field missing / call failed) the pack falls back in this order: westock CLI → public interfaces (self-computed) → external sources with citation and as-of. Skipping Wind and going straight to public interfaces is not allowed. The tier actually used, and the reason Wind was not used, must be stated in the method-reliability note.
