# @a11y-fixer/app — control plane (Phase 3)

The hosted GitHub App that augments (does not replace) the CI Action: it mints
installation tokens, ingests the Action's Check Runs for a cross-repo dashboard,
orchestrates multi-repo runs, and sells seats via GitHub Marketplace — while the
plain-`GITHUB_TOKEN` composite Action keeps doing the scanning in customer CI.

## Status: M5 (webhook ingest + dashboard + Marketplace billing + dashboard-triggered scans + free-tier license delivery — code complete, deploy pending)

The **framework-agnostic core** (unit-tested with `node:crypto`,
same posture as `@a11y-fixer/licensing`) is the CI-gated heart. It carries no
Next/React/Supabase imports; its only runtime npm dependencies are the two
conformance document renderers noted below:

- `src/github/app-jwt.ts` — RS256 App JWT minting.
- `src/github/installation-token.ts` — exchange the JWT for a ≤1h installation
  token (held in request memory only, never persisted or logged).
- `src/github/scan-orchestrator.ts` — M4 dispatch: mint one installation token,
  discover each repo's a11y-fixer workflow, and `workflow_dispatch` it.
- `src/licensing/issue.ts` — mint a free-tier license key (1-year validity) through
  the one canonical `@a11y-fixer/licensing` signer, byte-identical to what the
  Action's `verifyLicenseKey` accepts.
- `src/licensing/provision.ts` — lazy get-or-create: read the installation's stored
  key, minting + persisting one only when missing or near expiry. First dashboard
  load mints for any installation (incl. pre-M5 ones), no backfill job.
- `src/webhooks/verify.ts` — constant-time HMAC-SHA256 signature verification.
- `src/webhooks/process.ts` — the inbound pipeline: verify → idempotency → route.
- `src/webhooks/handlers/` — `installation`, `installation_repositories`, `check_run`,
  `marketplace_purchase`.
- `src/http/webhook-request.ts` — the route's real logic: read a `Request`, run the
  pipeline once, map the result → HTTP status. Fully unit-tested, no Next runtime.
- `src/db/store.ts` — the persistence port; `memory-store.ts` (tests) and
  `supabase-store.ts` (production, structural `SupabaseLike`, CI-excluded).
- `src/conformance/*` — the Conformance (VPAT/ACR) audit workflow. `derive.ts`
  crosses a scan's violations with the `@a11y-fixer/core` WCAG catalog to
  produce a machine-verdict **draft**; `reconcile.ts` + `audit-service.ts` layer
  a human reviewer's verdicts on top and enforce an honesty gate that forbids
  publishing any criterion as "Supports" on automated evidence alone. This
  produces the reviewed conformance record, which `src/conformance/documents/*`
  renders as four document kinds — VPAT/ACR, accessibility statement, remediation
  roadmap, and conformance letter — in HTML, PDF, and DOCX
  (`vpat.ts`/`statement.ts`/`roadmap.ts`/`letter.ts` build a format-agnostic
  model that the HTML/PDF/DOCX renderers consume). Documents still require human
  review before publishing: a draft export carries a visible "not for
  distribution" watermark so an in-progress draft can never be mistaken for a
  final conformance claim. Publishing an audit freezes an immutable **revision**
  (`audit_revisions`): `audit-document.ts` snapshots the reconciled record +
  metadata so a published document never drifts if the WCAG catalog or repo
  metadata later changes in code. Each revision carries an unguessable
  `public_slug` that backs the public, unauthenticated statement permalink
  (`/statement/[slug]` below); `version` increments per repo for a visible
  revision history.
- `src/dashboard/aggregate.ts` + `view-model.ts` — pure summary + render mappers.
- `src/auth/installations.ts` — pure GitHub identity + installation-visibility
  resolution (seamed `fetch`), unit-tested.
