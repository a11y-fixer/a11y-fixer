import { describe, expect, it } from 'vitest';
import {
  authorizeInstallationView,
  fetchUserInstallationIds,
  fetchViewer,
  type FetchLike,
} from './installations.js';

function stubFetch(routes: Record<string, { ok?: boolean; status?: number; body: unknown }>): FetchLike {
  return async (url: string) => {
    const route = routes[url];
    if (!route) throw new Error(`unexpected fetch: ${url}`);
    return {
      ok: route.ok ?? true,
      status: route.status ?? 200,
      json: async () => route.body,
    };
  };
}

describe('fetchViewer', () => {
  it('returns the login and id', async () => {
    const fetchImpl = stubFetch({
      'https://api.github.com/user': { body: { login: 'octocat', id: 583231 } },
    });
    expect(await fetchViewer('tok', fetchImpl)).toEqual({ githubLogin: 'octocat', githubUserId: 583231 });
  });

  it('throws on a non-ok response', async () => {
    const fetchImpl = stubFetch({ 'https://api.github.com/user': { ok: false, status: 401, body: {} } });
    await expect(fetchViewer('tok', fetchImpl)).rejects.toThrow(/401/);
  });

  it('throws on an unexpected shape', async () => {
    const fetchImpl = stubFetch({ 'https://api.github.com/user': { body: { login: 1, id: 'x' } } });
    await expect(fetchViewer('tok', fetchImpl)).rejects.toThrow(/unexpected shape/);
  });
});

describe('fetchUserInstallationIds', () => {
  it('extracts numeric ids', async () => {
    const fetchImpl = stubFetch({
      'https://api.github.com/user/installations': {
        body: { installations: [{ id: 1 }, { id: 2 }, { id: 'skip' }, {}] },
      },
    });
    expect(await fetchUserInstallationIds('tok', fetchImpl)).toEqual([1, 2]);
  });

  it('returns [] when installations is absent', async () => {
    const fetchImpl = stubFetch({ 'https://api.github.com/user/installations': { body: {} } });
    expect(await fetchUserInstallationIds('tok', fetchImpl)).toEqual([]);
  });

  it('throws on a non-ok response', async () => {
    const fetchImpl = stubFetch({
      'https://api.github.com/user/installations': { ok: false, status: 403, body: {} },
    });
    await expect(fetchUserInstallationIds('tok', fetchImpl)).rejects.toThrow(/403/);
  });
});

describe('authorizeInstallationView', () => {
  it('allows a viewable id and denies others', () => {
    expect(authorizeInstallationView([1, 2, 3], 2)).toBe(true);
    expect(authorizeInstallationView([1, 2, 3], 9)).toBe(false);
    expect(authorizeInstallationView([], 1)).toBe(false);
  });
});
