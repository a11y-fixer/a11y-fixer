// Mint a GitHub App JWT (RS256), signed with the App's private key.
//
// Used as the Bearer credential to call `POST /app/installations/:id/access_tokens`
// and other App-authenticated endpoints. We sign with `node:crypto` directly
// instead of pulling in `@octokit/auth-app` so the control plane keeps the same
// zero-extra-dependency, fully-unit-testable posture as @a11y-fixer/licensing.
//
// GitHub rules (https://docs.github.com/apps building-a-jwt-for-a-github-app):
//   - alg RS256, iss = App id (or client id)
//   - iat backdated 60s to tolerate clock skew
//   - exp at most 10 minutes after iat (we use the max)
import { createSign } from 'node:crypto';

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export interface AppJwtOptions {
  /** The GitHub App id (numeric) or client id (`Iv1.*` / `lv1.*`). */
  appId: string | number;
  /** The App's RSA private key, PEM-encoded. Server-only, never logged. */
  privateKey: string;
  /** Injectable clock for deterministic tests. */
  now?: Date;
}

/** Longest JWT lifetime GitHub accepts, in seconds. */
export const MAX_JWT_LIFETIME_SECONDS = 600;
/** Backdating applied to `iat` to absorb clock skew, in seconds. */
export const CLOCK_SKEW_SECONDS = 60;

/**
 * Returns a signed `<header>.<payload>.<signature>` JWT string. The token lives
 * in request memory only; callers must never persist or log it.
 */
export function createAppJwt({ appId, privateKey, now = new Date() }: AppJwtOptions): string {
  if (!privateKey) {
    throw new Error('createAppJwt: a PEM private key is required.');
  }
  const nowSec = Math.floor(now.getTime() / 1000);
  const iat = nowSec - CLOCK_SKEW_SECONDS;
  const exp = iat + MAX_JWT_LIFETIME_SECONDS;

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({ iat, exp, iss: String(appId) }));
  const signingInput = `${header}.${payload}`;

  const signature = base64url(createSign('RSA-SHA256').update(signingInput).sign(privateKey));
  return `${signingInput}.${signature}`;
}
