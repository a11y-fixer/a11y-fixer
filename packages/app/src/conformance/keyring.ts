// Conformance key material, read from the environment.
//
// The DEDICATED conformance key is separate from LICENSE_SIGNING_KEY (decision
// D1): a license-key leak or rotation must never touch the ledger's integrity.
// Signing config is OPTIONAL — when the key is absent the ledger simply does not
// write claims (Phase 1 can run read-ingestion-only until the key is provisioned).
//
// Env:
//   CONFORMANCE_SIGNING_KEY   PKCS#8 PEM of the Ed25519 private key (sealed on Vercel)
//   CONFORMANCE_KEY_ID        keyring id for the current signing key, e.g. 'conformance-2026'
//   CONFORMANCE_PUBLIC_KEY    SPKI PEM of the current public key
//   CONFORMANCE_KEYRING       (optional) JSON { keyId: spkiPem } of ALL keys ever used,
//                             so claims signed by a rotated-out key still verify.
import type { ConformanceConfig } from '../webhooks/handlers/check-run.js';
import type { PublicKeyring } from './claim.js';

/** Signing config for appending claims, or undefined when no key is configured. */
export function conformanceSigningConfigFromEnv(
  envp: NodeJS.ProcessEnv = process.env,
): ConformanceConfig | undefined {
  const signingKeyPem = envp.CONFORMANCE_SIGNING_KEY;
  const keyId = envp.CONFORMANCE_KEY_ID;
  if (!signingKeyPem || !keyId) return undefined;
  return { signingKeyPem, keyId };
}

/**
 * The public keyring for verification: the full CONFORMANCE_KEYRING JSON if set,
 * otherwise the single current key (CONFORMANCE_KEY_ID + CONFORMANCE_PUBLIC_KEY).
 * Returns an empty ring when nothing is configured (verification then fails
 * closed with 'unknown-key', which is the safe outcome).
 */
export function conformanceKeyringFromEnv(envp: NodeJS.ProcessEnv = process.env): PublicKeyring {
  const raw = envp.CONFORMANCE_KEYRING;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const ring: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string') ring[k] = v;
      }
      return ring;
    } catch {
      // fall through to the single-key form
    }
  }
  const keyId = envp.CONFORMANCE_KEY_ID;
  const pub = envp.CONFORMANCE_PUBLIC_KEY;
  return keyId && pub ? { [keyId]: pub } : {};
}
