// Exchange an App JWT for a short-lived installation access token.
//
// Installation tokens are the credential the control plane uses to act on an
// org's repos (read Check Runs, dispatch workflows in M4). They expire in <=1h
// and are minted on demand. SECURITY INVARIANT: the returned token is held in
// request memory only. It is never written to the database, a log line, or an
// error message. Do not add the token to any thrown Error.
import { createAppJwt } from './app-jwt.js';

export interface InstallationToken {
  /** The `ghs_*` installation token. Never persist or log this value. */
  token: string;
  /** ISO-8601 expiry (<= 1h out) returned by GitHub. */
  expiresAt: string;
}

type FetchLike = typeof fetch;

export interface GetInstallationTokenOptions {
  appId: string | number;
  privateKey: string;
  installationId: number;
  /** Injectable for tests; defaults to the global `fetch`. */
  fetchImpl?: FetchLike;
  /** Injectable clock passed through to JWT minting. */
  now?: Date;
  /** Override for GitHub Enterprise Server. */
  baseUrl?: string;
}

/**
 * Mints a JWT, calls `POST /app/installations/:id/access_tokens`, and returns
 * the installation token. Throws on a non-2xx response WITHOUT including the
 * JWT or any credential in the message.
 */
export async function getInstallationToken(
  opts: GetInstallationTokenOptions,
): Promise<InstallationToken> {
  const {
    appId,
    privateKey,
    installationId,
    fetchImpl = fetch,
    now,
    baseUrl = 'https://api.github.com',
  } = opts;

  const jwt = createAppJwt({ appId, privateKey, now });
  const res = await fetchImpl(`${baseUrl}/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to mint installation token for installation ${installationId}: ` +
        `${res.status} ${res.statusText}`,
    );
  }

  const body = (await res.json()) as { token: string; expires_at: string };
  return { token: body.token, expiresAt: body.expires_at };
}
