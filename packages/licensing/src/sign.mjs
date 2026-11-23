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

import {
  createPrivateKey,
  createPublicKey,
  sign as cryptoSign,
  verify as cryptoVerify,
} from 'node:crypto';

/**
 * The raw Ed25519 signing primitive shared by license minting and the
 * conformance ledger. Signs the exact bytes given — no framing, no encoding — so
 * the caller owns canonicalization. Returns a base64url signature.
 *
 * @param {Buffer | string} bytes  the message bytes (a string is read as ASCII)
 * @param {string} pem  PKCS#8 PEM of the Ed25519 private key
 * @returns {string} base64url signature
 */
export function signPayload(bytes, pem) {
  if (!pem) throw new Error('signPayload: `pem` signing key is required.');
  const msg = typeof bytes === 'string' ? Buffer.from(bytes, 'ascii') : bytes;
  if (!Buffer.isBuffer(msg)) throw new Error('signPayload: `bytes` must be a Buffer or string.');
  return cryptoSign(null, msg, createPrivateKey(pem)).toString('base64url');
}

/**
 * Verifies a base64url Ed25519 signature over the exact bytes given, against an
 * SPKI PEM public key. Never throws on a bad signature — returns false.
 *
 * @param {Buffer | string} bytes  the message bytes (a string is read as ASCII)
 * @param {string} sigB64  base64url signature (as produced by signPayload)
 * @param {string} pubPem  SPKI PEM of the Ed25519 public key
 * @returns {boolean}
 */
export function verifyPayload(bytes, sigB64, pubPem) {
  if (!pubPem) throw new Error('verifyPayload: `pubPem` public key is required.');
  const msg = typeof bytes === 'string' ? Buffer.from(bytes, 'ascii') : bytes;
  if (!Buffer.isBuffer(msg)) throw new Error('verifyPayload: `bytes` must be a Buffer or string.');
  try {
    return cryptoVerify(null, msg, createPublicKey(pubPem), Buffer.from(sigB64, 'base64url'));
  } catch {
    return false;
  }
}

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

  // Sign the ASCII bytes of the payload segment — unchanged from the original
  // inline call, so existing tokens and the Action's verifier still agree.
  const sig = signPayload(Buffer.from(payloadB64, 'ascii'), pem);

  return { token: `${payloadB64}.${sig}`, payload, iat, exp };
}
