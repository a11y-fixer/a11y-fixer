import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { MemoryStore } from '../db/memory-store.js';
import type { RepoRecord } from '../db/store.js';
import { dispatchInstallationScan } from './scan-orchestrator.js';

const privatePem = generateKeyPairSync('rsa', { modulusLength: 2048 })
  .privateKey.export({ type: 'pkcs1', format: 'pem' })
  .toString();

const TOKEN = 'ghs_minted_secret';
const INSTALL = 100;

function repo(repoId: number, name: string, selected: boolean): RepoRecord {
  return {
    repoId,
    installationId: INSTALL,
    fullName: `acme/${name}`,
    isPrivate: false,
    defaultBranch: 'main',
    selected,
  };
}

function ok(body: unknown): Response {
  return { ok: true, status: 200, statusText: 'OK', json: async () => body } as Response;
}

// Routes by URL: token mint, per-repo workflow list, per-repo dispatch.
// `web` → one a11y workflow (dispatched); `api` → none; `dup` → two (ambiguous);
// `boom` → list 500 (error).
function makeFetch() {
  return vi.fn(async (url: string, _init?: RequestInit): Promise<Response> => {
    if (url.endsWith('/access_tokens')) {
      return {
        ok: true,
        status: 201,
        statusText: 'Created',
        json: async () => ({ token: TOKEN, expires_at: '2026-01-01T01:00:00Z' }),
      } as Response;
    }
    if (url.includes('/repos/acme/web/actions/workflows')) {
      return ok({ workflows: [{ id: 11, name: 'a11y-fixer', path: 'a.yml', state: 'active' }] });
    }
    if (url.includes('/repos/acme/api/actions/workflows')) {
      return ok({ workflows: [{ id: 22, name: 'CI', path: 'ci.yml', state: 'active' }] });
    }
    if (url.includes('/repos/acme/dup/actions/workflows')) {
      return ok({
        workflows: [
          { id: 31, name: 'a11y-fixer', path: 'a.yml', state: 'active' },
          { id: 32, name: 'a11y check', path: 'b.yml', state: 'active' },
        ],
      });
    }
    if (url.includes('/repos/acme/boom/actions/workflows')) {
      return { ok: false, status: 500, statusText: 'Server Error', json: async () => ({}) } as Response;
    }
    if (url.endsWith('/dispatches')) {
      return { ok: true, status: 204, statusText: 'No Content', json: async () => ({}) } as Response;
    }
    throw new Error(`unexpected url: ${url}`);
  });
}

async function seed(store: MemoryStore, repos: RepoRecord[]) {
  await store.upsertRepos(INSTALL, repos);
}

describe('dispatchInstallationScan', () => {
  it('dispatches selected repos, aggregates per-repo outcomes, mints one token', async () => {
    const store = new MemoryStore();
    await seed(store, [
      repo(1, 'web', true),
      repo(2, 'api', true),
      repo(3, 'old', false), // not selected → skipped
      repo(4, 'dup', true),
      repo(5, 'boom', true),
    ]);
    const fetchImpl = makeFetch();

    const summary = await dispatchInstallationScan({
      appId: 42,
      privateKey: privatePem,
      installationId: INSTALL,
      store,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(summary.requested).toBe(4); // the selected repos only
    expect(summary.dispatched).toBe(1);
    expect(summary.failed).toBe(3);

    const byName = Object.fromEntries(summary.results.map(r => [r.fullName, r.status]));
    expect(byName['acme/web']).toBe('dispatched');
    expect(byName['acme/api']).toBe('no_workflow');
    expect(byName['acme/dup']).toBe('ambiguous_workflow');
    expect(byName['acme/boom']).toBe('error');
    expect(byName['acme/old']).toBeUndefined();

    // Exactly one token minted for the whole batch.
    const mints = fetchImpl.mock.calls.filter(c => (c[0] as string).endsWith('/access_tokens'));
    expect(mints).toHaveLength(1);
  });

  it('restricts to repoIds when provided', async () => {
    const store = new MemoryStore();
    await seed(store, [repo(1, 'web', true), repo(2, 'api', true)]);
    const fetchImpl = makeFetch();

    const summary = await dispatchInstallationScan({
      appId: 1,
      privateKey: privatePem,
      installationId: INSTALL,
      store,
      repoIds: [1],
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(summary.requested).toBe(1);
    expect(summary.results[0].fullName).toBe('acme/web');
    expect(summary.results[0].status).toBe('dispatched');
  });

  it('never leaks the installation token in the summary', async () => {
    const store = new MemoryStore();
    await seed(store, [repo(1, 'web', true), repo(5, 'boom', true)]);
    const fetchImpl = makeFetch();

    const summary = await dispatchInstallationScan({
      appId: 1,
      privateKey: privatePem,
      installationId: INSTALL,
      store,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(JSON.stringify(summary)).not.toContain(TOKEN);
    expect(JSON.stringify(summary)).not.toContain('ghs_');
  });

  it('dispatches on the repo default branch', async () => {
    const store = new MemoryStore();
    await seed(store, [{ ...repo(1, 'web', true), defaultBranch: 'trunk' }]);
    const fetchImpl = makeFetch();

    await dispatchInstallationScan({
      appId: 1,
      privateKey: privatePem,
      installationId: INSTALL,
      store,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const dispatchCall = fetchImpl.mock.calls.find(c => (c[0] as string).endsWith('/dispatches'));
    const body = JSON.parse((dispatchCall![1] as RequestInit).body as string);
    expect(body.ref).toBe('trunk');
  });
});
