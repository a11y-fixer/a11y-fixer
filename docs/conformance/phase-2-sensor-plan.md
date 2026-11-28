# Phase 2 — The Runtime Sensor: engineering plan (design spike)

**Status:** design spec, no sensor code yet. Reviewed via `/autoplan` (CEO + eng,
2026-11-27); accepted findings are folded in below. Phase 0 design docs + the Phase 1
ledger are the inputs: [`claim-model.md`](./claim-model.md),
[`wcag-2.2-aa-matrix.md`](./wcag-2.2-aa-matrix.md),
[`phase-1-ledger-plan.md`](./phase-1-ledger-plan.md). This spike closes issue #80 and
**scopes the first build item (issue #81)**.

## Why this phase, and why now

The sensor's output is not a lint result — it is **warrantable evidence**. Everyone can
detect a silent SPA route change; the moat (per the conformance north star) is that this
sensor turns an observation into a **signed, dated, chained, supersede-linked ledger
claim** that an auditor can verify and the business can insure. That is the axis
competitors (axe, Pa11y, Lighthouse CI, Deque) do not have, and it is why Phase 2 attaches
to the Phase 1 ledger rather than emitting a report.

Runtime-observable (R) criteria are ~44% of WCAG 2.2 A+AA (24 of 55), versus ~24% for the
machine-decidable (M) bucket Phase 1 ships — so the sensor is the single biggest
*capability* unlock. But capability is not coverage-in-practice (see the regret note under
Non-goals): the win is only real once the sensor observes a customer's *actual* flows, not
a hand-list. **Sequencing bet:** proof-depth (signed runtime claims) before fix-breadth
(the AI agent), because the warranty is sold on provable, re-assertable conformance, and
the ledger needs runtime evidence before the agent's semantic claims have anything durable
to escalate into.

### First criterion: 4.1.3 Status Messages (SPA route-change announcement)

4.1.3 is the first beachhead because it is both **observable** (no content judgment → a
runtime claim can assert pass/fail at confidence 1.0) **and high-liability**: silent
client-side route changes are a common, frequently-litigated real failure under ADA/EAA —
a screen-reader user is relocated with no announcement and no focus move. It is also
**flow-shaped**, exercising the `flow` subject kind the claim model reserves but no
producer has used. (Before widening past 4.1.3, rank the remaining 23 R-criteria by
liability weight — complaint/settlement frequency — not by tractability, so the next
beachhead is chosen on value, not ease.)

## The architectural bet: a second producer on an unchanged spine

`ClaimMethod` in [`claim.ts`](../../packages/app/src/conformance/claim.ts) is already
`'deterministic' | 'runtime' | 'semantic' | 'human'` — `'runtime'` is defined, it just has
no producer. The integration point is the **`ClaimDraft`** shape from
[`ledger.ts`](../../packages/app/src/conformance/ledger.ts):

```ts
interface ClaimDraft {
  body: Omit<ClaimBody, 'prevClaimId' | 'supersedes' | 'evidenceHash'>;
  evidence: { type: string; producerVersion: string; blob: unknown } | null;
}
```

The sensor emits `ClaimDraft[]` with `body.method: 'runtime'` and hands them to
`writeClaims` — exactly as `deriveClaims` does for the scanner. The goal is **no change to
`ledger.ts`, `claim.ts`'s sign/verify core, the schema, or the verifier.**

> **Pre-build check (do not pre-call this "unchanged"):** the new `flow:` subject key must
> be tolerated by `repoIdOfSubjectKey`'s regex, `verifyLedger`, and `buildLedgerReadModel`,
> which were built for page/component/audit subjects. Confirm each parses/renders a `flow:`
> key before #81; if any drops it, that is a (small) spine change this plan must own, not
> deny.

**Reuse, not rebuild:** off-the-shelf runtime checkers (axe-core runtime rules, Pa11y,
Lighthouse CI) emit pass/fail, not the signed structural evidence blob the ledger requires.
So the sensor **wraps browser primitives, not a checker**, and reuses the existing
`evaluated-set.ts` / `ledger-derive.ts` patterns rather than inventing new plumbing.

## Delivery shape: synthetic headless, via the scan contract

v1 is a **headless Playwright driver** that exercises route transitions in the existing
Action/CI trust boundary, feeding observations to the backend through the **existing scan
contract** (a new sensor engine/scanPath — *not* a standalone job; reusing the contract
keeps onboarding, CI wiring, and pass-eligibility plumbing shared with Phase 1). It never
touches real-user production traffic.

**Flow discovery:** derive the transition set from the app's **router config
(auto-discovery)**, not a hand-maintained list. A hand-list is the #1 six-month regret
vector — it goes stale, and the "doubled coverage" degrades to a sliver of `not-evaluated`.

## Threat model — four hard gates (ship-blockers, not polish)

If the sensor violates any gate, it never gets installed, so they decide the design first.

### 1. Zero measurable perf cost on the production path
v1 is synthetic and runs in CI, so production perf cost is **structurally zero** — not
"optimized." A production RUM / injected SDK (real-user perf + data) is a **non-goal for
v1**, deferred to a later opt-in phase.

### 2. No PII capture — including in accessible names
The blob records **structure only** and redacts **at capture** in the browser context.
Beyond input values / body copy / query tokens, note the sharp edge: **accessible *names*
and *roles* can themselves carry PII** (a user's name in the nav, an email in a heading, an
order number in a label). The rule: accessible names are **hashed/bucketed for structural
comparison, never stored verbatim**. A "structural" blob that stores raw accessible names
would leak real user data and break the moat's credibility — so this is tested against a
PII-in-name fixture, not assumed.

### 3. Sampled, bounded traffic
"Sampling" for synthetic v1 = the capped set of auto-discovered transitions exercised.
Bounded by construction.

### 4. CI signal-to-noise (the real adoption gate for a CI-resident sensor)
A sensor that reds the build on a flaky transition gets disabled the way a noisy linter
gets silenced. So: deterministic evidence (gate #below), a settle signal that doesn't
false-time-out, a surfaced `not-evaluated` rate, and a **debounced regression alert**
(a flake `fail→pass→fail` pages once, not thrice).

## The observation (4.1.3) — presence is not announcement

Drive a route transition `A → B`. After it settles, assert `pass` iff **either**:
- a live region (`aria-live`/`role=status`/`role=alert`) **changed its text content across
  the transition** — detected *structurally* (content-hash / child-count / `aria-busy`
  transition), never by storing the text; a region that merely *exists*, or whose content
  did not change, announces nothing and is **not** a pass; **or**
- focus moved to a node **inside the after-snapshot's new subtree** (not merely "focus is
  on `<main>`").

Neither → `fail` (silent route change). Ambiguous / didn't settle → `not-evaluated`, never
a guessed pass. Directly observed ⇒ confidence 1.0.

**Settle signal:** a main-region mutation-observer quiescence window (or an app-provided
ready signal), with a timeout → `not-evaluated` backstop. Bare network-idle is unreliable
(polling / websockets / analytics beacons never idle → everything silently times out while
CI stays green).

## Ledger attachment

```
  Synthetic driver (CI, UNTRUSTED — ships FACTS only)   backend (holds sealed key, JUDGES)
  ┌────────────────────────────────────┐   authn'd     ┌──────────────────────────────────────┐
  │ Playwright drives route A → B       │   ingest      │ validate observation shape (reject     │
  │ observer records a11y-tree delta +  │──────────────▶│   malformed/forged)                    │
  │ live-region/focus facts (redacted,  │               │ sensorDerive(facts) → pass/fail        │
  │  names hashed) (NO private key)     │               │   → ClaimDraft[] (method: 'runtime')   │
  └────────────────────────────────────┘               │ writeClaims → sign + chain + supersede │
                                                        └───────────────┬────────────────────────┘
                                                                        ▼
                                       conformance_claim (append-only, signed, chained)
                                       conformance_evidence (dom-trace blobs, content-addressed)
```

- **Trust boundary (security):** the driver is **untrusted** and ships *facts only*; the
  **backend decides pass/fail** (`sensorDerive(facts)`) and holds the signing key. The
  ingest endpoint **authenticates the driver** and **validates observation shape** — an
  unauthenticated ingest that signs whatever a CI job posts would let a compromised job mint
  confidence-1.0 "pass" claims, destroying the ledger's entire trust value.
- **Claim:** `method: 'runtime'`, `confidence: 1.0`, `assertedBy:
  'runtime-sensor@playwright/<ver>'`, `state: pass|fail`, `evidenceHash` = the `dom-trace`
  blob hash.
- **Subject:** route-change is **flow-level** → new helper `flowSubjectKey(repoId, flowId)`
  = `repo:<id>|flow:<flowId>` in `claim.ts`, mirroring the existing
  `pageSubjectKey`/`componentSubjectKey`/`auditSubjectKey` helpers.
- **`flowId` stability (chain identity):** derive `flowId` from a **stable human-assigned
  flow name (hashed)**, never the URL pair — a router refactor must not fork conformance
  history. Define rename/alias behavior so a renamed route aliases onto the same chain.
- **Evidence determinism:** redaction must also **normalize** volatile ids and ordering so
  two runs of a structurally-identical transition hash identically. Otherwise every
  scheduled run appends a "new" claim forever (unbounded growth, phantom regressions).
- **Regression falls out of the ledger:** a `pass→fail` flip writes a claim that
  `supersedes` the prior one on the same `(flow, 4.1.3)` chain; a **debounced** alert
  surfaces it on the existing ledger read-model.

### Scope-of-guarantee (the warranty honesty decision)
A runtime `pass` only holds for the **enumerated/auto-discovered flows**, not the whole
product. **Decision:** runtime claims carry a **visible flow-scope caveat into the
conformance record** — the VPAT/ACR generation must render a runtime-backed criterion with
its flow-scope qualifier, never as an unqualified criterion-level `supports`. A flow-scoped
pass surfaced as a blanket pass is an over-promise with legal exposure, and this path feeds
the auto-generated conformance statement, so it is decided here, before #81.

### Two small `claim.ts` additions #81 carries
1. A **`runtime` confidence invariant** in `assertWellFormed`: allow `< 1` for sampled
   inference while directly-observed facts assert 1.0 (today only `deterministic` and
   `semantic` are constrained).
2. A **runtime pass-eligibility set** — the analog of `evaluated-set.ts`'s
   `passEligibleCriteria`, pinning which R-criteria a sensor run may assert. First entry:
   `4.1.3`. Keeps "no silent pass" honest for the runtime producer.

## Edge cases (locked)

| case | handling |
|---|---|
| Live region present but text unchanged | **not** a pass (A1) — requires a content delta. |
| Transition never settles (polling/ws app) | mutation-quiescence window; timeout → `not-evaluated`; the not-evaluated rate is surfaced in CI (A4). |
| App has no routing | no transitions → no 4.1.3 claims (`not-evaluated`), not `fail`. |
| Re-run, unchanged transition | normalized redaction → identical evidence hash → idempotent append, head stable (A5). |
| Flaky transition (fail→pass→fail) | each run is an honest claim; the **alert** debounces so a human is paged once (A7). |
| Router refactor renames a route | stable hashed `flowId` / alias → same chain, history preserved (A3). |
| Compromised/forged CI observation | backend authn + shape validation + backend-side judging rejects it (A9). |

## Test coverage (first build)

Full matrix in the eng-review test-plan artifact
(`~/.gstack/projects/a11y-fixer-a11y-fixer-pro/jajjer-issue-80-eng-review-test-plan-*.md`).
Highest-risk cases that MUST have tests: present-but-unchanged live region → not pass (A1);
PII-in-accessible-name → hashed, not stored (A8); determinism (same fixture twice → same
hash, A5); renamed route → no chain fork (A3); backend rejects forged observations (A9);
regression-alert debounce (A7). Plus the happy/silent/focus/timeout observer cases,
`sensorDerive` → `ClaimDraft`, and `writeClaims` → `verifyLedger`.

Per the repo's operational note: before `packages/app` vitest, run `pnpm install` +
`pnpm --filter @a11y-fixer/core build`, and use `--reporter=tap`.

## Risks

1. **False-pass heuristic (A1).** Mitigated by the content-delta rule + a fixture matrix +
   `not-evaluated` under ambiguity. Never a guessed pass.
2. **Accessible-name PII (A8).** The one place a "structural" blob can still leak real user
   data; mitigated by hashing names and a PII-in-name test.
3. **Flow identity (A3).** Unstable `flowId` forks history; mitigated by stable hashed
   names + alias-on-rename.
4. **Render nondeterminism (A5).** Mitigated by normalization + a determinism test.
5. **Ingest trust (A9).** Mitigated by authn + server-side judging.
6. **Synthetic ≠ real users.** Claims are flow-scoped and surfaced as such (scope-of-
   guarantee above); the RUM phase that would widen this is deferred behind its own gate.
7. **Playwright as a CI dependency (A11).** Browser binaries, version drift, and flake are
   the real recurring operational cost of this phase; the CI signal-to-noise gate exists to
   keep it from being disabled.

## Non-goals (explicitly deferred)

- **Production RUM / injected SDK** — opt-in later phase, its own perf + PII gate.
- **The other 23 R-criteria** — v1 proves 4.1.3 end-to-end; the rest are the backlog this
  spine scales into, chosen next by **liability weight**, not tractability.
- **Any `claim.ts` sign/verify, `ledger.ts`, schema, or verifier change** — beyond the two
  small `claim.ts` additions above, the producer attaches to the unchanged spine (pending
  the `flow:` pre-build check).

## The sized first build item (issue #81)

**One dynamic failure class end-to-end: sensor → claim → ledger → regression alert, 4.1.3
route-change only.**

0. **Pre-build check:** confirm `flow:` subjects parse/render through
   `repoIdOfSubjectKey`/`verifyLedger`/`buildLedgerReadModel` (A2).
1. **Driver** — headless Playwright over **auto-discovered** route transitions, via a new
   engine/scanPath on the **existing scan contract** (A10/H3).
2. **Observer** — a11y-tree + live-region *text-delta* + focus-into-new-subtree, settle via
   mutation quiescence; redact + **hash accessible names** + **normalize** at capture
   (A1/A4/A5/A8).
3. **Backend `sensor-derive.ts`** — authenticate + validate the ingest, **judge pass/fail
   server-side**, emit `runtime` `ClaimDraft[]` on `flow:` subjects with `dom-trace`
   evidence (mirror `ledger-derive.ts`) (A9).
4. **Ledger** — feed existing `writeClaims`; add `flowSubjectKey` (stable hashed id +
   alias), the runtime confidence invariant, and the runtime pass-eligibility set (`4.1.3`)
   (A3).
5. **Regression alert** — **debounced** pass→fail flip on the existing ledger read-model;
   runtime claims surfaced with their **flow-scope caveat** into the conformance record
   (A7/H2).
