# Phase 1 — The Conformance Ledger: engineering plan

**Status:** BUILT (app side), 2026-11-23; **rebased onto `main` 2026-11-26** (10
commits had landed, incl. the audit/VPAT pipeline below). Phase 0 design docs are
the input: [`claim-model.md`](./claim-model.md),
[`wcag-2.2-aa-matrix.md`](./wcag-2.2-aa-matrix.md). Decisions: D1 **dedicated
conformance signing key** (not the license key); D2 **pass-capable** (contract v2 +
evaluated-set map).

## Reconciliation with the landed audit pipeline (read this first)

While this ledger was in flight, `main` shipped a **second conformance subsystem**
(#65/#66/#67): a human-reviewed **audit → VPAT/ACR → published statement** flow in
`packages/app/src/conformance/` (`audit-service.ts`, `reconcile.ts`, `view-model.ts`,
`documents/*`) + the `audits` / `criterion_verdicts` / `audit_revisions` tables +
the public `statement/[slug]` route. It has its **own `derive.ts`** (scan →
per-criterion `supports`/`partially_supports`/`not_evaluated` machine draft for a
human to review).

These are **complementary layers, not duplicates**:

| | Audit pipeline (landed) | Conformance Ledger (this branch) |
|---|---|---|
| Output | Human-reviewed VPAT/ACR + a published statement | Signed, append-only, tamper-evident claim log |
| Trust model | Human verdict is authoritative | Cryptographic chain is authoritative |
| Vocabulary | VPAT (`supports`…) | Claim states (`pass`/`fail`…) |
| Role in north star | the human-review + document surface (Phase 0 said semantic/human escalate here) | the moat/spine (Phase 1) |

**Integration decisions taken in this rebase:**
- Renamed the ledger's `derive.ts` → **`ledger-derive.ts`** (`deriveClaims`,
  `DerivableScan`) so it no longer collides with the audit `derive.ts`
  (`deriveMachineVerdicts`). Two files, two purposes, no shared symbols.
- Kept both schemas side by side; both `Store`/`MemoryStore`/`SupabaseStore` method
  sets coexist.

**Deferred (follow-on, not this PR):**
- **Share the scan→criterion derivation.** Both files map axe/jsx rule ids → WCAG
  ids independently; fold them onto one source so a `fail` claim and a
  `partially_supports` verdict can never disagree about the same scan.
- ~~**Make the ledger back the published statement.**~~ **DONE (2026-11-26):** a
  published `audit_revision` now references the signed claims that prove it
  (`warranty.ts` + `backingClaims` in the snapshot), verifiable against the chain
  via `verifyAuditWarranty`. See the warranty-link note below.

### Implementation status

Shipped in `packages/app/src/conformance/` + `packages/licensing/` + `packages/app/db/schema.sql`:
- `claim.ts` — claim model, canonical body, content-address id (assertion content
  only, so redelivery is idempotent), Ed25519 sign/verify, invariants.
- `ledger.ts` — `writeClaims` (per-subject chaining + supersedes + evidence dedup)
  and `verifyLedger` (fails closed; detects id / signature / key / chain / evidence
  tampering).
- `derive.ts` + `wcag-matrix.ts` + `evaluated-set.ts` — scan → claim drafts;
  fail at (page, criterion), pass only for the pinned pass-eligible M-criteria on
  demonstrably-scanned files; never a silent pass.
- `keyring.ts` — env-backed signing config + verification keyring (optional; ledger
  off until the key is provisioned).
- `signPayload`/`verifyPayload` extracted in `licensing/src/sign.mjs` (signLicense
  stays byte-identical — golden-token test proves it).
- Store port + MemoryStore + SupabaseStore ledger methods; `schema.sql` tables with
  an append-only trigger and deny-all RLS.
- Webhook wiring: `handleCheckRun` appends claims when a key is configured, threaded
  through `routeEvent`/`processWebhook`. Fails safe (ledger error never drops the scan).
- Tests: 59 new (claim 16, ledger 13, derive 10, keyring 9, handler 5, licensing +6).
  Full suite green: app 195, licensing 14, action 130.

### Remaining to make pass-claims live end-to-end (separate, scoped)

