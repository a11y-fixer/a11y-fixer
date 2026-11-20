// `check_run` webhook handler — the dashboard's primary data source.
//
// The composite Action posts a Check Run named `a11y-fixer` from customer CI
// (github-action `report.ts` → postCheckRun). Subscribing to `check_run` lets
// the control plane record every scan with no phone home: we persist what GitHub
// sends us about that Check Run, plus the structured scan contract the Action
// embeds in `output.text`.
//
// We act on `completed` runs named `a11y-fixer` only; every other action or
// Check Run name is ignored. When the embedded contract is present it gives the
// exact violation count and per-violation detail (persisted to `violations`);
// otherwise we fall back to the Check Run's annotation count and record no
// detail rows (e.g. an older Action version).
import type { ScanRecord, Store, ViolationRecord } from '../../db/store.js';
import type { CheckRunEvent } from '../events.js';

/** The Check Run name the Action posts; must match github-action `report.ts`. */
export const A11Y_FIXER_CHECK_NAME = 'a11y-fixer';

/** Must match `SCAN_REPORT_SCHEMA` in the Action's report.ts. */
const SCAN_REPORT_SCHEMA = 'a11y-fixer.scan/1';

interface ScanReportLocation {
  path: string;
  line: number;
}
interface ScanReportViolation {
  id: string;
  wcagId: string;
  impact: string;
  description: string;
  helpUrl: string;
  locations: ScanReportLocation[];
}
interface ScanReport {
  schema: string;
  counts: { critical: number; serious: number; moderate: number; minor: number; total: number };
  truncated: boolean;
  violations: ScanReportViolation[];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function parseLocations(raw: unknown): ScanReportLocation[] {
  if (!Array.isArray(raw)) return [];
  const out: ScanReportLocation[] = [];
  for (const loc of raw) {
    if (isObject(loc) && typeof loc.path === 'string' && typeof loc.line === 'number') {
      out.push({ path: loc.path, line: loc.line });
    }
  }
  return out;
}

function parseViolations(raw: unknown): ScanReportViolation[] {
  if (!Array.isArray(raw)) return [];
  const out: ScanReportViolation[] = [];
  for (const v of raw) {
    if (
      isObject(v) &&
      typeof v.id === 'string' &&
      typeof v.wcagId === 'string' &&
      typeof v.impact === 'string' &&
      typeof v.description === 'string' &&
      typeof v.helpUrl === 'string'
    ) {
      out.push({
        id: v.id,
        wcagId: v.wcagId,
        impact: v.impact,
        description: v.description,
        helpUrl: v.helpUrl,
        locations: parseLocations(v.locations),
      });
    }
  }
  return out;
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

/**
 * Parse + validate the embedded scan contract. Returns null (never throws) for
 * absent, non-JSON, or wrong/unknown-schema text so the caller falls back to the
 * annotation count.
 */
export function parseScanReport(text: string | null | undefined): ScanReport | null {
  if (!text) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObject(raw) || raw.schema !== SCAN_REPORT_SCHEMA) return null;
  const counts = isObject(raw.counts) ? raw.counts : {};
  return {
    schema: SCAN_REPORT_SCHEMA,
    counts: {
      critical: num(counts.critical),
      serious: num(counts.serious),
      moderate: num(counts.moderate),
      minor: num(counts.minor),
      total: num(counts.total),
    },
    truncated: raw.truncated === true,
    violations: parseViolations(raw.violations),
  };
}

/** Flatten a parsed report to violation rows (one per source location; one with
 * null path/line when a violation has none, e.g. URL-only scans). */
function toViolationRecords(report: ScanReport): ViolationRecord[] {
  const rows: ViolationRecord[] = [];
  for (const v of report.violations) {
    if (v.locations.length === 0) {
      rows.push({ ruleId: v.id, wcagId: v.wcagId, impact: v.impact, description: v.description, helpUrl: v.helpUrl, path: null, line: null });
      continue;
    }
    for (const loc of v.locations) {
      rows.push({ ruleId: v.id, wcagId: v.wcagId, impact: v.impact, description: v.description, helpUrl: v.helpUrl, path: loc.path, line: loc.line });
    }
  }
  return rows;
}

export async function handleCheckRun(
  event: CheckRunEvent,
  store: Store,
  now: () => Date = () => new Date(),
): Promise<void> {
  if (event.action !== 'completed') return;

  const run = event.check_run;
  if (run.name !== A11Y_FIXER_CHECK_NAME) return;

  const installationId = event.installation?.id;
  if (installationId === undefined) return;

  // The embedded contract gives the exact total (and per-violation detail); when
  // it's absent, fall back to the Check Run's annotation count.
  const report = parseScanReport(run.output?.text);
  const violationCount = report ? report.counts.total : run.output?.annotations_count ?? 0;

  const record: ScanRecord = {
    checkRunId: run.id,
    repoId: event.repository.id,
    installationId,
    headSha: run.head_sha,
    prNumber: run.pull_requests?.[0]?.number ?? null,
    conclusion: run.conclusion,
    violationCount,
    createdAt: run.completed_at ?? now().toISOString(),
  };

  await store.upsertScan(record);
  if (report) await store.replaceViolations(run.id, toViolationRecords(report));
}
