// Resolve a signed-in user's identity and which installations they may view.
//
// Pure except for an injected `fetch`, so the whole "who can see what" core is
// unit-testable with no network. The thin `app/auth/callback` shell passes the
// real global `fetch` and the OAuth access token; the result is persisted via
// the Store (`upsertUser` + `linkUserInstallation`) and enforced again at the
// database by RLS keyed on `auth.uid()`.
import type { UserRecord } from '../db/store.js';

/** A fetch with just the surface we use, so tests can inject a stub. */
export type FetchLike = (url: string, init?: { headers?: Record<string, string> }) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

const GITHUB_API = 'https://api.github.com';

function authHeaders(token: string): Record<string, string> {
  return {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
  };
}

/** The signed-in GitHub user, from `GET /user`. */
export async function fetchViewer(token: string, fetchImpl: FetchLike): Promise<Omit<UserRecord, 'userId'>> {
  const res = await fetchImpl(`${GITHUB_API}/user`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`GitHub GET /user failed: ${res.status}`);
  const body = (await res.json()) as { login?: unknown; id?: unknown };
  if (typeof body.login !== 'string' || typeof body.id !== 'number') {
    throw new Error('GitHub GET /user returned an unexpected shape');
  }
  return { githubLogin: body.login, githubUserId: body.id };
}

/**
 * The installation ids the user can access, from `GET /user/installations`. Only
 * installations of THIS App are returned by that endpoint (user-to-server token),
 * so the result is already scoped; we just extract the ids.
 */
export async function fetchUserInstallationIds(token: string, fetchImpl: FetchLike): Promise<number[]> {
  const res = await fetchImpl(`${GITHUB_API}/user/installations`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`GitHub GET /user/installations failed: ${res.status}`);
  const body = (await res.json()) as { installations?: unknown };
  if (!Array.isArray(body.installations)) return [];
  return body.installations
    .map(row => (row as { id?: unknown }).id)
    .filter((id): id is number => typeof id === 'number');
}

/**
 * Whether a user may view a requested installation, given the ids they can see.
 * The dashboard calls this before reading an installation's scans so a crafted
 * URL cannot reveal another org's data even before RLS.
 */
export function authorizeInstallationView(viewableIds: number[], requestedId: number): boolean {
  return viewableIds.includes(requestedId);
}
