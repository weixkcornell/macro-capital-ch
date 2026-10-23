# Contracts v2.9.0

These are stable within a major version. Changes are additive only; renamed entities keep
their old name for one major version; this pack never rewrites user files to migrate them.

## The object being versioned

This repository is an **Expert Profile v2 domain pack** (`schemaVersion: 2`). It declares
one `pack.json` plus ten dimensions, each a separate JSON file in its own directory:

| Dimension | Directory | File | What it declares |
|---|---|---|---|
| experts | `experts/` | `macro-capital-analyst.json`, `style-renderer.json` | persona, capabilities, mental models, anti-patterns, veto rules |
| teamTemplates | `team-templates/` | `a-share-outlook-team.json`, `cycle-positioning-team.json` | slots, task DAG, gate bindings |
| outputTemplates | `output-templates/` | `a-share-outlook.json`, `cycle-positioning.json` | section structure, design system, rendering directives |
| qualityPolicies | `quality-policies/` | `baseline.json` | the 15 quality gates, each with machine-checkable `config` |
| scenarios | `scenarios/` | `a-share-outlook.json`, `cycle-positioning.json` | which team template and output template a deliverable uses |
| methodPacks | `method-packs/` | `fifteen-layer-framework.json`, `tri-gates.json`, `six-step-internalization.json`, `style-render-pipeline.json` | the method itself: layers, gates, workflow, pipeline |
| toolProviders | `tool-providers/` | `macro-capital-tools.json` | transports, capabilities, data channels, smoke args |
| knowledgeProviders | `knowledge-providers/` | `macro-capital-analyst-library.json` | what knowledge the pack draws on |
| domainKnowledge | `domain-knowledge/` | `macro-capital-analyst-kb.json` | the ontology: entities, relations, retrieval profiles |
| skillPackages | `skill-packages/` | `macro-capital-framework.json` | the skill's contribution set and its source digest |

## Version lockstep

The `version` field must be **identical** across `pack.json` and all ten dimension files.
A version bump is one command:

```bash
node scripts/bump-version.mjs 2.9.0
```

It syncs `pack.json` and every dimension, the `SKILL.md` frontmatter, the README badge, the
first entry of the README version history, the `version=` field in
`SUBMISSION-CHECKLIST.md`, and **re-pins the digests**. A hand-edited version anywhere else is
caught as `version-drift`.

## Documented version anchors

Three places must agree with `pack.json` (`doc-version-drift`):

1. the README badge `badge/Version-X.Y.Z-`
2. the first entry of the README version history (`- **X.Y.Z**（date）：…`)
3. `SUBMISSION-CHECKLIST.md` (`version=X.Y.Z`)

The README version history is append-only. Historical entries are never rewritten to match the
present — a v2.3.0 entry saying "38 sources" is a true statement about v2.3.0.

## Gate anatomy

Every gate in `quality-policies/baseline.json` has four required parts:

```json
{
  "id": "data-quality-rule-version",
  "kind": "semantic",
  "severity": "hard",
  "appliesTo": ["deliverable"],
  "config": { "…": "the criteria this gate checks" }
}
```

`kind` is one of `deterministic`, `semantic`, `visual`. `severity` is `hard` or `soft` —
a hard gate blocks the deliverable; a soft gate warns and lets it through.

Three further rules make gates real rather than decorative:

- **A gate must have `config`.** A gate without `config` is a paper gate
  (`structure-gate-no-config`).
- **A gate must be bound by at least one team template.** A declared gate that no team
  template binds can never run (`unbound-gate`).
- **A gate with `config` must declare `config.wiring`** — one of:

  | `wiring` | Meaning |
  |---|---|
  | `{ "executor": "scripts/x.mjs", "consumesKeys": ["k1"] }` | a script in this repo consumes those config keys |
  | `{ "builtin": "…" }` | the platform validator consumes them |
  | `{ "semantic": "…", "reason": "…" }` | a human or reviewer must check; no executor exists |

  Keys that are documentation only go in `notConsumed` — declaring one as consumed when no
  executor reads it is `gate-key-unconsumed`.

## Digests

Two digests are declared and both must be reproducible:

| Field | Target | Algorithm |
|---|---|---|
| `skillPackages[].source.digest` | `skills/macro-capital-framework/SKILL.md` | `sha256` |
| `domainKnowledge[].snapshot.digest` | `source/SOURCE-MANIFEST.json` | `sha256` |

`digestTarget` must be declared alongside each digest. SHA-256 is line-ending sensitive, so
`.gitattributes` pins `eol=lf`; without that pin every digest breaks on Windows checkouts.

Re-pin after any change to either target:

```bash
node scripts/repin-digests.mjs            # write
node scripts/repin-digests.mjs --dry-run  # report only
```

## Exit codes

- `0` — all checks pass
- `1` — findings (the release check prints what failed and stops)
- `2` — usage error (not a domain-pack directory, missing `pack.json`)

## Self-check surface

```bash
node scripts/check-pack.mjs --max-notes 10   # pack-level checks + declared notes
node scripts/check-pack.mjs --criteria        # what is checked, and what is deliberately not
node scripts/check-pack.mjs --coverage        # which file each check reads; which are unread
node scripts/check-pack.mjs --criteria-md F   # regenerate the criteria registry (never hand-edit)
node scripts/selftest-gates.mjs              # 52 injected-defect cases
node scripts/check-gate-wiring.mjs           # gate → executor → consumed key wiring
```

## Criteria registry

`CRITERIA.md` is generated from the criteria table at the top of `scripts/check-pack.mjs`.
The `criteria-doc` criterion compares the two byte for byte, so the registry cannot drift from
the code. Regenerate it after changing any criterion:

```bash
node scripts/check-pack.mjs --criteria-md CRITERIA.md
```

## What is deliberately not checked

- **Whether a criterion's wording is right.** Checks verify shape, presence and consistency —
  not whether a method is sound.
- **Whether the analyst's conclusions are correct.** The pack ships a process, and a process
  cannot be validated by running it on itself.
- **Runtime behaviour of most scripts.** Syntax is checked; behaviour is covered by
  `selftest-gates.mjs` and the smoke test, not by every script's own path.
- **Whether the private knowledge base exists.** All 51 `fileRef` entries are unresolvable in
  this repository by design (see [provenance.md](provenance.md)).
