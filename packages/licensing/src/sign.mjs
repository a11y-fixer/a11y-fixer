// The one true license-minting algorithm.
//
// Produces the compact `<payloadB64>.<sigB64>` token that
// packages/github-action/src/license.ts verifies offline against its embedded
// Ed25519 public key. EVERY issuer must go through this function:
//   - scripts/issue-license.mjs (the manual/offline CLI)
//   - packages/app (the GitHub App backend, on a Marketplace purchase)
//   - the external a11y-fixer.com trial-key site (which should import this)
// so no re-implementation can silently drift from what the Action accepts.
//
// Authored as dependency-free, build-free ESM (node: builtins only) on purpose:
// scripts/test-action-bundle.sh mints a key with `node scripts/issue-license.mjs`
// in an isolated checkout that runs NO `pnpm install` and NO build, so this
// module must be runnable straight off disk via a relative import. Keep it that
// way — do not add imports that need installing or compiling.

import { createPrivateKey, sign as cryptoSign } from 'node:crypto';

/**
 * Mints and signs a license token.
 *
 * @param {{ sub: string, days: number, pem: string, now?: Date }} opts
 *   - `sub`  customer id / email (the license subject)
 *   - `days` validity window in days from `now` (must be a positive number)
 *   - `pem`  PKCS#8 PEM of the Ed25519 private signing key
 *   - `now`  issuance time; defaults to `new Date()` (injectable for tests)
 * @returns {{ token: string, payload: { v: 1, sub: string, exp: number }, iat: number, exp: number }}
 */
export function signLicense({ sub, days, pem, now = new Date() }) {
  if (!sub || typeof sub !== 'string') {
    throw new Error('signLicense: `sub` (customer id/email) is required.');
  }
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error('signLicense: `days` must be a positive number.');
  }
  if (!pem) {
    throw new Error('signLicense: `pem` signing key is required.');
  }

  const iat = Math.floor(now.getTime() / 1000);
  const exp = iat + Math.round(days * 86400);
  const payload = { v: 1, sub, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');

  const privateKey = createPrivateKey(pem);
  const sig = cryptoSign(null, Buffer.from(payloadB64, 'ascii'), privateKey).toString('base64url');

  return { token: `${payloadB64}.${sig}`, payload, iat, exp };
}
