// Pure aggregation for the internal telemetry analytics view.
//
// Takes the raw (newest-first) action_runs rows the Store returns and shapes the
// summary tiles, per-day counts, and recent-table slice the page renders. No I/O
// here, so it is fully unit-testable.
import type { ActionRunRecord } from '../db/store.js';

export interface ModeCount {
  mode: string;
  count: number;
}

export interface DayCount {
  /** Calendar day in UTC, `YYYY-MM-DD`, or `unknown` when a row has no time. */
  day: string;
  count: number;
}

export interface TelemetrySummary {
  /** Number of rows summarized (bounded by the Store fetch limit). */
  total: number;
  /** True when `total` reached the fetch limit, so earlier runs aren't counted. */
  capped: boolean;
  /** Runs that authenticated with a license key. */
  licensedRuns: number;
  /** Runs on the free public-repo tier. */
  publicRuns: number;
  /** Total fixes applied across all summarized runs (fix mode). */
  totalFixesApplied: number;
  /** Run counts per mode, highest first. */
  byMode: ModeCount[];
  /** Run counts per UTC day, most recent day first. */
  byDay: DayCount[];
  /** The most recent runs, for a detail table (bounded by `recentLimit`). */
  recent: ActionRunRecord[];
}

/** UTC calendar day (`YYYY-MM-DD`) for an ISO timestamp, or `unknown`. */
function dayOf(createdAt: string | null | undefined): string {
  if (!createdAt) return 'unknown';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return 'unknown';
  return d.toISOString().slice(0, 10);
}

/**
 * Summarize action_runs rows (already newest-first). `fetchLimit` is the cap the
 * Store applied, used only to flag whether the totals are complete. `recentLimit`
 * bounds the detail table.
 */
export function summarizeActionRuns(
  rows: ActionRunRecord[],
  fetchLimit: number,
  recentLimit = 50,
): TelemetrySummary {
  const byModeMap = new Map<string, number>();
  const byDayMap = new Map<string, number>();
  let licensedRuns = 0;
  let publicRuns = 0;
  let totalFixesApplied = 0;

  for (const r of rows) {
    byModeMap.set(r.mode, (byModeMap.get(r.mode) ?? 0) + 1);
    const day = dayOf(r.createdAt);
    byDayMap.set(day, (byDayMap.get(day) ?? 0) + 1);
    if (r.licensed) licensedRuns += 1;
    if (r.publicRepo) publicRuns += 1;
    totalFixesApplied += r.fixesApplied;
  }

  const byMode = [...byModeMap.entries()]
    .map(([mode, count]) => ({ mode, count }))
    .sort((a, b) => b.count - a.count || a.mode.localeCompare(b.mode));

  const byDay = [...byDayMap.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => b.day.localeCompare(a.day));

  return {
    total: rows.length,
    capped: rows.length >= fetchLimit,
    licensedRuns,
    publicRuns,
    totalFixesApplied,
    byMode,
    byDay,
    recent: rows.slice(0, recentLimit),
  };
}
