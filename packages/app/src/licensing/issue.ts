// Mint a free-tier license key for an installation.
//
// Everyone is on the free tier for now, so every installation gets a validly
// signed key with a long (1-year) validity. The key is minted through the ONE
// canonical signer (`@a11y-fixer/licensing`), the same function the offline CLI
// and the trial site use, so what we hand out is byte-identical to what the
// Action's `verifyLicenseKey` already accepts. When a paid tier arrives, gate
// `days`/issuance on the subscription here — the Action side does not change.
import { signLicense } from '@a11y-fixer/licensing';
import type { LicenseRecord } from '../db/store.js';

/** Free-tier validity window. Re-minted on expiry (see getOrCreateLicense). */
export const FREE_LICENSE_DAYS = 365;

export interface IssueFreeLicenseOptions {
  /** Account login the key is minted for; becomes the license `sub`. */
  account: string;
  /** Installation the key belongs to. */
  installationId: number;
  /** PKCS#8 PEM of the Ed25519 signing key (LICENSE_SIGNING_KEY). */
  signingKeyPem: string;
  /** Validity window in days; defaults to FREE_LICENSE_DAYS. */
  days?: number;
  /** Issuance time; defaults to now. Injectable for tests. */
  now?: Date;
}

/** Mints a free license and shapes it into a persistable LicenseRecord. */
export function issueFreeLicense({
  account,
  installationId,
  signingKeyPem,
  days = FREE_LICENSE_DAYS,
  now = new Date(),
}: IssueFreeLicenseOptions): LicenseRecord {
  const { token, exp } = signLicense({ sub: account, days, pem: signingKeyPem, now });
  return {
    installationId,
    sub: account,
    token,
    issuedAt: now.toISOString(),
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}
