import { describe, expect, it } from 'vitest';
import { summarizeInstallation, summarizeRepo } from './aggregate.js';
import { MemoryStore } from '../db/memory-store.js';
import type { RepoRecord, ScanRecord } from '../db/store.js';

function repo(id: number, fullName: string, isPrivate = false): RepoRecord {
  return { repoId: id, installationId: 100, fullName, isPrivate, defaultBranch: 'main', selected: true };
}

function scan(repoId: number, checkRunId: number, createdAt: string, violationCount: number, conclusion = 'success'): ScanRecord {
  return { checkRunId, repoId, installationId: 100, headSha: `sha${checkRunId}`, prNumber: null, conclusion, violationCount, createdAt };
}

describe('summarizeRepo', () => {
  it('reports "none" with null fields when the repo has never been scanned', () => {
    const s = summarizeRepo(repo(1, 'acme/web'), []);
    expect(s).toMatchObject({ lastScanAt: null, lastConclusion: null, lastViolationCount: null, scanCount: 0, trend: 'none' });
  });

  it('reports "new" on the first and only scan', () => {
    const s = summarizeRepo(repo(1, 'acme/web'), [scan(1, 10, '2026-01-01T00:00:00Z', 5)]);
    expect(s).toMatchObject({ lastViolationCount: 5, scanCount: 1, trend: 'new' });
  });

  it('uses the most recent scan and flags a regression as "up"', () => {
    const s = summarizeRepo(repo(1, 'acme/web'), [
      scan(1, 10, '2026-01-01T00:00:00Z', 2),
      scan(1, 11, '2026-01-02T00:00:00Z', 5, 'failure'),
    ]);
    expect(s).toMatchObject({ lastScanAt: '2026-01-02T00:00:00Z', lastConclusion: 'failure', lastViolationCount: 5, trend: 'up' });
  });

  it('flags an improvement as "down" and equal counts as "flat"', () => {
    const down = summarizeRepo(repo(1, 'a'), [scan(1, 10, '2026-01-01T00:00:00Z', 9), scan(1, 11, '2026-01-02T00:00:00Z', 3)]);
    const flat = summarizeRepo(repo(1, 'a'), [scan(1, 10, '2026-01-01T00:00:00Z', 4), scan(1, 11, '2026-01-02T00:00:00Z', 4)]);
    expect(down.trend).toBe('down');
    expect(flat.trend).toBe('flat');
  });

  it('breaks a created_at tie by higher check_run id', () => {
    const s = summarizeRepo(repo(1, 'a'), [
      scan(1, 10, '2026-01-01T00:00:00Z', 8),
      scan(1, 12, '2026-01-01T00:00:00Z', 1),
    ]);
    expect(s.lastViolationCount).toBe(1);
    expect(s.trend).toBe('down');
  });
});

describe('summarizeInstallation', () => {
  it('computes coverage, totals, and sorts repos by name', () => {
    const repos = [repo(1, 'acme/web'), repo(2, 'acme/api'), repo(3, 'acme/docs')];
    const scans = [
      scan(1, 10, '2026-01-01T00:00:00Z', 2),
      scan(1, 11, '2026-01-02T00:00:00Z', 4),
      scan(2, 20, '2026-01-02T00:00:00Z', 1),
      // repo 3 never scanned
    ];
    const summary = summarizeInstallation(repos, scans);
    expect(summary.totalRepos).toBe(3);
    expect(summary.scannedRepos).toBe(2);
    expect(summary.coveragePct).toBe(67);
    expect(summary.totalViolations).toBe(5); // latest of repo1 (4) + repo2 (1)
    expect(summary.repos.map(r => r.fullName)).toEqual(['acme/api', 'acme/docs', 'acme/web']);
  });

  it('returns 0% coverage for an installation with no repos', () => {
    const summary = summarizeInstallation([], []);
    expect(summary).toMatchObject({ totalRepos: 0, scannedRepos: 0, coveragePct: 0, totalViolations: 0 });
    expect(summary.repos).toEqual([]);
  });

  it('summarizes straight from MemoryStore reads, scoped to the installation', async () => {
    const store = new MemoryStore();
    await store.upsertRepos(100, [repo(1, 'acme/web'), repo(2, 'acme/api')]);
    await store.upsertRepos(200, [repo(3, 'other/app')]); // different installation, must be excluded
    store.repos.get(3)!.installationId = 200;
    await store.upsertScan(scan(1, 10, '2026-01-01T00:00:00Z', 3));

    const repos = await store.listRepos(100);
    const scans = await store.listScansByInstallation(100);
    const summary = summarizeInstallation(repos, scans);

    expect(repos).toHaveLength(2);
    expect(scans).toHaveLength(1);
    expect(summary.scannedRepos).toBe(1);
    expect(summary.totalViolations).toBe(3);
  });
});
