# Phase 3 provisioning runbook (M2 go-live)

This is the hand-off runbook for the **interactive Terminal Claude** session. The
non-interactive session that wrote it cannot run OAuth/browser flows; this one can.

**Operator:** Jacob. **Goal:** stand up Supabase + GitHub App + Vercel so M2
(check_run ingest + read-only dashboard) can deploy. The composite Action and its
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
   It creates `webhook_events`, `installations`, `repos`.
3. Copy two values from **Project Settings → API**:
   - `Project URL`            → **`SUPABASE_URL`**
   - `service_role` secret    → **`SUPABASE_SERVICE_ROLE_KEY`**  (server-only, ⚠️ never client/commit/log)

> M2 will add `scans`, `violations`, `users`, `user_installations` + RLS to this
> same file; re-apply then.

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
| License signing key | `LICENSE_SIGNING_KEY` | the **same** Ed25519 PEM the trial site already uses — one key, one place |

⚠️ `GITHUB_APP_PRIVATE_KEY` and `LICENSE_SIGNING_KEY` are the crown jewels. Vercel
env only. Never commit, never log, never echo in full.

---

## 3. Vercel project + env

1. Via the Vercel connector (or vercel.com UI), create/link a project from this repo
   with **Root Directory = `packages/app`** and **Build Command = `next build`**
   (NOT the package's default `build` script, which is the node-only `tsc` CI gate).
2. Set all env vars for **Production + Preview**:
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `APP_BASE_URL`
   (the deploy origin), `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`,
   `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`,
   `LICENSE_SIGNING_KEY`. In Supabase Auth, enable the **GitHub provider** and point
   it at `GITHUB_APP_CLIENT_ID/SECRET`; set the provider callback to
   `<SUPABASE_URL>/auth/v1/callback` and add `${APP_BASE_URL}/auth/callback` as a
   redirect URL.
3. Note the deploy domain (custom `app.a11y-fixer.com` or the `*.vercel.app`). If it
   differs from the manifest, reconcile the App's webhook/callback URLs (step 2 note).

> The M2 Next.js shell is now in-repo and `next build` passes locally. The package
> `build`/`typecheck` scripts stay `tsc --noEmit -p tsconfig.src.json` (node, src-only)
> so CI stays fast; Vercel runs `next build` (via `tsconfig.json`).

---

## 4. Deploy the built M2 UI

The M2 code is complete in-repo (Next.js shell, webhook route, Supabase Auth GitHub
login, `/dashboard` org→repo views, `scans`/`violations` + `users`/`user_installations`
+ RLS schema); `next build` passes locally. The remaining work is deploy + live verify:

1. Apply the full `packages/app/db/schema.sql` to the Supabase project (it now
   includes `scans`, `violations`, `users`, `user_installations`, and the RLS policies).
2. Deploy to Vercel (steps 1–3 above). Confirm the build succeeds and the dashboard
   renders the signed-out state.
3. Point the GitHub App's webhook URL at `${APP_BASE_URL}/api/webhooks/github` and the
   callback/redirect URLs at `${APP_BASE_URL}/auth/callback`.
4. Sign in with GitHub, install the App on a repo, trigger the Action, and verify a
   real `check_run` lands → a scan row appears → the dashboard shows it.

Pregate reminder: any new test-lane gate for new files must land on `main` **first**
(detached worktree → `git push origin HEAD:main`), mirroring M0/M1/M2.
