# Phase 3 — The AI remediation agent: engineering plan (design spike)

**Status:** design spec, no agent code yet. Phase 0 design docs + the Phase 1 ledger are the
inputs: [`claim-model.md`](./claim-model.md), [`wcag-2.2-aa-matrix.md`](./wcag-2.2-aa-matrix.md),
[`warranty-language.md`](./warranty-language.md). This spike closes issue #82 and **scopes the
first build item** (the alt-text proof, issue #89). It is the Phase 3 analog of the Phase 2 sensor
spike ([`phase-2-sensor-plan.md`](./phase-2-sensor-plan.md)).

## Why this phase, and why now

Phase 3 is the **`semantic`** producer — the third of the four `ClaimMethod` classes
([`claim-model.md`](./claim-model.md)). It covers the ~13% of WCAG 2.2 A+AA that is
*meaning-dependent* and that no deterministic or runtime producer can decide: meaningful alt
text, heading hierarchy, context-inferred labels, bespoke-widget ARIA (the `S` rows of
[`wcag-2.2-aa-matrix.md`](./wcag-2.2-aa-matrix.md): 1.1.1, 1.3.3, 1.4.5, 2.4.4, 3.2.4, 3.3.3).

The conformance north star sells **warranted** conformance, and a semantic judgment is
probabilistic. Per the warranty floor `F = 1.0` ([`warranty-language.md`](./warranty-language.md)),
a semantic claim is **categorically below warranty scope** — it can never enter the SLA on its
own; it must **always escalate to a human**. The failure mode Phase 3 exists to contain is a
*confidently wrong* fix: a plausible-but-false alt text is worse than an honestly flagged
violation, because it launders a guess into the record the warranty stands on.

So the headline is not a capability, it is a **guardrail**: **the confidence-gated human
approval queue is the safety architecture, not UI polish.** This spike's whole job is to pin
that architecture before any agent code exists.

**Sequencing note.** Phase 3 lands after Phase 2 by design — proof-depth (signed runtime
claims) before fix-breadth (the agent). The ledger needs durable evidence for the agent's
semantic claims to escalate *into*, and the warranty is sold on provable re-assertable
conformance, not on fixes.

### First criterion: 1.1.1 meaningful alt text

1.1.1 is the first beachhead because the deterministic/runtime split is cleanest there and
**an AI alt-text tool already exists** (`packages/ai/src/fixers/alt-text.ts` and siblings):
the machine already *detects* missing alt; only the *adequacy* of the text is semantic
([`wcag-2.2-aa-matrix.md`](./wcag-2.2-aa-matrix.md) row 1.1.1). So v1 **governs an existing
tool** — wraps it in the confidence gate, the queue, and the ledger escalation — rather than
building generation from scratch. That is the fastest way to prove the safety rails end-to-end.
(Before widening past 1.1.1, rank the remaining `S` criteria by **liability weight** —
complaint/settlement frequency — not by tractability, same discipline as the Phase 2 beachhead
choice.)

**The honest tension this surfaces:** today's `bucket: 'ai-assisted'` fixers (including alt
text) already auto-apply a generated value to source with only a sanitizer + re-scan gate —
**no confidence score, no human approval, no ledger claim.** Phase 3 is precisely the
governance layer those fixers are missing. v1 retrofits that governance onto one of them.

## The architectural bet: a third producer on an unchanged spine

