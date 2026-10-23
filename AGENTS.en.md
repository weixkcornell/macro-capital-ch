# macro-capital-ch: instructions for AI agents (read this first)

Chinese version: [AGENTS.md](AGENTS.md)

What you have is an **Expert Profile v2 domain pack** — not a prompt, and not a pile of notes.
It describes one analyst, "观澜" (Guanlan): his judgment method, capability layers, hard gates,
output format, and where every claim in it is traceable to.

**You do not need to read everything.** Work top-down and stop when you have enough.

---

## Step 0 — figure out which situation you are in

| Your situation | Read |
|---|---|
| Produce the "A-share outlook board" | §A |
| Produce the "cycle positioning & allocation" memo | §B |
| Wire this method into your own system | §C |
| Just want to know what it can do | [README.md](README.md) is enough |

**Three things to know up front (otherwise you will misuse it)**:

1. **This pack does not emit opinions; it emits a constrained judgment *process*.** The
   conclusions are yours to derive by running that process. What the pack supplies is the
   reasoning basis, the thresholds, the invalidation clauses and the output contract.
2. **The original texts are not in the repo.** All 51 sources keep only the
   "internalised-summary layer" (Guanlan's own distillation, MIT). Copyrighted books and
   textbooks are not distributed. `fileRef` entries in `source/SOURCE-MANIFEST.json` are
   intentionally unresolvable here — by design, not by accident.
3. **It only answers for the calibers it declares.** Baseline is CSI 300 (price index);
   data acquisition priority is Wind CLI → westock CLI → self-computed public interfaces →
   external caliber (must be cited with as-of). A different market, baseline or data source
   means the conclusions cannot be transplanted as-is.

---

## §A — Produce the "A-share outlook board"

```bash
# 1. Read the method spec first (the only long document you must read)
skills/macro-capital-framework/SKILL.md

# 2. Then the scenario DAG and the output structure
scenarios/a-share-outlook.json
team-templates/a-share-outlook-team.json
output-templates/a-share-outlook.json

# 3. Run the DAG; a step is complete when its output file exists, not when a runner says so
```

**All three cross-cutting gates must pass — a failure means the deliverable is invalid**,
not "mostly fine":

- **Gate A, statistical credibility** (7 rules) — t-threshold tiers + multiple-testing
  correction + Haircut / Deflated Sharpe, calibrated in *both* directions
- **Gate B, implementation cost & executability** (6 rules) — E[R_A] − implementation cost
  = net expected active return; a non-positive net means nothing gets published
- **Gate C, data quality & rule versioning** (4 rules) — data QC triad / rule-version
  binding / hit-rate ledger discipline / same-day caliber snapshot

**All fifteen capability layers apply together**, not a subset. Layer 0 (benchmark and
objective function) is the master switch: it decides what "excess" is relative to, how much
risk budget you have, and whose drawdown you are protecting.

**Invalidation clauses outrank any conclusion.** Every active-return line carries its
invalidation condition (carry is degraded; factor dual-anchor must be reported on both sides;
layers ⑭⑮ parameters must be re-calibrated locally). When a clause triggers, invalidate
first, argue later.

---

## §B — Produce the "cycle positioning & allocation" memo

Same shape, but use `scenarios/cycle-positioning.json` and
`output-templates/cycle-positioning.json`. This one produces an *allocation memo*
(E[R_A] decomposition plus implementation cost) and publishes no over/under-weight calls —
a non-positive net is stated plainly as "no publication".

---

## §C — Wiring this into your own system

### Directory lookup

| What you want | Where |
|---|---|
| Method spec (full) | `skills/macro-capital-framework/SKILL.md` |
| Expert profile (persona, capabilities, veto rules) | `experts/macro-capital-analyst.json` |
| Expert profile (style renderer, last stage) | `experts/style-renderer.json` |
| Capability layers (mechanisms and hard edges of ⑭⑮) | `method-packs/fifteen-layer-framework.json` |
| Gate definitions (A/B/C) | `method-packs/tri-gates.json` |
| Six-step internalisation workflow | `method-packs/six-step-internalization.json` |
| Machine-checkable gate configuration | `quality-policies/baseline.json` |
| Ontology (entities/relations, searchable) | `domain-knowledge/macro-capital-analyst-kb.json` |
| Provenance ledger for the 51 sources | `source/SOURCE-MANIFEST.json` |
| Output layout contract (tokens/components/directives) | `output-templates/*.json` |
| Data capability contract table | `data-contracts/*.csv` |

### Three hard rules (violating them invalidates the output)

1. **The acquisition priority cannot be skipped.** Try Wind CLI first for any datum; only
   then fall back to westock CLI → self-computed public interfaces → external caliber. **The
   tier actually used, and why Wind was not used, must be written into the method-reliability
   note.** Going straight to public interfaces is a violation.
2. **Number consistency is a three-way collision.** The same number in summary, body and
   data layer must agree
   (`skills/macro-capital-framework/references/scripts/i1_collision_check.py`).
3. **Style rendering is mandatory before publishing.** After the text is final, the
   `style-renderer` rewrites it once and emits `style-report.json`; the fact layer (numbers,
   calibers, direction of conclusions, footnotes) is frozen. A missing report counts as
   not rendered.

### Run the self-checks (mandatory after changing the pack)

```bash
bash scripts/release-check.sh        # the nine release checks — all green before publishing
node scripts/check-pack.mjs          # pack-level self-check
node scripts/selftest-gates.mjs      # the gates' own negative controls
```

---

## Two meta-rules that explain why it looks like this

1. **Every gate must be falsifiable.** `selftest-gates.mjs` injects known defects into the
   pack and asserts that the corresponding check really fails. A check that cannot catch its
   own defect blocks the release.
2. **"0 problems" has a declared scope.** `CRITERIA.md` states, per criterion, what is
   checked, **what is not checked**, and which codes can be emitted. What is not checked is
   stated, not omitted.

So when you see a check pass, you may ask `CRITERIA.md` what it actually guarantees.
The answer sits under "not checked".

---

## Do not

- **Do not fill in data from memory.** If a datum is unavailable, write "not obtained" and
  say why — `gap-003` in the pack is exactly such a registry entry.
- **Do not pool hit rates across versions.** Every ledger row carries `skill_version`; results
  must be grouped by version.
- **Do not read higher PCA explanatory power as evidence that macro factors work better.**
  The pack explicitly forbids that inference.
- **Do not name books or publications in the body, or write "in the style of X".** The style
  is internalised; publication names stay invisible and may appear only as a cited source in
  a footnote.
- **Do not conclude on one leg.** All three gates pass before anything is publishable.
