# The Conformance Claim model (Phase 0 / D-lite)

**Status:** design spec. No code yet. This is the contract the Phase 1 ledger
schema, the Phase 2 sensor, the Phase 3 agent, and the Phase 4 warranty all
build against. Companion docs: [`wcag-2.2-aa-matrix.md`](./wcag-2.2-aa-matrix.md)
(which criteria each producer can assert) and
[`warranty-language.md`](./warranty-language.md) (what we can legally stand behind).

## Why a claim, not a "scan result"

A scan result is a snapshot of failures at one moment from one tool. It can't be
queried over time, it isn't signed, and it says nothing about the criteria the
tool *didn't* check. A warranty needs the opposite: a durable, signed, per-criterion
record of **state + evidence + who asserted it + how confident they were** — including
explicit "we did not evaluate this" and "a human reviewed this." The Conformance
Claim is that unit. The ledger (Phase 1) is an append-only log of these claims.

## The claim

A single assertion about one WCAG criterion for one subject at one point in time.

```
ConformanceClaim {
  id            : string        // content-addressed hash of the canonical claim body
  subject       : SubjectRef    // what this is about (see below)
  criterion     : string        // WCAG 2.2 SC id, e.g. "1.1.1", "2.4.11"
  wcag_version  : string        // "2.2" — pinned; the matrix is version-specific
  level         : "A" | "AA"    // conformance level targeted
  state         : ClaimState    // pass | fail | not-applicable | not-evaluated | human-reviewed
  method        : ClaimMethod   // how the state was reached (producer class)
  confidence    : number        // 0.0–1.0; deterministic producers assert 1.0
  evidence      : EvidenceRef[] // >=1 unless state = not-evaluated
  asserted_by   : AsserterRef   // which producer/human + version
  asserted_at   : string        // RFC3339 UTC timestamp
  supersedes    : string | null // prior claim id for the same (subject, criterion), or null
  signature     : Ed25519Sig    // over the canonical body, chained per subject
}
```

### `state` — the five values, and why five

| state | meaning | who can assert it |
|---|---|---|
| `pass` | the criterion is met for this subject | any producer at its allowed confidence |
| `fail` | the criterion is violated | any producer |
| `not-applicable` | no content on the subject triggers this criterion (e.g. 1.2.2 on a page with no video) | machine (structural) or human |
| `not-evaluated` | **nothing has asserted this criterion yet** — the honest default | the ledger itself (implicit) |
| `human-reviewed` | a qualified human confirmed `pass`/`fail`; carries the human's sign-off as evidence | human only |

`not-evaluated` is load-bearing. Silence is not a pass. A subject's conformance
state is "unknown on criterion X" until a claim says otherwise, and the warranty
(Phase 4) only covers criteria that are `pass` **or** `human-reviewed` above a
confidence floor. This is what keeps the guarantee underwritable.

### `method` / `ClaimMethod` — the producer classes

Maps 1:1 to the matrix buckets and to the build phases:

| method | producer | phase | max confidence |
|---|---|---|---|
| `deterministic` | static fixer/scanner (axe-core / jsx-a11y path) | 1 (live) | 1.0 |
| `runtime` | rendered-DOM sensor | 2 | 1.0 for observed facts; lower for sampled inference |
| `semantic` | AI remediation agent | 3 | < human-gate threshold → must escalate |
| `human` | qualified reviewer / auditor | all | 1.0 (the ceiling of trust) |

A `semantic` claim can **never** reach `human-reviewed` on its own — that's the
safety invariant from the plan. The agent proposes a `semantic` claim with a
confidence score; anything below the Phase 0 threshold routes to a human, whose
confirmation writes a *separate* `human` claim that `supersedes` the agent's.

### `SubjectRef` — what a claim is about

Conformance is asserted at three granularities, because the warranty is sold on
"a product," demonstrated on "a page," and fixed on "an element."

```
SubjectRef {
  kind     : "flow" | "page" | "component"
  app_id   : string            // the customer product
  locator  : string            // URL / route pattern (page), selector or stable node id (component),
                               // ordered step list (flow)
  snapshot : string | null     // content hash of the rendered subject at assert time, if captured
}
```

Claims roll up: a `page` is conformant on criterion X iff every `component` claim
on that page for X is `pass`/`human-reviewed`/`not-applicable`. A `flow` rolls up
over its pages plus its own flow-level criteria (focus order across steps, redundant
entry, consistent help). Rollup is **computed, never asserted** — you can't sign a
`pass` for a page while a child element fails.

### `EvidenceRef` — proof, stored by content hash

```
EvidenceRef {
  hash : string                // sha-256 of the blob; the blob lives in evidence store (Phase 1)
  type : "scan-output" | "dom-trace" | "screenshot" | "agent-rationale"
        | "human-signoff" | "diff"
  producer_version : string    // tool/model/ruleset version that generated it
}
```

Evidence is immutable and deduplicated by hash. A claim references evidence; it
never inlines it. Tampering with evidence changes its hash and breaks the reference —
the same tamper-evidence the signed claim chain gives at the claim layer.

## Invariants (the ledger and every producer must enforce these)

1. **Append-only.** Claims are never edited or deleted. A correction is a new claim
   that `supersedes` the old one. History is the asset.
2. **Signed and chained.** Each claim is Ed25519-signed over its canonical body;
   signatures chain per subject (each claim commits to the prior claim id for that
   subject), so the whole timeline is tamper-evident, not just individual claims.
   Reuses the license-signing key discipline (readable PEM local, sealed on Vercel).
3. **Confidence is honest.** Deterministic producers assert `1.0`. Semantic
   producers assert their real model confidence and **may not** assert `1.0`.
   A claim above the warranty floor but below `1.0` still needs the matrix to
   allow machine assertion for that criterion.
4. **No silent pass.** Absence of a claim ⇒ `not-evaluated`, never `pass`.
5. **Semantic never self-certifies.** A `semantic` claim can gate a human into the
   queue; only a `human` claim can carry `human-reviewed` state.
6. **Evidence or it didn't happen.** Every `pass`/`fail`/`human-reviewed` claim
   carries ≥1 evidence ref. Only `not-evaluated` (and optionally structural
   `not-applicable`) may have none.

## What Phase 0 still owes before Phase 1 starts

- The confidence **floor** for warranty inclusion (a number, set with counsel +
  the matrix) — see `warranty-language.md`.
- Canonical serialization for the signed body (field order, encoding) so the hash
  is reproducible across producers. Deferred to the Phase 1 `/autoplan` — it's a
  schema decision, not a model decision.
- The rollup resolver's conflict rule when two unsuperseded claims disagree
  (shouldn't happen given `supersedes`, but the resolver must fail closed to `fail`).
