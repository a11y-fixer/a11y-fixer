// Handle the `check_run` webhook event — ingest an a11y-fixer scan.
//
// The Action embeds a structured scan contract in `check_run.output.text` (see
// `packages/github-action/src/report.ts` buildScanReport). We parse it straight
// from the delivery — no follow-up annotations API call — and persist one scan
// row plus its per-violation rows.
//
// Robustness matters here: the idempotency ledger records a delivery BEFORE
// routing, so a throw would lose the event on GitHub's retry. Anything we don't
// recognize (another app's check run, a missing/garbage contract, a non-completed
// action) is a quiet no-op ack, never an error.
import type { ScanRecord, Store, ViolationRecord } from '../../db/store.js';
import type { CheckRunEvent } from '../events.js';

/** Must match `SCAN_REPORT_SCHEMA` in the Action's report.ts. */
const SCAN_REPORT_SCHEMA = 'a11y-fixer.scan/1';
/** Only our own Check Runs carry the contract; ignore every other app's. */
const CHECK_RUN_NAME = 'a11y-fixer';

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
  sha: string;
  prNumber: number | null;
  mode: string;
  conclusion: string;
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
 * absent, non-JSON, or wrong/unknown-schema text so the caller can ack-and-skip.
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
    sha: typeof raw.sha === 'string' ? raw.sha : '',
    prNumber: typeof raw.prNumber === 'number' ? raw.prNumber : null,
    mode: typeof raw.mode === 'string' ? raw.mode : 'check',
    conclusion: typeof raw.conclusion === 'string' ? raw.conclusion : '',
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

export async function handleCheckRun(event: CheckRunEvent, store: Store): Promise<void> {
  const { action, check_run: run, repository, installation } = event;
  // Only a completed a11y-fixer run carries a scan to ingest.
  if (action !== 'completed' || run.name !== CHECK_RUN_NAME) return;

  const report = parseScanReport(run.output?.text);
  if (!report) return; // no contract (e.g. an older Action version) — ack and skip.

  const scan: ScanRecord = {
    scanId: run.id,
    installationId: installation?.id ?? null,
    repoId: repository.id,
    fullName: repository.full_name,
    sha: report.sha || run.head_sha,
    prNumber: report.prNumber ?? run.pull_requests?.[0]?.number ?? null,
    mode: report.mode,
    conclusion: report.conclusion || run.conclusion || '',
    critical: report.counts.critical,
    serious: report.counts.serious,
    moderate: report.counts.moderate,
    minor: report.counts.minor,
    total: report.counts.total,
    truncated: report.truncated,
  };

  await store.recordScan(scan, toViolationRecords(report));
}
