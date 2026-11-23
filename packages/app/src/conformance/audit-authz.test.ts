import { describe, it, expect } from 'vitest';
import type { AuditRecord, ScanRecord } from '../db/store.js';
import { latestScanByRepo, auditBelongsTo } from './audit-authz.js';

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
