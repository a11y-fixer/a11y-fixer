# @a11y-fixer/app — control plane (Phase 3)

The hosted GitHub App that augments (does not replace) the CI Action: it mints
installation tokens, ingests the Action's Check Runs for a cross-repo dashboard,
orchestrates multi-repo runs, and sells seats via GitHub Marketplace — while the
plain-`GITHUB_TOKEN` composite Action keeps doing the scanning in customer CI.

## Status: M1 (auth + webhook sink core)

What ships here now is the **framework-agnostic, zero-extra-dependency core**,
fully unit-tested with `node:crypto` (same posture as `@a11y-fixer/licensing`):

- `src/github/app-jwt.ts` — RS256 App JWT minting.
- `src/github/installation-token.ts` — exchange the JWT for a ≤1h installation
  token (held in request memory only, never persisted or logged).
- `src/webhooks/verify.ts` — constant-time HMAC-SHA256 signature verification.
- `src/webhooks/process.ts` — the inbound pipeline: verify → idempotency → route.
- `src/webhooks/handlers/` — `installation` and `installation_repositories`.
- `src/db/store.ts` — the persistence port; `memory-store.ts` (tests) and
  `supabase-store.ts` (production; type-checked, wired in M2).
- `db/schema.sql` — Supabase Postgres schema (installations, repos, idempotency).
- `github-app-manifest.json` — App registration manifest (least-privilege perms).

## Deferred to provisioning (needs interactive Supabase + Vercel auth)

The Next.js App Router shell (`app/api/webhooks/github/route.ts` calling
`processWebhook` once, the dashboard pages), the real `@supabase/supabase-js`
client, `next.config.ts`, and `vercel.json`. These require authorizing the
Supabase and Vercel connectors in an interactive session; they are intentionally
not in M1 so CI stays dependency-light and green.

## Secrets (Vercel env, never committed)

`GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`,
`GITHUB_APP_PRIVATE_KEY` (PEM), `GITHUB_WEBHOOK_SECRET`, `LICENSE_SIGNING_KEY`
(the same Ed25519 PEM the trial site uses), `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`.

## Test

```bash
pnpm --filter @a11y-fixer/app test
pnpm --filter @a11y-fixer/app typecheck
```
