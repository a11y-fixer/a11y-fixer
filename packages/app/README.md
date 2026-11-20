# @a11y-fixer/app — control plane (Phase 3)

The hosted GitHub App that augments (does not replace) the CI Action: it mints
installation tokens, ingests the Action's Check Runs for a cross-repo dashboard,
orchestrates multi-repo runs, and sells seats via GitHub Marketplace — while the
plain-`GITHUB_TOKEN` composite Action keeps doing the scanning in customer CI.

## Status: M2 (check_run ingest + dashboard UI — code complete, deploy pending)

The **framework-agnostic, zero-dependency core** (unit-tested with `node:crypto`,
same posture as `@a11y-fixer/licensing`) is the CI-gated heart:

- `src/github/app-jwt.ts` — RS256 App JWT minting.
- `src/github/installation-token.ts` — exchange the JWT for a ≤1h installation
  token (held in request memory only, never persisted or logged).
- `src/webhooks/verify.ts` — constant-time HMAC-SHA256 signature verification.
- `src/webhooks/process.ts` — the inbound pipeline: verify → idempotency → route.
- `src/webhooks/handlers/` — `installation`, `installation_repositories`, `check_run`.
- `src/http/webhook-request.ts` — the route's real logic: read a `Request`, run the
  pipeline once, map the result → HTTP status. Fully unit-tested, no Next runtime.
- `src/db/store.ts` — the persistence port; `memory-store.ts` (tests) and
  `supabase-store.ts` (production, structural `SupabaseLike`, CI-excluded).
- `src/dashboard/aggregate.ts` + `view-model.ts` — pure summary + render mappers.
- `src/auth/installations.ts` — pure GitHub identity + installation-visibility
  resolution (seamed `fetch`), unit-tested.
- `db/schema.sql` — Supabase Postgres schema incl. `scans`/`violations` and the
  `users`/`user_installations` + RLS auth model.

### Next.js layer (`app/**`) — typechecked by `next build`, not the CI `tsc` gate

Thin shells over the tested core: `app/api/webhooks/github/route.ts` (one call to
`handleWebhookRequest`), Supabase Auth GitHub login under `app/auth/**`, and the
read-only `/dashboard` org→repo pages. Every Next/React/Supabase import lives here
so `src/**` stays zero-dep. CI build/typecheck is `tsc --noEmit -p tsconfig.src.json`
(node, src-only); `next build` (via `tsconfig.json`) runs on Vercel only.

## Deferred to provisioning (needs interactive Supabase + Vercel auth)

`next build` + deploy on Vercel, applying `db/schema.sql` to the live Supabase
project, wiring the 8 env vars (+ `SUPABASE_ANON_KEY`, `APP_BASE_URL`), pointing
the GitHub App webhook at the deploy, and verifying a real `check_run` lands. See
`PROVISIONING.md`. The code is complete and `next build` passes locally; only the
live deploy/verify needs an interactive session.

## Secrets (Vercel env, never committed)

`GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`,
`GITHUB_APP_PRIVATE_KEY` (PEM), `GITHUB_WEBHOOK_SECRET`, `LICENSE_SIGNING_KEY`
(the same Ed25519 PEM the trial site uses), `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (dashboard user-scoped client),
`APP_BASE_URL` (the deploy origin, for OAuth redirects).

## Test

```bash
pnpm --filter @a11y-fixer/app test        # vitest (src core)
pnpm --filter @a11y-fixer/app typecheck    # tsc on src (the CI gate)
pnpm --filter @a11y-fixer/app build:next   # next build (app/** shells; Vercel's build command)
```
