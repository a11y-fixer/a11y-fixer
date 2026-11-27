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
import { deriveClaims, type DerivableScan } from '../../conformance/ledger-derive.js';
import { writeClaims } from '../../conformance/ledger.js';
import type { ScanPath } from '../../conformance/evaluated-set.js';

/** The Check Run name the Action posts; must match github-action `report.ts`. */
export const A11Y_FIXER_CHECK_NAME = 'a11y-fixer';

/**
 * Accepted scan-contract schemas. v1 carries violations only (fail-only claims);
 * v2 adds engine + version + scanPath, which unlock `pass` claims. Both are
 * accepted so the ledger keeps ingesting while the Action is upgraded v1 -> v2.
 */
const SCAN_REPORT_SCHEMAS = new Set(['a11y-fixer.scan/1', 'a11y-fixer.scan/2']);

/** Conformance signing config; when provided, the handler appends ledger claims. */
export interface ConformanceConfig {
  /** PKCS#8 PEM of the dedicated CONFORMANCE_SIGNING_KEY. */
  signingKeyPem: string;
  /** Keyring id for the signing key (verifiers look the public key up by this). */
  keyId: string;
}

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
  /** v2 only: the scanning engine, its version, and the scan path. null on v1. */
  engine: string | null;
  engineVersion: string | null;
  scanPath: ScanPath | null;
}

function parseScanPath(v: unknown): ScanPath | null {
  return v === 'html' || v === 'jsx' || v === 'markdown' ? v : null;
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
  if (!isObject(raw) || typeof raw.schema !== 'string' || !SCAN_REPORT_SCHEMAS.has(raw.schema)) {
    return null;
  }
  const counts = isObject(raw.counts) ? raw.counts : {};
  return {
    schema: raw.schema,
    counts: {
      critical: num(counts.critical),
      serious: num(counts.serious),
      moderate: num(counts.moderate),
      minor: num(counts.minor),
      total: num(counts.total),
    },
    truncated: raw.truncated === true,
    violations: parseViolations(raw.violations),
    engine: typeof raw.engine === 'string' ? raw.engine : null,
    engineVersion: typeof raw.engineVersion === 'string' ? raw.engineVersion : null,
    scanPath: parseScanPath(raw.scanPath),
  };
}

/** Flatten a parsed report into the (one-row-per-location) shape deriveClaims wants. */
function toDerivableScan(report: ScanReport, repoId: number, headSha: string, assertedAt: string): DerivableScan {
  const violations = [] as DerivableScan['violations'];
  for (const v of report.violations) {
    if (v.locations.length === 0) {
      violations.push({ ruleId: v.id, wcagId: v.wcagId, impact: v.impact, path: null, line: null });
      continue;
    }
    for (const loc of v.locations) {
      violations.push({ ruleId: v.id, wcagId: v.wcagId, impact: v.impact, path: loc.path, line: loc.line });
    }
  }
  return {
    repoId,
    headSha,
    assertedAt,
    truncated: report.truncated,
    engine: report.engine,
    engineVersion: report.engineVersion,
    scanPath: report.scanPath,
    violations,
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
  conformance?: ConformanceConfig,
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

  // Conformance ledger: derive signed claims from the scan and append them.
  // Only runs when a signing key is configured; a scan with no parsed contract
  // yields no claims. Fatal-safe: ledger failures must not drop the scan record,
  // so they are caught and logged, not rethrown.
  if (conformance && report) {
    try {
      const drafts = deriveClaims(
        toDerivableScan(report, event.repository.id, run.head_sha, record.createdAt),
      );
      if (drafts.length > 0) {
        await writeClaims({
          store,
          drafts,
          signingKeyPem: conformance.signingKeyPem,
          keyId: conformance.keyId,
        });
      }
    } catch (err) {
      console.error('[conformance] claim append failed for check_run', run.id, err);
    }
  }
}
