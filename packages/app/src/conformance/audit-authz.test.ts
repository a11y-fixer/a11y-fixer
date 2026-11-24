import { describe, it, expect } from 'vitest';
import type { AuditRecord, AuditRevisionRecord, ScanRecord } from '../db/store.js';
import { latestScanByRepo, auditBelongsTo, scopeRevisionsToInstallation } from './audit-authz.js';

function scan(repoId: number, checkRunId: number, createdAt: string): ScanRecord {
  return {
    checkRunId,
    repoId,
    installationId: 1,
    headSha: `sha-${checkRunId}`,
    prNumber: null,
    conclusion: 'success',
    violationCount: 0,
    createdAt,
  };
}

describe('latestScanByRepo', () => {
  it('keeps the most recent scan per repo', () => {
    const latest = latestScanByRepo([
      scan(10, 1, '2026-01-01T00:00:00Z'),
      scan(10, 2, '2026-02-01T00:00:00Z'),
      scan(20, 3, '2026-01-15T00:00:00Z'),
    ]);
    expect(latest.get(10)?.checkRunId).toBe(2);
    expect(latest.get(20)?.checkRunId).toBe(3);
    expect(latest.size).toBe(2);
  });

  it('is empty for no scans', () => {
    expect(latestScanByRepo([]).size).toBe(0);
  });
});

describe('auditBelongsTo', () => {
  const audit: AuditRecord = {
    id: 'a1',
    repoId: 10,
    installationId: 1,
    headSha: 'abc',
    basisCheckRunId: 1,
    status: 'draft',
    createdAt: 't',
    publishedAt: null,
  };

  it('is true only when the audit exists and matches the installation', () => {
    expect(auditBelongsTo(audit, 1)).toBe(true);
    expect(auditBelongsTo(audit, 2)).toBe(false);
    expect(auditBelongsTo(null, 1)).toBe(false);
  });
});

describe('scopeRevisionsToInstallation', () => {
  const rev = (id: string, installationId: number, version: number): AuditRevisionRecord => ({
    id, auditId: `a-${id}`, repoId: 10, installationId, version,
    publicSlug: `slug-${id}`, snapshot: {}, headSha: `sha-${id}`, publishedAt: '2026-03-01T00:00:00Z',
  });

  it('drops revisions from other installations (post-transfer cross-tenant leak)', () => {
    // repo_id 10 was published under installation 1 (v1,v2) then transferred to 2 (v3).
    const scoped = scopeRevisionsToInstallation(
      [rev('r1', 1, 1), rev('r2', 1, 2), rev('r3', 2, 3)],
      2,
    );
    expect(scoped.map(s => s.revision.id)).toEqual(['r3']);
  });

  it('renumbers densely per installation, hiding the global version count', () => {
    // The new owner (installation 2) must see Revision 1, not "Revision 3",
    // which would leak that the prior owner published twice.
    const scoped = scopeRevisionsToInstallation(
      [rev('r1', 1, 1), rev('r2', 1, 2), rev('r3', 2, 3)],
      2,
    );
    expect(scoped).toHaveLength(1);
    expect(scoped[0].displayVersion).toBe(1);
  });

  it('orders newest first with dense display numbers within the installation', () => {
    const scoped = scopeRevisionsToInstallation(
      [rev('r1', 1, 1), rev('r3', 1, 5), rev('r2', 1, 3)],
      1,
    );
    expect(scoped.map(s => [s.revision.version, s.displayVersion])).toEqual([
      [5, 3],
      [3, 2],
      [1, 1],
    ]);
  });
});
