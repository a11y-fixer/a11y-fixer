// Type declarations for the dependency-free signing module (sign.mjs).

export interface LicensePayload {
  v: 1;
  sub: string;
  exp: number;
}

export interface SignLicenseOptions {
  /** Subject — customer id or email. */
  sub: string;
  /** Validity window in days from `now`. Must be a positive number. */
  days: number;
  /** PKCS#8 PEM of the Ed25519 private signing key. */
  pem: string;
  /** Issuance time; defaults to `new Date()`. Injectable for tests. */
  now?: Date;
}

export interface SignLicenseResult {
  /** Compact `<payloadB64>.<sigB64>` license token. */
  token: string;
  payload: LicensePayload;
  /** Issued-at (unix seconds). */
  iat: number;
  /** Expiry (unix seconds). */
  exp: number;
}

/** Mints and signs a license token. The one true minting algorithm. */
export function signLicense(opts: SignLicenseOptions): SignLicenseResult;
