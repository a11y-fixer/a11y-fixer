// Pure presentation mappers for the dashboard pages.
//
// The pages (`app/dashboard/**`) are thin Server Components that read through the
// Store, call `summarizeInstallation`/`summarizeRepo`, and render the rows these
// functions shape. Keeping the label/formatting logic here (no JSX, no I/O) makes
// it unit-testable and keeps the page files trivial.
import type { InstallationSummary, RepoSummary, Trend } from './aggregate.js';

export type Tone = 'neutral' | 'good' | 'bad' | 'warn';

export interface TrendView {
  label: string;
  /** A text glyph the page can render without an icon set. */
  symbol: string;
  tone: Tone;
}

export function trendView(trend: Trend): TrendView {
  switch (trend) {
    case 'new':
      return { label: 'New', symbol: '•', tone: 'neutral' };
    case 'up':
      return { label: 'Regressed', symbol: '▲', tone: 'bad' };
    case 'down':
      return { label: 'Improved', symbol: '▼', tone: 'good' };
    case 'flat':
      return { label: 'No change', symbol: '–', tone: 'neutral' };
    case 'none':
      return { label: 'Not scanned', symbol: '–', tone: 'neutral' };
  }
}

/** Human label + tone for a Check Run conclusion. */
export function conclusionView(conclusion: string | null): { label: string; tone: Tone } {
  switch (conclusion) {
    case 'success':
      return { label: 'Passing', tone: 'good' };
    case 'failure':
      return { label: 'Violations', tone: 'bad' };
    case 'neutral':
      return { label: 'Neutral', tone: 'neutral' };
    case null:
      return { label: 'Not scanned', tone: 'neutral' };
    default:
      return { label: conclusion, tone: 'warn' };
  }
}

export function formatCoverage(pct: number): string {
  return `${pct}%`;
}

export interface RepoRowView {
  repoId: number;
  fullName: string;
  visibility: 'Private' | 'Public';
  violations: string;
  conclusion: { label: string; tone: Tone };
  trend: TrendView;
  lastScan: string;
}

export function repoRow(summary: RepoSummary): RepoRowView {
  return {
    repoId: summary.repoId,
    fullName: summary.fullName,
    visibility: summary.isPrivate ? 'Private' : 'Public',
    violations: summary.lastViolationCount === null ? '—' : String(summary.lastViolationCount),
    conclusion: conclusionView(summary.lastConclusion),
    trend: trendView(summary.trend),
    lastScan: summary.lastScanAt ?? 'Never',
  };
}

export interface InstallationView {
  coverage: string;
  scannedRepos: number;
  totalRepos: number;
  totalViolations: number;
  isEmpty: boolean;
  rows: RepoRowView[];
}

export function installationView(summary: InstallationSummary): InstallationView {
  return {
    coverage: formatCoverage(summary.coveragePct),
    scannedRepos: summary.scannedRepos,
    totalRepos: summary.totalRepos,
    totalViolations: summary.totalViolations,
    isEmpty: summary.totalRepos === 0,
    rows: summary.repos.map(repoRow),
  };
}
