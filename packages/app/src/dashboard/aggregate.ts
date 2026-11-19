// Pure aggregation for the read-only dashboard.
//
// Given an installation's repos and the scans ingested from `check_run`
// webhooks, compute the per-repo and org-level summaries the dashboard renders:
// coverage %, last scan, last conclusion, violation count, and the violation
// trend between the two most recent scans. No I/O here — the Store does the
// reads, these functions shape the result — so it is exhaustively unit-testable.
import type { RepoRecord, ScanRecord } from '../db/store.js';

/** Direction of the violation count between a repo's two latest scans. */
export type Trend = 'none' | 'new' | 'up' | 'down' | 'flat';

export interface RepoSummary {
  repoId: number;
  fullName: string;
  isPrivate: boolean;
  /** ISO-8601 of the most recent scan, or null if never scanned. */
  lastScanAt: string | null;
  lastConclusion: string | null;
  /** Violations in the most recent scan, or null if never scanned. */
  lastViolationCount: number | null;
  scanCount: number;
  /** `up` = more violations than the prior scan (regressed); `down` = improved. */
  trend: Trend;
}

export interface InstallationSummary {
  totalRepos: number;
  scannedRepos: number;
  /** Percentage of repos with at least one scan, rounded to an integer. */
  coveragePct: number;
  /** Sum of the latest violation count across scanned repos. */
  totalViolations: number;
  repos: RepoSummary[];
}

/** Newest first: by completion time, then by check_run id as a tiebreak. */
function byRecencyDesc(a: ScanRecord, b: ScanRecord): number {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  return b.checkRunId - a.checkRunId;
}

function trendOf(latest: number, previous: number): Trend {
  if (latest > previous) return 'up';
  if (latest < previous) return 'down';
  return 'flat';
}

export function summarizeRepo(repo: RepoRecord, scans: ScanRecord[]): RepoSummary {
  const ordered = [...scans].sort(byRecencyDesc);
  const base: RepoSummary = {
    repoId: repo.repoId,
    fullName: repo.fullName,
    isPrivate: repo.isPrivate,
    lastScanAt: null,
    lastConclusion: null,
    lastViolationCount: null,
    scanCount: ordered.length,
    trend: 'none',
  };

  if (ordered.length === 0) return base;

  const latest = ordered[0];
  return {
    ...base,
    lastScanAt: latest.createdAt,
    lastConclusion: latest.conclusion,
    lastViolationCount: latest.violationCount,
    trend: ordered.length === 1 ? 'new' : trendOf(latest.violationCount, ordered[1].violationCount),
  };
}

export function summarizeInstallation(repos: RepoRecord[], scans: ScanRecord[]): InstallationSummary {
  const scansByRepo = new Map<number, ScanRecord[]>();
  for (const scan of scans) {
    const list = scansByRepo.get(scan.repoId) ?? [];
    list.push(scan);
    scansByRepo.set(scan.repoId, list);
  }

  const summaries = repos
    .map(repo => summarizeRepo(repo, scansByRepo.get(repo.repoId) ?? []))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const scannedRepos = summaries.filter(s => s.scanCount > 0).length;
  const totalViolations = summaries.reduce((sum, s) => sum + (s.lastViolationCount ?? 0), 0);

  return {
    totalRepos: repos.length,
    scannedRepos,
    coveragePct: repos.length === 0 ? 0 : Math.round((scannedRepos / repos.length) * 100),
    totalViolations,
    repos: summaries,
  };
}
