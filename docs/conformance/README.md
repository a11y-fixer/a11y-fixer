# Conformance-as-a-guarantee: Phase 0 design docs

Phase 0 (D-lite) of the [north-star plan](../../.context/plans/a11y-fixer-pro-the-conformance-as-a-guarantee-nort.md):
define the provable claim before any ledger code. These are **design specs, not
implementation.** Each later phase gets its own `/autoplan` before building.

| doc | what it pins |
|---|---|
| [`claim-model.md`](./claim-model.md) | the Conformance Claim data model + ledger invariants — the contract every producer and the warranty build against |
| [`wcag-2.2-aa-matrix.md`](./wcag-2.2-aa-matrix.md) | every WCAG 2.2 A+AA criterion classified into machine / runtime / semantic / human — the product spec for the Phase 2 sensor and Phase 3 agent |
| [`warranty-language.md`](./warranty-language.md) | draft limited-warranty scope, strictly bounded to ledger-proven claims (⚠️ not legal text, counsel gate pending) |

## Phase 0 headline findings

- **Machine-decidable (M) is ~24% of A+AA** and nearly all shipped — it's the
  current product's ceiling, confirmed.
- **Runtime-observable (R) is ~44%** — the single biggest provable-coverage unlock.
  The Phase 2 sensor roughly doubles what the ledger can prove; it's higher-leverage
  than the AI agent. (Plan order unchanged: Phase 1 ledger is still the spine.)
- **4.1.1 Parsing is removed in WCAG 2.2** — no claim emitted.
- **2.5.3 Label in Name** is a cheap deterministic win the core tier doesn't yet
  cover — closeable independently of the phased build.

## Open Phase 0 exit items (before Phase 1 `/autoplan`)

- Set the confidence floor `F` for warranty inclusion (with counsel).
- Counsel confirms the warranty scope is draftable into enforceable language.
- Canonical signed-body serialization — deferred into the Phase 1 schema work.