1. ~~**Emit contract v2 from the Action**~~ **DONE (2026-11-26, same PR).**
   `report.ts` bumps `SCAN_REPORT_SCHEMA` to `/2` and carries
   `engine`/`engineVersion`/`scanPath`; `index.ts` stamps the pass-enabling
   provenance ONLY for an unambiguous axe-on-HTML run (`html && !markdown &&
   !components`) and null otherwise (fail-only, no silent pass). The `ncc` dist is
   rebuilt; the committed-bundle smoke test (createRequire guard + scan + report.ts
   path) passes. Shipped WITH the app's v2 acceptance so the contract version moves
   atomically — the app never sees a `/2` it can't parse.
2. ~~**Call `conformanceSigningConfigFromEnv()` in the webhook route**~~ **DONE
   (2026-11-26, same PR):** threaded through `handleWebhookRequest`; the ledger
   activates the moment the key env is set. STILL TODO (ops, not code):
   **provision `CONFORMANCE_SIGNING_KEY` + `CONFORMANCE_KEY_ID` + public key** on
   Vercel (sealed), verify with a `check-signing-key.mjs`-style script.
3. ~~**`ledger:verify` CLI** + dashboard read-model~~ **DONE (2026-11-26):**
   `src/conformance/ledger-verify.ts` adds `buildLedgerReadModel` (walks every
   subject via the new `Store.listSubjectKeys`, re-verifies each chain, then
   collapses it to its current per-criterion state — an unverified chain reports
   its verdict and NO criteria, so a tampered subject can't masquerade as clean)
   and `formatLedgerReport` (the CLI's text + ok flag). The executable is
   `scripts/ledger-verify.ts` (run `pnpm --filter @a11y-fixer/app ledger:verify`,
   `-- --subject <key>` for one subject), via `tsx`; it reads the PUBLIC keyring
   only and exits non-zero on any failed chain so CI/ops can gate on it. Fully
   unit-tested (tamper → fail, supersede collapse, empty keyring fails closed).
   The read-model is the data layer a dashboard page renders later (that page is
   still a follow-on).
4. ~~**CI pregate**: add `src/conformance/*` → test lanes to `.gstack/pregate.json`~~
   **DONE (2026-11-26):** the `packages/app/src/**` lane now runs the integrity-critical
   conformance suites (claim, ledger, ledger-verify, ledger-derive, warranty, derive,
   reconcile, wcag-matrix, keyring, audit-service, audit-authz, view-model,
   documents/audit-document). A conformance change can no longer land without its
   tamper-evidence tests running.

Follow-ons from the Reconciliation section above: ~~fold the two scan→WCAG
derivations onto one source~~ **PARTIALLY DONE (2026-11-26):** criterion LEVEL is
now sourced once from the core catalog (`wcag-matrix.ts` keeps only the producer
bucket; `levelOf` reads `getSuccessCriterion`), with a drift test — a `fail` claim
and a `partially_supports` verdict can no longer disagree on criterion identity or
level. ~~STILL OPEN: make a published `audit_revision` reference the signed claims
that back it (the Phase 4 warranty link).~~ **DONE (2026-11-26) — the warranty link:**
`warranty.ts` maps a published audit's human-reviewed verdicts to `human`-method
claim drafts on a repo-level audit subject (`repo:<id>|audit:conformance`);
`createRevisionForAudit` (given the signing config) signs them into the ledger and
freezes their claim ids into the revision snapshot (`DocumentContext.backingClaims`,
no DB migration — the snapshot is app-owned JSON). `verifyAuditWarranty` re-verifies
the backing chain AND cross-checks that the frozen snapshot still matches the signed
claims, so tampering **either** the snapshot **or** a claim voids the warranty. The
publish route passes `conformanceSigningConfigFromEnv()`; absent the key, publish
still succeeds and the statement is simply not-yet-warranted (graceful, matching the
keyring's run-without-key posture). Writes happen once, before the version-retry loop
and `insertRevision`, so a signing failure leaves no revision and a re-publish retries
cleanly. Tests: `warranty.test.ts` (mapper + 6 verifier cases incl. chain-invalid,
claim-missing, snapshot-divergence, tampered-claim) and `audit-document.test.ts`
(signed end-to-end verify, no-key path, idempotent re-publish).

**Dashboard read-model surface DONE (2026-11-26):** `app/dashboard/[installationId]/ledger/page.tsx`
renders the whole-ledger read-model for an installation (filters to its repos,
re-verifies each chain on load, shows verified/tampered + per-criterion state),
linked from the installation dashboard.

## What Phase 1 builds

An append-only, Ed25519-signed, per-`(subject, criterion)` claim log with
content-hashed evidence, fed by the **existing scanner** on every Check Run. One
evidence producer (the deterministic M-bucket scanner), signed server-side, chained
per subject, with a verify command that detects tampering. This proves the spine.

### Non-goals (explicitly deferred)

- Runtime sensor (Phase 2), AI agent (Phase 3), warranty/SLA (Phase 4).
- Any new customer-facing surface. The ledger is written and verified; the dashboard
  read-model that exposes it is a follow-on, not Phase 1.
- Criteria outside what the scanner evaluates (all R/S/H buckets stay `not-evaluated`).

## The one scope call baked in (was D2 — flag for sign-off)

**The current scan contract (`a11y-fixer.scan/1`) can only produce `fail` claims.**
It carries violations, not the set of criteria evaluated, nor the engine/version/path.
"No violation for 1.1.1" is not "1.1.1 was checked and passed" — and the claim model
(invariant 4) forbids silent passes. So:

- **Fail-only Phase 1** (contract v1 untouched): ledger records violations as `fail`
  claims. Honest, but every non-failing criterion stays `not-evaluated`. The ledger
  can never say a subject *passes* anything — it can't back a warranty, only a
  "known-issues" list.
- **Pass-capable Phase 1 (recommended):** bump to `a11y-fixer.scan/2` adding `engine`,
  `engineVersion`, `scanPath` (`html`|`jsx`|`markdown`), and `truncated` already exists.
  From the pinned engine+version we derive the **evaluated-criteria set** (axe-core /
  jsx-a11y rule catalog → WCAG ids, stored as versioned reference data). A criterion in
  the evaluated set with no violation on a subject → `pass`; with a violation → `fail`;
  not in the set → `not-evaluated`. A `truncated` report emits the `fail` claims it has
  and marks the rest `not-evaluated` (never silent pass).

Recommendation: **pass-capable**. It's a ~1-day contract + reference-data addition that
is the difference between a ledger that can back a conformance *statement* and one that
can only list bugs. Everything below assumes pass-capable; the fail-only path is the
same minus the evaluated-set derivation.

## Architecture

```
  GitHub Action (customer CI, UNTRUSTED)         packages/app backend (holds sealed key)
  ┌───────────────────────────────┐             ┌──────────────────────────────────────┐
  │ scanner → buildScanReport()    │  webhook    │ handleCheckRun()                       │
  │ embeds contract v2 in          │────────────▶│  1. parse + validate contract          │
  │ check_run.output.text          │ check_run.  │  2. upsertScan / replaceViolations     │
  │ (NO private key here)          │ completed   │  3. deriveClaims(report, evaluatedSet) │
  └───────────────────────────────┘             │  4. for each claim: sign + append      │
                                                 │       (prev = subject head)            │
                                                 │  5. store evidence blob by hash        │
                                                 └───────────────┬────────────────────────┘
                                                                 ▼
                                      conformance_claims (append-only, signed, chained)
                                      conformance_evidence (content-addressed blobs)
                                                                 ▲
                                      verifyLedger(subject): walk chain, re-check every sig
```

The key never leaves the backend. The Action is already the evidence producer; step 3–5
is the only new write path, hooked in at `check-run.ts:160` right after `upsertScan`.

## Data model (extends `packages/app/db/schema.sql` + `Store` port + memory fake)

Storage follows the queries: claims are read by `(subject, criterion, time)` and
integrity-constrained, so real columns, not JSON.

```sql
-- One row per signed assertion. Append-only: no UPDATE, no DELETE (enforced by
-- a trigger + revoked table privileges, not just convention).
CREATE TABLE conformance_claim (
  id            TEXT PRIMARY KEY,        -- sha-256 of the canonical body (content address)
  subject_kind  TEXT NOT NULL,          -- 'flow' | 'page' | 'component'
  subject_key   TEXT NOT NULL,          -- canonical subject identity (see below)
  criterion     TEXT NOT NULL,          -- WCAG SC id, e.g. '1.1.1'
  wcag_version  TEXT NOT NULL DEFAULT '2.2',
  level         TEXT NOT NULL,          -- 'A' | 'AA'
  state         TEXT NOT NULL,          -- pass|fail|not-applicable|not-evaluated|human-reviewed
  method        TEXT NOT NULL,          -- 'deterministic' (Phase 1 only)
  confidence    REAL NOT NULL,          -- 1.0 for deterministic
  asserted_by   TEXT NOT NULL,          -- producer id + version, e.g. 'scanner@axe-core/4.9.1'
  asserted_at   TIMESTAMPTZ NOT NULL,
  prev_claim_id TEXT REFERENCES conformance_claim(id),  -- prior claim for this subject_key, or NULL
  supersedes    TEXT REFERENCES conformance_claim(id),  -- prior claim for same (subject,criterion), or NULL
  evidence_hash TEXT REFERENCES conformance_evidence(hash),  -- NULL only when state = not-evaluated
  signature     TEXT NOT NULL,          -- base64url Ed25519 over the canonical body
  key_id        TEXT NOT NULL           -- which conformance public key verifies this
);
CREATE INDEX ON conformance_claim (subject_key, criterion, asserted_at DESC);

-- Per-subject chain head: the latest claim id for a subject_key. One row per subject.
-- Lets the signer read the prev pointer and append atomically without a MAX() scan.
CREATE TABLE conformance_subject_head (
  subject_key   TEXT PRIMARY KEY,
  head_claim_id TEXT NOT NULL REFERENCES conformance_claim(id),
  updated_at    TIMESTAMPTZ NOT NULL
);

-- Content-addressed evidence. Deduplicated: the same scan JSON stored once.
CREATE TABLE conformance_evidence (
  hash        TEXT PRIMARY KEY,         -- sha-256 of blob
  type        TEXT NOT NULL,            -- 'scan-output' in Phase 1
  producer_version TEXT NOT NULL,
  blob        JSONB NOT NULL,           -- the scan contract (or the slice that evidences this claim)
  created_at  TIMESTAMPTZ NOT NULL
);
```

- **`subject_key`** canonical form (Phase 1): `repo:<repoId>|path:<repoRelPath>|node:<ruleTarget>`
  for components, `repo:<repoId>|path:<repoRelPath>` for a page/file. Stable across scans
  so the chain and `supersedes` link the same subject over time. `headSha` is evidence, not
  identity (the subject persists across commits).
- **Append-only is enforced**, not hoped: a `BEFORE UPDATE OR DELETE` trigger raises, and
  the app's DB role lacks `UPDATE`/`DELETE` on `conformance_claim`. Corrections are new
  claims with `supersedes` set.

New `Store` methods (mirrored in `memory-store.ts`):
```ts
appendClaims(claims: SignedClaim[]): Promise<void>;          // atomic: insert + advance head
getSubjectHead(subjectKey: string): Promise<string | null>;
listClaims(subjectKey: string): Promise<SignedClaim[]>;      // chain order, for verify + rollup
putEvidence(e: EvidenceBlob): Promise<void>;                 // idempotent by hash
```

## Signing & chain

- Extract from `packages/licensing/src/sign.mjs` a generic primitive, same file, same
  dependency-free rule:
  ```js
  export function signPayload(bytes, pem)         // → base64url sig
  export function verifyPayload(bytes, sig, pubPem) // → boolean
  ```
  `signLicense` becomes a thin wrapper over `signPayload`. No behavior change to licensing;
  covered by its existing `sign.test.ts` plus new round-trip tests.
- **Canonical body** = deterministic JSON (sorted keys, no whitespace, UTC RFC3339) of every
  claim field *except* `signature`, including `prev_claim_id`. `id` = sha-256 of that body;
  signature is over the same bytes. Chaining falls out: the body commits to `prev_claim_id`,
  which commits to its own body, back to the subject's genesis claim.
- **Key:** new `CONFORMANCE_SIGNING_KEY` (PKCS#8 PEM), readable local / sealed on Vercel,
  provisioned exactly like the license key. Public key(s) pinned in a small keyring keyed by
  `key_id` so verification survives future rotation (old claims verify against the key that
  signed them).

## Claim derivation (deterministic, from the scan report)

```
deriveClaims(report, evaluatedSet, now):
  for each violation v, for each location (or node-less):
     subject = component(repoId, v.path, v.ruleTarget)
     emit fail claim (criterion = wcagId(v.ruleId), evidence = that violation slice)
  if report NOT truncated:
     for each criterion c in evaluatedSet with no violation on a given page subject:
        emit pass claim (page subject, evidence = {engine, version, scanPath, sha})
  # criteria not in evaluatedSet: no claim (implicit not-evaluated)
```

`wcagId(ruleId)` already exists on the violation (`v.wcagId`); the evaluated-criteria set
is derived once per `(engine, engineVersion, scanPath)` and cached as reference data.

## Verify (tamper-evidence — the property the warranty leans on)

`verifyLedger(subjectKey)`:
1. Load the subject's claims in chain order.
2. Recompute each `id` from its canonical body; mismatch → **tampered body**.
3. Re-check each `signature` against the keyring entry for `key_id`; fail → **forged/edited**.
4. Check each `prev_claim_id` equals the previous claim's `id`; gap/reorder → **broken chain**.
5. Check each `evidence_hash` resolves and the blob hashes to it; mismatch → **evidence tampered**.
Exposed as a CLI (`pnpm ledger:verify <subject>`) and a backend function for the later
read-model. Fails **closed**: any check failing marks the subject unverifiable.

## Edge cases (locked)

| case | handling |
|---|---|
| Webhook redelivery (same `checkRunId`) | derivation is idempotent by content: identical claims produce identical `id`s; `appendClaims` is a no-op on existing ids (ON CONFLICT DO NOTHING) and does not advance the head twice. The existing `recordEventOnce` delivery gate still fronts it. |
| `truncated` scan report | emit the `fail` claims present; emit **no** `pass` claims for that subject (can't prove absence); unlisted criteria stay `not-evaluated`. |
| Contract absent / old Action (v1) | record the scan as today; emit `fail` claims only, no `pass` (no evaluated set). No crash, no silent pass. |
| Contract schema the ingester doesn't know | reject the claim-write (log + skip), still record the scan row. Versioned `schema` makes this detectable. |
| Two scans same commit, different paths (html vs jsx job) | different `scanPath` → different evaluated sets → claims coexist; `supersedes` only links same `(subject, criterion)`. |
| Concurrent appends to one subject | `appendClaims` advances the head in one transaction with a row lock on `conformance_subject_head`; second writer serializes or retries. |
| Key rotation | new `key_id` in keyring; new claims sign with it; old claims verify against old pinned key. No rewrite of history. |
| Fix-mode run (`neutral`) vs check-mode | both emit claims; `mode` carried in evidence. A fix-mode run that cleared a violation produces a `pass`/`supersedes` the prior `fail` — this is the ledger showing remediation over time (exactly the Phase 4 story). |

## Test coverage (every behavior, a regression each would catch)

- **Signing primitive:** sign→verify round-trip; tampered byte fails; wrong key fails;
  `signLicense` wrapper still matches the Action's existing verifier (golden token).
- **Canonical body / id:** key order & whitespace independence; `id` reproducible across
  two processes; any field change changes the `id`.
- **Chain:** genesis claim (`prev = null`); N appends link head→head; `verifyLedger` passes
  clean; mutate a body / swap a signature / delete a middle claim / corrupt evidence → each
  distinct failure surfaces.
- **Derivation:** violation→`fail` subject identity; evaluated-set→`pass`; `truncated`→no
  `pass`; v1 contract→fail-only; unknown schema→rejected; redelivery→idempotent (no dup, head
  stable).
- **Store parity:** the memory fake and supabase-store pass the same append/head/evidence
  suite (the existing pattern); append-only trigger rejects UPDATE/DELETE.
- **Idempotency:** replay the same webhook twice → claim set and head identical.

## Risks

1. **Pass-claim correctness depends on the evaluated-set map being right.** A wrong
   rule→criterion mapping would assert a `pass` the scanner didn't actually earn. Mitigation:
   the map is pinned per engine version, generated from the engine's own rule metadata, and
   tested against the matrix; below any doubt, emit `not-evaluated`, never `pass`.
2. **Append-only enforced at the DB, not just app code** — if the app role keeps UPDATE/DELETE,
   the moat is convention only. The grant change is part of this phase, not later.
3. **Subject identity stability.** If `subject_key` shifts (e.g. a file rename), the chain
   forks. Phase 1 treats a renamed path as a new subject; cross-rename linkage is out of scope
   and noted, not silently guessed.

## Open items before build

- Sign off the **pass-capable vs fail-only** scope call above (recommended: pass-capable).
- Confirm the contract v2 addition is acceptable to version now (Action + ingester move together).
- Confidence floor `F` from Phase 0 is not needed until Phase 4; deterministic claims are 1.0.