- `db/schema.sql` — Supabase Postgres schema incl. `scans`/`violations`, the
  `users`/`user_installations` + RLS auth model, `subscriptions` (Marketplace billing),
  and `licenses` (per-installation free-tier key, keyed by `installation_id`).
  Adds `audits` + `criterion_verdicts` for the conformance-audit workflow
  (machine + human verdicts per WCAG criterion), and `audit_revisions` for the
  immutable published snapshots behind the public statement permalink.

### Next.js layer (`app/**`) — typechecked by `next build`, not the CI `tsc` gate

Thin shells over the tested core: `app/api/webhooks/github/route.ts` (one call to
`handleWebhookRequest`), Supabase Auth GitHub login under `app/auth/**`, the
read-only `/dashboard` org→repo pages, and the per-installation
`app/dashboard/[installationId]/page.tsx` "Set up scanning" panel that provisions
(lazily mints) and reveals the installation's license key via `CopyButton.tsx`,
and the conformance-audit pages (`app/dashboard/[installationId]/audits/**` to
list, start, and review drafts, with download links for each generated
document, the public permalink, and the per-repo revision history) over the
`audits`/`verdict`/`publish` routes and the authenticated, read-only `document`
download route (`?doc=acr|statement|roadmap|letter&format=html|pdf|docx`)
under `app/api/installations/[installationId]/audits/**`. Published documents
are also served over the public, unauthenticated permalink
`app/statement/[slug]/route.ts` (same doc/format query), gated solely by
possession of the revision's unguessable `public_slug` — it reads via the
service-role key and serves the frozen snapshot, so it is outside the
`/dashboard` auth middleware by design.
Every Next/React/Supabase import lives here
so `src/**` stays framework-free. The only runtime npm dependencies under `src/**`
are the conformance document renderers: `src/conformance/documents/docx.ts` (`docx`,
for the DOCX export) and `pdf.ts` (`puppeteer-core` + `@sparticuz/chromium`, loaded
lazily at request time and kept out of the client bundle via `serverExternalPackages`);
the model and the HTML/VPAT/statement/roadmap/letter builders beside them stay dependency-free.
CI build/typecheck is `tsc --noEmit -p tsconfig.src.json`
(node, src-only); `next build` (via `tsconfig.json`) runs on Vercel only.

## Deferred to provisioning (needs interactive Supabase + Vercel auth)

`next build` + deploy on Vercel, applying `db/schema.sql` to the live Supabase
project, wiring the 10 env vars (below), pointing the GitHub App webhook at the
deploy, and walking the M2–M5 verify checklist (sign-in → install → `check_run`
ingest → `marketplace_purchase` → dashboard "Scan now" → license key delivery).
See `PROVISIONING.md`.
The code is complete and `next build` passes locally; only the live deploy/verify
needs an interactive session.

## Secrets (Vercel env, never committed)

`GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`,
`GITHUB_APP_PRIVATE_KEY` (PEM), `GITHUB_WEBHOOK_SECRET`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (dashboard user-scoped client),
`APP_BASE_URL` (the deploy origin, for OAuth redirects), and `LICENSE_SIGNING_KEY`.

`LICENSE_SIGNING_KEY` (PKCS#8 PEM of the Ed25519 signing key) **is required** as of
M5 — `app/lib/env.ts` reads it via `required()`. The app mints free-tier license
keys with it through `@a11y-fixer/licensing`, the same signer the trial site and
offline CLI use, so the keys verify against the public key embedded in the Action.

`ADMIN_GITHUB_LOGINS` (optional, comma/space-separated GitHub logins) gates the
internal `/dashboard/telemetry` analytics page. When unset, the page 404s for
everyone; list your own login to view opt-in Action usage events.

## Test

```bash
pnpm --filter @a11y-fixer/app test        # vitest (src core)
pnpm --filter @a11y-fixer/app typecheck    # tsc on src (the CI gate)
pnpm --filter @a11y-fixer/app build:next   # next build (app/** shells; Vercel's build command)
```
