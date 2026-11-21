import { describe, expect, it } from 'vitest';
import { MemoryStore } from './memory-store.js';

describe('MemoryStore user access model', () => {
  it('upserts a user and links installations idempotently', async () => {
    const store = new MemoryStore();
    await store.upsertUser({ userId: 'u1', githubLogin: 'octocat', githubUserId: 5 });
    await store.upsertUser({ userId: 'u1', githubLogin: 'octocat-renamed', githubUserId: 5 });
    expect(store.users.get('u1')?.githubLogin).toBe('octocat-renamed');

    await store.linkUserInstallation('u1', 100);
    await store.linkUserInstallation('u1', 100);
    await store.linkUserInstallation('u1', 200);
    expect((await store.listInstallationsForUser('u1')).sort()).toEqual([100, 200]);
  });

  it('returns an empty list for an unknown user', async () => {
    const store = new MemoryStore();
    expect(await store.listInstallationsForUser('nobody')).toEqual([]);
  });

  it('keeps users’ installation sets independent', async () => {
    const store = new MemoryStore();
    await store.linkUserInstallation('u1', 1);
    await store.linkUserInstallation('u2', 2);
    expect(await store.listInstallationsForUser('u1')).toEqual([1]);
    expect(await store.listInstallationsForUser('u2')).toEqual([2]);
  });
});

describe('MemoryStore installations and licenses', () => {
  it('returns an installation record or null', async () => {
    const store = new MemoryStore();
    expect(await store.getInstallation(1)).toBeNull();
    await store.upsertInstallation({ installationId: 1, account: 'acme', accountId: 9, suspendedAt: null });
    expect(await store.getInstallation(1)).toMatchObject({ installationId: 1, account: 'acme', accountId: 9 });
  });

  it('stores and reads back a license by installation id', async () => {
    const store = new MemoryStore();
    expect(await store.getLicense(1)).toBeNull();
    const record = { installationId: 1, sub: 'acme', token: 'payload.sig', issuedAt: 'i', expiresAt: 'e' };
    await store.upsertLicense(record);
    expect(await store.getLicense(1)).toEqual(record);

    await store.upsertLicense({ ...record, token: 'payload2.sig2' });
    expect((await store.getLicense(1))?.token).toBe('payload2.sig2');
  });
});
