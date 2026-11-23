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

describe('MemoryStore conformance audits', () => {
  const audit = {
    id: 'a1',
    repoId: 10,
    installationId: 100,
    headSha: 'deadbeef',
    basisCheckRunId: 555,
    status: 'draft' as const,
    createdAt: '2026-01-01T00:00:00Z',
    publishedAt: null,
  };

  it('reads violation detail rows back by scan', async () => {
    const store = new MemoryStore();
    expect(await store.listViolationsByScan(555)).toEqual([]);
    const v = {
      ruleId: 'image-alt',
      wcagId: '1.1.1',
      impact: 'critical',
      description: 'img needs alt',
      helpUrl: 'https://help/image-alt',
      path: 'src/App.tsx',
      line: 3,
    };
    await store.replaceViolations(555, [v]);
    expect(await store.listViolationsByScan(555)).toEqual([v]);
  });

  it('upserts an audit and moves it through its lifecycle', async () => {
    const store = new MemoryStore();
    expect(await store.getAudit('a1')).toBeNull();
    await store.upsertAudit(audit);
    expect(await store.getAudit('a1')).toEqual(audit);

    await store.setAuditStatus('a1', 'published', '2026-02-02T00:00:00Z');
    const published = await store.getAudit('a1');
    expect(published?.status).toBe('published');
    expect(published?.publishedAt).toBe('2026-02-02T00:00:00Z');

    // Scoped by installation.
    expect(await store.listAuditsByInstallation(100)).toHaveLength(1);
    expect(await store.listAuditsByInstallation(999)).toEqual([]);
  });

  it('upserts verdicts keyed by (audit, criterion, source)', async () => {
    const store = new MemoryStore();
    await store.upsertAudit(audit);
    const machine = {
      id: 'v1',
      auditId: 'a1',
      wcagId: '1.4.3',
      source: 'machine' as const,
      verdict: 'partially_supports' as const,
      remarks: 'found 2 issues',
      evidence: { automated: true, violationCount: 2 },
      authorId: null,
      updatedAt: '2026-01-01T00:00:00Z',
    };
    await store.upsertVerdict(machine);
    // Same (audit, criterion, source) replaces, not duplicates.
    await store.upsertVerdict({ ...machine, remarks: 'rescanned: 1 issue' });
    // A human verdict for the same criterion coexists (different source).
    await store.upsertVerdict({
      ...machine,
      id: 'v2',
      source: 'human',
      verdict: 'supports',
      remarks: 'confirmed by tester',
      authorId: 'u9',
    });

    const verdicts = await store.listVerdicts('a1');
    expect(verdicts).toHaveLength(2);
    expect(verdicts.find(v => v.source === 'machine')?.remarks).toBe('rescanned: 1 issue');
    expect(verdicts.find(v => v.source === 'human')?.verdict).toBe('supports');
    expect(await store.listVerdicts('missing')).toEqual([]);
  });
});
