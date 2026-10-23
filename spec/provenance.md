# Provenance and the distribution boundary v2.9.0

## The one-paragraph version

The pack contains **only** the "internalised-summary layer": the analyst's own distillation of
51 books, textbooks, reports and papers, written by the analyst, released under MIT. The original
texts are not in the repository and never will be — they are copyrighted by their authors and
publishers. Every original is registered in `source/SOURCE-MANIFEST.json` so that any statement
in the pack can be traced back to where its method came from, without shipping the source.

## The ledger

`source/SOURCE-MANIFEST.json` holds one entry per material:

```json
{
  "id": "mat-047",
  "type": "textbook",
  "title": "The Econometrics of Financial Markets",
  "author": "Campbell, Lo & MacKinlay",
  "source": "书籍资料库",
  "authorization": "内部使用（仅内化摘要层开源）",
  "fileRef": "campbell_lo_mackinlay.md",
  "boundExperts": ["macro-capital-analyst"],
  "status": "已精读",
  "distributable": false
}
```

| Field | Meaning |
|---|---|
| `id` | `mat-NNN`, stable, never reused |
| `type` | `book` / `textbook` / `handbook` / `curriculum` / `standard` / `report` / `paper` |
| `fileRef` | bare file name(s) relative to `fileRefRoot`; `+` separates several files for one material |
| `authorization` | what permission was obtained |
| `boundExperts` | which expert profiles may draw on it |
| `status` | reading status (e.g. `已精读`) |
| `distributable` | always `false` in this repository |

**Counts as of v2.9.0**: 51 materials — 25 books, 2 textbooks, 1 handbook, 1 standard,
2 curricula, 2 reports, 18 papers — spanning 59 precision-read files.

`fileRefRoot` points at the private local knowledge base. `fileRefNote` in the same file
explains that these paths are deliberately unresolvable here.

## The boundary, stated as a rule

- **Shipped:** the analyst's own frameworks, layer definitions, gate criteria, output
  contracts, source ledger, scripts, tests. MIT.
- **Not shipped:** every original text — books, CFA curricula, papers, statistical standards.
  Copyrighted, not redistributed.
- **Never in the pack:** an absolute path, a URL, or an intranet address pointing at the private
  base. The `fileRef-unsafe` check rejects any of these, so the ledger cannot leak a location
  even by accident.

## The banned-token rule

Because the pack publishes *which* books it drew on, a careless generation could quote them
verbatim and effectively redistribute the originals. The pack defends against this with a
banned-token table in `quality-policies/baseline.json` → the `banned-tokens` gate:

- **Title stems and author stems** of every registered material are listed. Mentioning them in
  a way that is not pure notation is a violation.
- **The threshold is zero.** Any uncovered stem is `banned-tokens-gap` and blocks the release.
  Adding a source therefore *forces* adding its stems — the two cannot drift apart.
- **A small allowlist of generic terms** is exempted (e.g. `factor`, `volatility`) so that
  ordinary analytical vocabulary is not caught.
- **The check is both ways**: it reports what is covered and what is not, and the count of
  strict gaps must be `0` and the count of pending-review items must be `0`.

## Adding a source

1. Register it in `source/SOURCE-MANIFEST.json` with `distributable: false` and a `fileRef`.
2. Add its title stem and author stems to `bannedTokens` — otherwise
   `banned-tokens-gap` fires and blocks the release.
3. Update the source counts wherever they are declared (`pack.json` description, the
   knowledge-provider description, `README.md`, `README.en.md`).
4. Re-pin the ontology digest: `node scripts/repin-digests.mjs`.
5. Record the change in the README version history, including the count change.

Steps 2 and 3 are what stop the ledger and the prose from disagreeing. The release check
catches the omission; it does not guess for you.

## Why the ledger is public even though the texts are not

Two reasons, both practical:

1. **A claim without a source is not a claim.** The ledger is what lets a reader check that
   the pack's methods come from named, identifiable work rather than from nowhere — and the
   pack's own stated principle is that fabricated expert views are worse than no answer.
2. **The copyright line is defensible precisely because the boundary is stated.** Publishing
   the *distillation* of a method, with a precise ledger of what was distilled from, and no
   original text, is a materially different act from redistributing the texts. The boundary
   only protects the originals if it is legible, so the ledger and the banned-token table are
   both in the repository.
