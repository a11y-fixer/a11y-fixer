# Phase 3 provisioning runbook (M5 go-live)

This is the hand-off runbook for the **interactive Terminal Claude** session. A
non-interactive session cannot run OAuth/browser flows; this one can.

**Operator:** Jacob. **Goal:** stand up Supabase + GitHub App + Vercel so the full
M2–M5 control plane can deploy: webhook ingest, the dashboard, Marketplace billing
ingestion, dashboard-triggered scans, and free-tier license-key delivery. The composite Action and its
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
   `scans`, `violations`, `users`, `user_installations`, `subscriptions`, `licenses`,
   and the row-level-security policies. No re-apply needed.
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

**Note:** the manifest's URLs point at `https://app.a11y-fixer.com/...` and now match
real routes (`hook_attributes.url` → `/api/webhooks/github`, `callback_urls` →
`/auth/callback`, `redirect_url`/`setup_url` → `/dashboard`). If the real deploy host
differs (e.g. a `*.vercel.app` preview), edit all four to match the actual deploy
domain from step 3 **before** registering, or fix them in the App settings afterward.

**OAuth callback caveat:** because sign-in is brokered by the **Supabase** GitHub
provider (step 1), GitHub actually redirects to `<SUPABASE_URL>/auth/v1/callback`,
and Supabase then forwards to `${APP_BASE_URL}/auth/callback`. So after you know
`SUPABASE_URL`, set the App's **Authorization callback URL** (manifest `callback_urls`)
to `<SUPABASE_URL>/auth/v1/callback`. The checked-in `/auth/callback` value is the
app-side placeholder; reconcile it here.

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

> **Required as of M5:** `LICENSE_SIGNING_KEY` (PKCS#8 PEM of the Ed25519 signing
> key) **is** an app secret now — the app mints free-tier license keys with it via
> `@a11y-fixer/licensing`. Use the **same** key the trial site / CLI use so the keys
> verify against the public key embedded in the Action. Vercel env only; never commit
> or log. Before go-live, prove the pair with `node packages/app/scripts/check-signing-key.mjs`.

⚠️ `GITHUB_APP_PRIVATE_KEY` is the crown jewel. Vercel env only. Never commit, never
log, never echo in full.

---

## 3. Vercel project + env

1. Via the Vercel connector (or vercel.com UI), create/link a project from this repo
   with **Root Directory = `packages/app`** and **Build Command = `next build`**
   (NOT the package's default `build` script, which is the node-only `tsc` CI gate).
2. Set all **10** env vars for **Production + Preview** (the authoritative set, from
   `app/lib/env.ts` + the webhook route):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `APP_BASE_URL`
   (the deploy origin), `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`,
   `GITHUB_APP_CLIENT_SECRET`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`,
   `LICENSE_SIGNING_KEY`.
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

## 4. Deploy & verify (M2–M5)

The whole M2–M5 surface is complete in-repo (Next.js shell, webhook route, Supabase
Auth GitHub login, `/dashboard` org→repo views, Marketplace billing ingestion, the
dashboard "Scan now" mutation route, and free-tier license-key provisioning + the
"Set up scanning" panel); `pnpm --filter @a11y-fixer/app build:next`
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
- **License delivery (M5):** confirm `LICENSE_SIGNING_KEY` is set and pairs with the
  Action's embedded public key (`node packages/app/scripts/check-signing-key.mjs`).
  Open the installation's dashboard → the "Set up scanning" panel lazily mints + stores
  a free-tier key (`licenses` row) and reveals it via the copy button. Paste it into the
  Action and confirm it verifies.

Pregate reminder: any new test-lane gate for new files must land on `main` **first**
(detached worktree → `git push origin HEAD:main`), mirroring M0/M1/M2.

---

## 5. Conformance signing key (Phase 1 ledger)

The Conformance Ledger signs every claim with a **dedicated** Ed25519 key — separate
from `LICENSE_SIGNING_KEY` (decision D1), so a license-key leak or rotation can never
touch ledger integrity. It is **optional**: with the key unset the webhook still ingests
scans and `publish` still succeeds, but no signed claims are written and published
statements read *not-yet-warranted*. Provisioning the key is what flips statements to
**warranted**. Set these on the **`a11y-fixer-app`** project only (the website doesn't
sign or verify claims), for **Production + Preview**:

| Value | Env var | Notes |
|---|---|---|
| Private key | `CONFORMANCE_SIGNING_KEY` | PKCS#8 PEM of the Ed25519 private key. **Sealed/sensitive. Never commit or log.** |
| Key id | `CONFORMANCE_KEY_ID` | current key's id, e.g. `conformance-2026` |
| Public key | `CONFORMANCE_PUBLIC_KEY` | SPKI PEM of the public half (used to verify) |
| Keyring (optional) | `CONFORMANCE_KEYRING` | JSON `{keyId: spkiPem}` of **all** keys ever used — rotation-safe; preferred over `CONFORMANCE_PUBLIC_KEY` once you expect to rotate |

Unlike the license key (whose public half is embedded in the Action), the conformance
public key is **not committed anywhere** — "publishing it to the keyring" just means
setting `CONFORMANCE_PUBLIC_KEY` (or `CONFORMANCE_KEYRING`). An empty keyring makes
verification fail **closed** (`unknown-key`), which is the safe default.

### Generate the keypair (readable local / sealed on Vercel)

macOS LibreSSL can't emit ed25519 via `openssl genpkey`; generate with Node:

```sh
node --input-type=module -e '
import { generateKeyPairSync } from "node:crypto";
import { writeFileSync, chmodSync } from "node:fs";
const { privateKey, publicKey } = generateKeyPairSync("ed25519");
writeFileSync("conformance-key.pem", privateKey.export({ type: "pkcs8", format: "pem" }), { mode: 0o600 });
writeFileSync("conformance-pub.pem", publicKey.export({ type: "spki", format: "pem" }));
'
```

Keep the private PEM as a readable local file **only** long enough to provision Vercel,
then move it to 1Password and delete the local copy (per `docs/security/secrets-runbook.md`,
same discipline as `LICENSE_SIGNING_KEY`).

### Prove the pair before trusting it

```sh
CONFORMANCE_SIGNING_KEY="$(cat conformance-key.pem)" \
CONFORMANCE_PUBLIC_KEY="$(cat conformance-pub.pem)" \
CONFORMANCE_KEY_ID=conformance-2026 \
pnpm --filter @a11y-fixer/app conformance:check-key
```

Prints ✅ when the private key, the pinned public key, and the key id all agree (and a
sign→verify round-trip + tamper check pass); exits non-zero otherwise, so CI/ops can gate
on it. Run it **before** provisioning Vercel — the `a11y-fixer-app` project marks env vars
write-only, so `vercel env pull` returns `[SENSITIVE]` placeholders and can't re-verify the
deployed values. The authoritative post-provisioning check is the end-to-end one below.

### Verify the ledger end-to-end

After provisioning, publish one real audit, then:

```sh
pnpm --filter @a11y-fixer/app ledger:verify   # exits non-zero on any broken chain
```

Confirm the backing claims landed, the chain verifies, and the public statement + ledger
dashboard (`/dashboard/<installationId>/ledger`) read **warranted**.

### Rotation

Mint a new key with a new `CONFORMANCE_KEY_ID` (e.g. `conformance-2027`), add its public
half to `CONFORMANCE_KEYRING` **alongside** the old one, and point `CONFORMANCE_SIGNING_KEY`
at the new private key. New claims sign with the new id; historical claims still verify
against the retained old public key. History is never rewritten.