The same thesis as Phase 2. `ClaimMethod` in
[`claim.ts`](../../packages/app/src/conformance/claim.ts) is already
`'deterministic' | 'runtime' | 'semantic' | 'human'` — `'semantic'` is defined, it just has no
producer. The self-certify guard already exists: `assertWellFormed` throws if a `semantic`
claim asserts `human-reviewed` state (`claim.ts`, invariant #5). The integration point is the
**`ClaimDraft`** shape from [`ledger.ts`](../../packages/app/src/conformance/ledger.ts):

```ts
interface ClaimDraft {
  body: Omit<ClaimBody, 'prevClaimId' | 'supersedes' | 'evidenceHash'>;
  evidence: { type: string; producerVersion: string; blob: unknown } | null;
}
```

The agent emits `ClaimDraft[]` with `body.method: 'semantic'`, a **real sub-1.0 confidence**,
and an `agent-rationale` evidence blob, then hands them to `writeClaims` — exactly as
`deriveClaims` does for the scanner. The goal is **no change to `ledger.ts`, `claim.ts`'s
sign/verify core, the schema, or the verifier**, beyond two small, named additions the first
build item carries:

1. A **`semantic` confidence invariant** in `assertWellFormed`: a `semantic` claim must assert
   `confidence < 1`. Today only `deterministic` is pinned (to exactly 1); the semantic producer
   must be structurally unable to mint a certain-looking machine claim.
2. **Semantic is never directly pass-eligible for warranty.** A semantic `pass` reaches
   warranty scope **only** through the `human` claim that supersedes it. This is enforced at
   the reconcile/warranty layer ([`reconcile.ts`](../../packages/app/src/conformance/reconcile.ts),
   [`warranty.ts`](../../packages/app/src/conformance/warranty.ts)) — **not** by adding semantic
   criteria to the `passEligibleCriteria` allowlist in
   [`evaluated-set.ts`](../../packages/app/src/conformance/evaluated-set.ts).

## The safety architecture: a confidence-gated human approval queue

The agent **never self-applies to the warranted/published state** (invariant #5: semantic never
self-certifies). Per candidate violation:

```
  AI agent (UNTRUSTED judgment — proposes only)        backend (holds sealed key, GATES + SIGNS)
  ┌────────────────────────────────────┐   proposal    ┌──────────────────────────────────────┐
  │ pick trusted tool (alt-text fixer)  │──────────────▶│ sanitize + deterministic veto floor    │
  │ generateObject → {alt, conf, why}   │               │ semantic ClaimDraft (method:'semantic',│
  │ + the concrete source diff          │               │   confidence<1, evidence=agent-rationale)│
  └────────────────────────────────────┘               │ writeClaims → sign + chain             │
                                                        │ conf ≥ T → queue entry (+ diff shown)  │
                                                        │ conf < T → flagged violation, NO diff  │
                                                        └───────────────┬────────────────────────┘
                                                                        ▼
                                             human reviews queue in the dashboard
                                             approve/edit ⇒ `human` claim SUPERSEDES the semantic one
                                             (only now does the fix reach warranted state)
```

- **Threshold `T` — the queue-admission gate (distinct from the warranty floor `F`).**
  `confidence ≥ T` → the proposal enters the human approval queue **with its applied diff
  shown**. `confidence < T` → **no auto-apply, ever** — surfaced as an honest flagged violation
  ("found, not guessed"), no diff proposed. Both `T` and `F` are conservative to start; `F`
  stays at `1.0` (semantic is always below it), and `T` only loosens on override-rate data +
  counsel sign-off.
- **Escalation.** A human approve (or edit-then-approve) writes a **`human` claim that
  `supersedes`** the agent's semantic claim — the existing
  [`warranty.ts`](../../packages/app/src/conformance/warranty.ts) `reconciledToClaimDrafts`
  pattern (human-reviewed criteria → `method:'human'` drafts on the chain). Only then does the
  fix reach the published/warranted state.
- **Where it lives.** The queue is a `packages/app` surface: proposals, their diffs, and
  decisions stored in the DB and shown in the dashboard, threaded through the existing
  [`reconcile.ts`](../../packages/app/src/conformance/reconcile.ts) (machine-vs-human
  reconciliation) and `audit-service.ts` (human-verdict recording, `source:'human'`) machinery.
  It is **not** PR-native — a durable, auditable queue decoupled from any PR lifecycle is the
  cleaner fit for the ledger model and for capturing the override signal structurally.

## Deterministic fixers become the agent's trusted tools

The existing fixer contract is already a uniform, self-describing, self-applying tool surface —
`Fixer { wcagId, bucket, perNode?, canFix(), fix() }`
([`fixer/index.ts`](../../packages/core/src/fixer/index.ts)) dispatched first-`canFix`-match by
the ordered [`buildFullRegistry`](../../packages/ai/src/fixers/registry.ts). The agent
**selects a tool exactly the way the registry does.** The bucket is the trust boundary:

- `bucket: 'rule-based'` fixers are **trusted tools** — deterministic, confidence 1, applied
  without a queue (they are the Phase 1 `deterministic` producer).
- `bucket: 'ai-assisted'` fixers are **semantic proposals** — every output must route through
  the confidence gate and the approval queue.

v1 does **not** build an LLM tool-calling loop. The governance rails around a *single* existing
tool (the alt-text fixer) are the proof; the multi-tool agent loop that reasons across the
registry is Phase 3's later breadth, an explicit non-goal for the first build item.

## Reuse, not rebuild (the AI layer)

The BYOK multi-provider layer is already wired
([`ai-sdk.ts`](../../packages/ai/src/provider/ai-sdk.ts): Anthropic/OpenAI/Google via the Vercel
AI SDK, key precedence in [`config.ts`](../../packages/ai/src/provider/config.ts)). v1 reuses:

- `AIProvider.suggestAltText` / `suggestAccessibleName` — the generation methods.
- [`sanitizeAccessibleName`](../../packages/ai/src/fixers/sanitize-name.ts) — the output guard
  (rejects empty/overlong/refusal/echoed-JSX output).
- `CachingProvider` / `LearningProvider`
  ([`caching.ts`](../../packages/ai/src/provider/caching.ts),
  [`learning.ts`](../../packages/ai/src/provider/learning.ts)) — dedup + house-style few-shot +
  the `record`/`drainGenerations` capture point the override metric reads from.
- The re-scan verify gate
  ([`verify-fixes.ts`](../../packages/github-action/src/verify-fixes.ts)) — reverts any fix that
  doesn't net-reduce violations.

The **one new AI-layer capability** is `generateObject` (structured output), which the repo
does not use today — needed for the rubric score and rationale below.

## The confidence signal: rubric score + deterministic veto floor

- **Primary — a structured rubric score.** Switch the alt-text path to `generateObject`
  returning `{ altText, confidence, rationale }`, scored against a rubric: context sufficiency,
  specificity to *this* image, and no-guess/no-filler. The `rationale` is persisted as
  `type: 'agent-rationale'` evidence (already in the `EvidenceRef` type,
  [`claim-model.md`](./claim-model.md)).
- **Veto floor — deterministic signals the code already has.** Empty surrounding context, a
  `sanitizeAccessibleName` rejection, or an alt derivable **only** from the filename force the
  proposal **below `T`** regardless of the model's self-reported number. This defends against
  the well-known miscalibration of LLM self-confidence: the model cannot talk its way past a
  structural "it had nothing to go on."

## The override-rate metric (the confidence signal the issue asks for)

```
override_rate = (rejected + human-edited approvals) / total queued proposals
```

Tracked **per criterion and per model/version** off the queue decision records. It is the
empirical calibration signal for `T` (and, only much later, with counsel and data, for any
conversation about `F`). Starting stance: a conservative `T`; loosen only when the override
rate on a criterion is durably low. The existing `LearningProvider.record` /
`drainGenerations` plumbing is the natural capture point — a rejected or edited proposal is a
negative/corrected learning signal as well as a metric input.

## Edge cases (locked)

| case | handling |
|---|---|
| Alt derivable from filename only | deterministic veto → below `T`, flagged not fixed. |
| Sanitizer rejects the model output | not queued; flagged violation. |
| Decorative image (`role=presentation` / intended empty alt) | `not-applicable`, never a guessed alt. |
| Re-run of an unchanged proposal | idempotent — same assertion content → same claim id. |
| Human edits the value before approving | the `human` claim carries the edited value; counts as an override. |
| Provider unavailable (no API key) | flagged, never guessed (existing `available()` guard). |
| Confidence ≥ `T` but human rejects | no `human` claim; the semantic claim stays un-superseded (not warranted); override recorded. |

## Risks

1. **Confidently-wrong alt text (the core risk).** Mitigated by the veto floor + the queue
   (nothing reaches warranted state without a `human` claim) + the override-rate feedback loop.
2. **LLM self-confidence miscalibration.** Mitigated by making deterministic signals a *veto*,
   not a tie-breaker — they override the model's number downward, never upward.
3. **`generateObject` is new to the repo.** Contained to one provider method behind the existing
   `AIProvider` seam + test fakes; no change to the deterministic load path.
4. **Queue becomes a human bottleneck.** `T` is a signal-to-noise control: too-low-confidence
   proposals are flagged, not queued, so reviewers see only proposals worth their time; the
   override rate tells us when `T` is set wrong.
5. **Scope creep into a full agent loop.** Explicit non-goal; v1 governs one tool end-to-end.

## Non-goals (explicitly deferred)

- **An LLM tool-calling / multi-tool agent loop** — v1 governs the single alt-text tool; the
  loop that reasons across the fixer registry is later breadth.
- **The other `S` criteria** (1.3.3, 1.4.5, 2.4.4, 3.2.4, 3.3.3) — chosen next by **liability
  weight**, not tractability.
- **Any `claim.ts` sign/verify, `ledger.ts`, schema, or verifier change** beyond the two named
  additions.
- **Auto-applying any semantic fix to the warranted/published state** — structurally
  impossible by invariant #5; a semantic fix is only ever a *proposal* until a human claim
  supersedes it.

## The sized first build item (issue #89)

**One semantic criterion end-to-end: 1.1.1 alt text → semantic proposal → confidence gate →
dashboard approval queue → `human` claim supersedes, with override-rate captured.**

0. **AI layer:** add a `generateObject` path; wrap the alt-text generation to return
   `{ altText, confidence, rationale }`; apply the deterministic veto floor
   (`ai-sdk.ts`, `sanitize-name.ts`, `fixers/alt-text.ts`).
1. **Semantic producer:** derive alt-text `ClaimDraft[]` (`method:'semantic'`, `confidence < 1`,
   `agent-rationale` evidence) and write via the existing `writeClaims` (`ledger.ts`,
   unchanged).
2. **Two spine additions** (`claim.ts`): the `semantic` confidence invariant; and the
   semantic-not-directly-pass-eligible-for-warranty guard at the reconcile/warranty layer.
3. **Approval queue** (`packages/app`): store proposals + diffs + decisions; a dashboard
   surface; approve/edit → a `human` claim that supersedes (reuse `reconcile.ts`,
   `audit-service.ts`, `warranty.ts`).
4. **Override-rate read-model** wired off the queue decision records, per criterion and model.
