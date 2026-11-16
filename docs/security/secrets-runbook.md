# Secrets handling & key-rotation runbook

Audit-support document (SOC2 evidence for secrets management and change
control). It inventories the sensitive material this product depends on, where
it must live, who may access it, and how to rotate or respond to compromise.

> **Scope note:** This repo is client-side-only — the Action runs inside the
> customer's CI and stores no customer data on infrastructure we control. The
> sensitive artifacts below are **maintainer-held and off-repo by design**.
> See [`data-flow.md`](./data-flow.md) for the full data-flow picture.

---

## 1. Crown-jewel artifacts (maintainer-held)

### 1.1 License signing key (Ed25519 private key)

- **What it is:** The Ed25519 **private** key that mints license tokens.
  Compromise lets an attacker forge unlimited valid licenses, bypassing the
  paid gate entirely. This is the single most sensitive secret in the product.
- **Where it is used:** `scripts/issue-license.mjs` (`signLicense()`), read from
  `--key <path>` or the `LICENSE_SIGNING_KEY` env var (PEM contents). Maintainer
  tooling only; never runs in customer CI.
- **Public half:** The matching **public** key is embedded in
  `packages/github-action/src/license.ts` (`LICENSE_PUBLIC_KEY_PEM`) and is safe
  to ship — it only verifies, it cannot sign.
- **Required storage:** A secrets manager (e.g. 1Password, AWS/GCP Secrets
  Manager, GitHub Actions secret `LICENSE_SIGNING_KEY`). **Never** a plaintext
  file in a synced/laptop folder, never committed to any repo.
- **Access:** Restrict to the minimum set of maintainers who issue licenses.
  Record who has access; review quarterly.
- **CI exposure guard (already in place):** In `.github/workflows/ci.yml` the
  `action-bundle` job only exposes `LICENSE_SIGNING_KEY` on non-PR events —
  `secrets.LICENSE_SIGNING_KEY` is passed only when
  `github.event_name != 'pull_request'`, otherwise an empty string. This
  prevents exfiltration from untrusted PR branches;
  `scripts/test-action-bundle.sh` soft-skips the mint step when the key is empty.
  **Do not weaken this guard.**

#### Rotation procedure

1. Generate a new Ed25519 keypair (keep the old one until step 5 completes).
2. Store the new private PEM in the secrets manager; update
   `LICENSE_SIGNING_KEY` wherever it is referenced.
3. Replace `LICENSE_PUBLIC_KEY_PEM` in
   `packages/github-action/src/license.ts` with the new public key, rebuild the
   bundle (`packages/github-action/dist/`), and ship via a GitHub Release.
   > ⚠️ **Breaking:** Tokens signed with the old key stop verifying once the new
   > release is adopted. Re-issue active customer licenses with the new key
   > **before** deprecating the old public key, or support both keys during a
   > transition window.
4. Re-issue outstanding licenses from the ledger (see §1.2) using the new key.
5. Revoke/destroy the old private key once all active customers are migrated.

### 1.2 License issuance ledger (`.licenses/ledger.jsonl`)

- **What it is:** Append-only JSONL log of issued licenses. Each line contains a
  customer identifier (`sub`, typically an email) → **PII**.
- **Where it is used:** Written by `scripts/issue-license.mjs`; path resolves via
  `--ledger <path>` → `LICENSE_LEDGER` env → default `.licenses/ledger.jsonl`.
- **Repo status:** `.licenses/` is gitignored (`.gitignore`) — "contains
  customer identifiers — never commit." It must never be committed.
- **Required storage:** On the issuing maintainer's secured machine or a secrets
  manager, with disk encryption. Treat as a customer-PII datastore: restricted
  access, backed up securely.
- **Access:** Same restricted maintainer set as the signing key.

---

## 2. Runtime secrets (customer-supplied, handled in the Action)

These are provided by the **customer** as GitHub repo/org secrets and flow
through the Action at runtime. The Action never persists them.

| Secret              | Purpose                                   | Handling |
| ------------------- | ----------------------------------------- | -------- |
| `anthropic-api-key` | Calls to the Anthropic API for AI fixes   | Masked via `core.setSecret()` in `packages/github-action/src/index.ts` |
| `github-token`      | Opening fix PRs (`contents: write` + `pull-requests: write`) | Masked via `core.setSecret()` |
| `license-key`       | Offline license verification (no network) | Masked via `core.setSecret()` |
| `cookies`           | Session cookies for authenticated URL scans | Each cookie `value` masked via `core.setSecret()` before scanning (`index.ts`); injected into the page in `packages/github-action/src/cookies-scanner.ts` (`page.setCookie`); not persisted |

Guidance for customers (document in README/usage): store these as encrypted
GitHub secrets, grant the Action least-privilege token scopes, and prefer
fine-grained PATs or the built-in `GITHUB_TOKEN`.

---

## 3. Incident response — signing key compromise

If the Ed25519 private signing key is suspected leaked:

1. **Rotate immediately** per §1.1 (treat as emergency change).
2. Ship a release with the new public key and, if feasible, add the leaked key
   to a deny path so forged tokens signed by it fail verification.
3. Notify affected customers and re-issue their licenses.
4. Review access logs for the secrets manager to scope the exposure.
5. File a post-incident review (root cause, timeline, remediation) — retain as
   audit evidence.

---

## 4. Related controls

- Dependency hygiene: `.github/dependabot.yml` (weekly npm + actions bumps); all
  workflow `uses:` refs are SHA-pinned.
- Supply-chain integrity: CI diffs the committed `dist/` bundle against source on
  every PR; `release.yml` re-verifies before moving the `v1` tag. README advises
  pinning to a full commit SHA.
- Automated scanning: see `.github/workflows/codeql.yml` (SAST) and GitHub secret
  scanning + push protection (enable in repo settings).
