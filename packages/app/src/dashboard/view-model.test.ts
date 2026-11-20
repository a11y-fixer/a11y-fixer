import { describe, expect, it } from 'vitest';
import type { InstallationSummary, RepoSummary } from './aggregate.js';
import { conclusionView, installationView, repoRow, trendView } from './view-model.js';

function summary(overrides: Partial<RepoSummary> = {}): RepoSummary {
  return {
    repoId: 1,
    fullName: 'acme/web',
    isPrivate: false,
    lastScanAt: '2026-11-19T10:00:00.000Z',
    lastConclusion: 'failure',
    lastViolationCount: 3,
    scanCount: 2,
    trend: 'up',
    ...overrides,
  };
}

describe('trendView', () => {
  it('covers every trend with a tone', () => {
    expect(trendView('new').tone).toBe('neutral');
    expect(trendView('up')).toMatchObject({ label: 'Regressed', tone: 'bad' });
    expect(trendView('down')).toMatchObject({ label: 'Improved', tone: 'good' });
    expect(trendView('flat').label).toBe('No change');
    expect(trendView('none').label).toBe('Not scanned');
  });
});

describe('conclusionView', () => {
  it('maps known conclusions and passes unknown through as warn', () => {
    expect(conclusionView('success')).toEqual({ label: 'Passing', tone: 'good' });
    expect(conclusionView('failure')).toEqual({ label: 'Violations', tone: 'bad' });
    expect(conclusionView('neutral').tone).toBe('neutral');
    expect(conclusionView(null).label).toBe('Not scanned');
    expect(conclusionView('timed_out')).toEqual({ label: 'timed_out', tone: 'warn' });
  });
});

describe('repoRow', () => {
  it('shapes a scanned repo', () => {
    expect(repoRow(summary())).toMatchObject({
      fullName: 'acme/web',
      visibility: 'Public',
      violations: '3',
      conclusion: { label: 'Violations', tone: 'bad' },
      trend: { label: 'Regressed' },
      lastScan: '2026-11-19T10:00:00.000Z',
    });
  });

  it('renders dashes and Never for a never-scanned private repo', () => {
    const row = repoRow(
      summary({ isPrivate: true, lastScanAt: null, lastConclusion: null, lastViolationCount: null, trend: 'none' }),
    );
    expect(row).toMatchObject({ visibility: 'Private', violations: '—', lastScan: 'Never' });
  });
});

describe('installationView', () => {
  it('flags an empty installation', () => {
    const empty: InstallationSummary = { totalRepos: 0, scannedRepos: 0, coveragePct: 0, totalViolations: 0, repos: [] };
    expect(installationView(empty)).toMatchObject({ isEmpty: true, coverage: '0%', rows: [] });
  });

  it('formats coverage and maps rows', () => {
    const s: InstallationSummary = {
      totalRepos: 4,
      scannedRepos: 3,
      coveragePct: 75,
      totalViolations: 7,
      repos: [summary()],
    };
    const view = installationView(s);
    expect(view.coverage).toBe('75%');
    expect(view.isEmpty).toBe(false);
    expect(view.rows).toHaveLength(1);
  });
});
