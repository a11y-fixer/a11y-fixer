# Draft limited warranty language (Phase 0 / D-lite)

> ⚠️ **NOT LEGAL TEXT. NOT APPROVED. DO NOT SHOW A CUSTOMER.**
> This is an engineering draft that pins *what the system can defensibly stand
> behind*, written so counsel has a concrete, scoped artifact to turn into real
> warranty language. **No customer sees the word "warrant" until a lawyer signs
> off.** This is a gate in the plan, not a formality. The value of the draft is
> the *scoping discipline*, not the prose.

Companion docs: [`claim-model.md`](./claim-model.md),
[`wcag-2.2-aa-matrix.md`](./wcag-2.2-aa-matrix.md).

## The one principle

**We warrant only what the ledger proves, at the confidence it proves it.** Every
sentence of real warranty language must trace to a signed claim in the ledger. If
the ledger can't produce a `pass`/`human-reviewed` claim above the confidence floor
for a criterion on a subject, that criterion is **outside** the warranty for that
subject — stated explicitly, not buried. A guarantee wider than the evidence is the
accessiBe failure mode (lawyers now flag overlay "compliance" claims as deceptive);
we do the opposite and make the scope boundary a feature.

## What is covered (draft scope)

For each **subject** (flow / page / component) enrolled on the warranted tier, we
stand behind the criteria for which the ledger holds a current, unsuperseded claim
that is **either**:

1. `state = pass`, `method = deterministic`, `confidence = 1.0` (the M bucket), **or**
2. `state = pass`, `method = runtime`, for a **directly observed** fact (the R bucket,
   observed — not sampled inference), **or**
3. `state = human-reviewed` (any criterion a qualified reviewer confirmed — the S and
   H buckets reach coverage *only* through this path).

Coverage is **per (subject, criterion)**, not "the whole product is accessible." The
customer-facing conformance statement enumerates exactly which criteria are covered
for which subjects, generated from the ledger, with the evidence addressable.

## What is explicitly NOT covered (draft carve-outs)

- Any criterion in `not-evaluated` state. Silence is never coverage.
- `semantic` claims that have **not** been human-confirmed. The AI agent's unconfirmed
  proposals carry no warranty — ever. (Claim-model invariant 5.)
- Runtime claims derived from **sampled inference** rather than direct observation,
  below the confidence floor.
- Content the customer changed after the last claim. The warranty attaches to a
  **signed snapshot**; post-snapshot drift on unmonitored subjects is out of scope
  until re-asserted. (This is why the Phase 2 sensor matters: continuous re-assertion
  shrinks the drift window.)
- Third-party embeds / iframes / user-generated content we don't scan or sense.
- Conformance under assistive-technology combinations outside the tested matrix
  (named explicitly in the real doc).
- Legal outcomes. We warrant the **conformance state and our remediation SLA**, not
  that any particular lawsuit or regulator reaches a given conclusion. (Counsel to
  draw this line precisely — it is the single most important carve-out.)

## The confidence floor (Phase 0 decision owed)

A single number `F ∈ (0,1]`. A machine/runtime claim enters warranty scope only if
`confidence ≥ F`. Below `F`, the criterion routes to human review and reaches scope
only as a `human-reviewed` claim. Proposed starting stance for the counsel
conversation: **`F = 1.0` for deterministic**, i.e. machine claims must be certain;
**runtime observed facts at 1.0**; **everything probabilistic goes to a human**. Start
maximally conservative; loosen only with data (the Phase 3 override-rate signal) and
counsel sign-off. Setting `F` is a Phase 0 exit criterion.

## The SLA half (what "stand behind it" means operationally)

The warranty is two promises, both measurable against the ledger:

1. **State promise:** the covered (subject, criterion) pairs are in `pass` /
   `human-reviewed` as of the signed snapshot, with addressable evidence.
2. **Remediation promise:** if monitoring (Phase 2 sensor / re-scan) records a
   covered criterion regressing to `fail`, we remediate within a stated window
   (the SLA clock), and the ledger timestamps prove both the detection and the fix.

Indemnification, if offered, is **scoped strictly to ledger-proven claims** and sits
downstream of counsel + (later) an underwriting partner. Not in this draft.

## Draft prose stub (for counsel to rewrite, not to ship)

> *Draft — illustrative only.* "For each web page, component, or user flow You
> enroll and We confirm as Covered (as listed in Your Conformance Statement), We
> represent that, as of the signed assessment snapshot identified therein, that item
> met the referenced WCAG 2.2 Level A/AA success criteria, evidenced by the
> cryptographically signed conformance record. Where a Covered criterion is later
> observed to regress, We will remediate it within the applicable service-level
> window. This representation extends only to the specifically enumerated
> criterion/item pairs and to no others, and does not constitute a representation
> regarding criteria marked Not Evaluated, items outside the enrolled set, or the
> outcome of any legal or regulatory proceeding."

Everything above the floor, nothing below it.

## Phase 0 exit checklist (this doc's job)

- [x] Scope defined strictly in terms of ledger claim states/methods.
- [x] Carve-outs enumerated, led by the "no legal-outcome guarantee" line.
- [ ] Confidence floor `F` set (needs the counsel conversation + matrix in hand).
- [ ] Counsel confirms the scope is *draftable into enforceable limited-warranty
      language* — the gate the plan names before Phase 4. **Owner: founder + counsel.**
- [ ] SLA remediation window (hours/days) set — a business input, not a Phase 0
      design output; placeholder until Phase 4.
