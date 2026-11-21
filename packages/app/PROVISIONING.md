# Phase 3 provisioning runbook (M4 go-live)

This is the hand-off runbook for the **interactive Terminal Claude** session. A
non-interactive session cannot run OAuth/browser flows; this one can.

**Operator:** Jacob. **Goal:** stand up Supabase + GitHub App + Vercel so the full
M2–M4 control plane can deploy: webhook ingest, the dashboard, Marketplace billing
ingestion, and dashboard-triggered scans. The composite Action and its
`packages/github-action/src/license.ts` gate stay **untouched** throughout.

---

## 0. Prereqs (once)

In this Terminal Claude session, authorize both connectors:

```
/mcp
```
- Select **supabase** → browser opens → Authorize → close tab.
- Run `/mcp` again → select **vercel** → Authorize → close tab.

Both must read **connected** before continuing. If either isn't listed, the plugin
isn't installed — tell Jacob and stop.

---

## 1. Supabase project + schema

1. Via the Supabase connector (or supabase.com UI), create a project named
   `a11y-fixer` in a region near Jacob. Capture the generated DB password somewhere
   safe (1Password), not in this repo.
2. Apply the schema. The file is `packages/app/db/schema.sql`. Run it against the
   new project (connector `apply_migration` / SQL exec, or paste in the SQL editor).
   One pass stands up the whole schema: `webhook_events`, `installations`, `repos`,
   `scans`, `violations`, `users`, `user_installations`, `subscriptions`, and the
   row-level-security policies. No re-apply needed.
3. Copy three values from **Project Settings → API**:
   - `Project URL`            → **`SUPABASE_URL`**
   - `service_role` secret    → **`SUPABASE_SERVICE_ROLE_KEY`**  (server-only, ⚠️ never client/commit/log)
   - `anon` public key        → **`SUPABASE_ANON_KEY`**  (the dashboard's user-scoped client)

---

## 2. GitHub App registration

The manifest is checked in: `packages/app/github-app-manifest.json` (name
`a11y-fixer`, perms `checks:read, pull_requests:read, contents:read, actions:write,
metadata:read, members:read` — **no** `security-events`; events `installation,
installation_repositories, marketplace_purchase, check_run, pull_request,
github_app_authorization`).

**Note:** the manifest's URLs point at `https://app.a11y-fixer.com/...`. If the
real deploy host differs (e.g. a `*.vercel.app` preview), edit `hook_attributes.url`,
`redirect_url`, `callback_urls`, `setup_url` to match the actual deploy domain
from step 3 **before** registering, or fix them in the App settings afterward.

Register it (manifest flow is easiest — Claude can generate a tiny auto-submitting
HTML form that POSTs `manifest` to
`https://github.com/settings/apps/new` (personal) or
`https://github.com/organizations/<ORG>/settings/apps/new` (org), then `open` it).
GitHub returns, and you then collect:

| Value | Env var | How |
|---|---|---|
| App ID | `GITHUB_APP_ID` | shown on App page |
| Client ID | `GITHUB_APP_CLIENT_ID` | shown on App page |
| Client secret | `GITHUB_APP_CLIENT_SECRET` | **Generate a new client secret** |
| Private key | `GITHUB_APP_PRIVATE_KEY` | **Generate private key** → downloads `.pem`, paste full PEM |
| Webhook secret | `GITHUB_WEBHOOK_SECRET` | you set it: `openssl rand -hex 32` |

> **Not an app secret:** `LICENSE_SIGNING_KEY` is **not** used by `packages/app` —
> license signing lives in the trial site / `@a11y-fixer/licensing`. Do not wire it
> into this Vercel project.

⚠️ `GITHUB_APP_PRIVATE_KEY` is the crown jewel. Vercel env only. Never commit, never
log, never echo in full.

---

## 3. Vercel project + env

1. Via the Vercel connector (or vercel.com UI), create/link a project from this repo
   with **Root Directory = `packages/app`** and **Build Command = `next build`**
   (NOT the package's default `build` script, which is the node-only `tsc` CI gate).
2. Set all **9** env vars for **Production + Preview** (the authoritative set, from
   `app/lib/env.ts` + the webhook route):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `APP_BASE_URL`
   (the deploy origin), `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`,
   `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`.
   In Supabase Auth, enable the **GitHub provider** and point
   it at `GITHUB_APP_CLIENT_ID/SECRET`; set the provider callback to
   `<SUPABASE_URL>/auth/v1/callback` and add `${APP_BASE_URL}/auth/callback` as a
   redirect URL.
3. Note the deploy domain (custom `app.a11y-fixer.com` or the `*.vercel.app`). If it
   differs from the manifest, reconcile the App's webhook/callback URLs (step 2 note).

> The M2 Next.js shell is now in-repo and `next build` passes locally. The package
> `build`/`typecheck` scripts stay `tsc --noEmit -p tsconfig.src.json` (node, src-only)
> so CI stays fast; Vercel runs `next build` (via `tsconfig.json`).

---

## 4. Deploy & verify (M2–M4)

The whole M2–M4 surface is complete in-repo (Next.js shell, webhook route, Supabase
Auth GitHub login, `/dashboard` org→repo views, Marketplace billing ingestion, and
the dashboard "Scan now" mutation route); `pnpm --filter @a11y-fixer/app build:next`
passes locally. The remaining work is deploy + live verify:

1. Apply `packages/app/db/schema.sql` to the Supabase project (step 1 — one pass,
   full schema).
2. Deploy to Vercel (steps 1–3 above). Confirm the build succeeds.
3. Point the GitHub App's webhook URL at `${APP_BASE_URL}/api/webhooks/github` and the
   callback/redirect URLs at `${APP_BASE_URL}/auth/callback`.

Then walk the end-to-end checklist, which exercises every milestone:

- **Signed-out (M2):** the dashboard renders the signed-out state at `APP_BASE_URL`.
- **Auth (M2):** sign in with GitHub → `/dashboard` lists your installations (RLS-scoped).
- **Install + ingest (M2):** install the App on a test repo, run the a11y-fixer Action,
  and verify a real `check_run` lands → a `scans` row appears → the dashboard shows it.
- **Billing (M3):** a `marketplace_purchase` event (test delivery or a real subscribe)
  → a `subscriptions` row.
- **Scan trigger (M4):** the test repo must contain an a11y-fixer workflow with a
  `workflow_dispatch` trigger (required by `selectA11yWorkflow`/`dispatchWorkflow`).
  Click **Scan now** in the dashboard → POST to `/api/installations/<id>/scan` →
  a new Action run is dispatched → its `check_run` flows back as above.

Pregate reminder: any new test-lane gate for new files must land on `main` **first**
(detached worktree → `git push origin HEAD:main`), mirroring M0/M1/M2.
