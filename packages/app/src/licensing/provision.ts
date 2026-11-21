// Lazy license provisioning: read the installation's stored key, minting (and
// persisting) one only when it's missing or has expired.
//
// Lazy-on-read means an installation that already exists — including the live
// one created before M5 — gets a key the first time its dashboard loads, with
// no webhook replay or backfill job. Idempotent: once stored, the same token is
// returned until it nears expiry.
import type { LicenseRecord, Store } from '../db/store.js';
import { issueFreeLicense } from './issue.js';

export interface ProvisionLicenseOptions {
  installationId: number;
  /** Account login for the license subject (from the installation record). */
  account: string;
  /** PKCS#8 PEM of the Ed25519 signing key (LICENSE_SIGNING_KEY). */
  signingKeyPem: string;
  /** Re-mint when the stored key expires within this many days. */
  renewWithinDays?: number;
  now?: Date;
}

/** Days-before-expiry at which we proactively re-mint, so a key never lapses mid-use. */
export const RENEW_WITHIN_DAYS = 30;

/**
 * Returns a valid license for the installation, minting + persisting one if none
 * exists or the stored one is within `renewWithinDays` of expiry.
 */
export async function getOrCreateInstallationLicense(
  store: Store,
  { installationId, account, signingKeyPem, renewWithinDays = RENEW_WITHIN_DAYS, now = new Date() }: ProvisionLicenseOptions,
): Promise<LicenseRecord> {
  const existing = await store.getLicense(installationId);
  if (existing && !isExpiringSoon(existing, renewWithinDays, now)) {
    return existing;
  }

  const record = issueFreeLicense({ account, installationId, signingKeyPem, now });
  await store.upsertLicense(record);
  return record;
}

function isExpiringSoon(record: LicenseRecord, withinDays: number, now: Date): boolean {
  const expiresMs = new Date(record.expiresAt).getTime();
  const thresholdMs = now.getTime() + withinDays * 86400 * 1000;
  return expiresMs <= thresholdMs;
}
