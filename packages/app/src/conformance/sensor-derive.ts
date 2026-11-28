// Turn a runtime-sensor observation report into conformance claim drafts — the
// `runtime`-method analog of ledger-derive.ts. The driver (headless Chrome in CI)
// is UNTRUSTED: its report carries raw FACTS only, never a verdict. This module is
// the backend trust gate — it re-validates the fact shape (rejecting malformed or
// forged observations, A9) and RE-JUDGES pass/fail server-side with the same pure
// `judgeObservation` the driver used, so a compromised CI job cannot mint a signed
// `pass`: there is no `state` field to forge, and the backend decides the state.
//
// Claims are emitted at (flow, criterion) granularity on `flow:` subjects. See
// docs/conformance/phase-2-sensor-plan.md.
import { judgeObservation, canonicalizeFacts, type RouteChangeFacts } from '@a11y-fixer/core';
import { flowSubjectKeyForName } from './claim.js';
import type { ClaimDraft } from './ledger.js';
import { levelOf } from './wcag-matrix.js';
import { runtimePassEligibleCriteria } from './evaluated-set.js';

/** The criterion this sensor observes. Kept explicit so widening is a visible edit. */
const SENSOR_CRITERION = '4.1.3';

/** One observed flow in the report: a flow name, its criterion, and raw facts. */
export interface SensorFlowObservation {
  flowName: string;
  criterion: string;
  facts: RouteChangeFacts;
}

export interface SensorReport {
  schema: string;
  /** The producing sensor engine + version, e.g. 'puppeteer' / '25.18.1'. */
  engine: string | null;
  engineVersion: string | null;
  flows: SensorFlowObservation[];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/** The sensor contract schema the Action posts. */
export const SENSOR_REPORT_SCHEMA = 'a11y-fixer.sensor/1';

/** Strictly validate one region fingerprint — a forged/garbage region drops the flow. */
function isRegionFingerprint(v: unknown): boolean {
  return (
    isObject(v) &&
    typeof v.role === 'string' &&
    (v.nameHash === null || typeof v.nameHash === 'string') &&
    typeof v.textHash === 'string' &&
    typeof v.childCount === 'number' &&
    typeof v.ariaBusy === 'boolean'
  );
}

/** Strictly validate route-change facts (A9). Returns the typed facts, or null. */
function parseFacts(v: unknown): RouteChangeFacts | null {
  if (!isObject(v)) return null;
  if (typeof v.fromLabel !== 'string' || typeof v.toLabel !== 'string') return null;
  if (typeof v.settled !== 'boolean') return null;
  if (typeof v.focusMovedIntoNewContent !== 'boolean') return null;
  if (!Array.isArray(v.liveRegionsBefore) || !v.liveRegionsBefore.every(isRegionFingerprint)) return null;
  if (!Array.isArray(v.liveRegionsAfter) || !v.liveRegionsAfter.every(isRegionFingerprint)) return null;
  return v as unknown as RouteChangeFacts;
}

/**
 * Parse + validate the sensor report embedded in the check-run output. Returns
 * null (never throws) for absent/non-JSON/wrong-schema text; flows that fail fact
 * validation are dropped individually so one forged flow can't poison the rest.
 */
export function parseSensorReport(text: string | null | undefined): SensorReport | null {
  if (!text) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObject(raw) || raw.schema !== SENSOR_REPORT_SCHEMA) return null;
  const flowsRaw = Array.isArray(raw.flows) ? raw.flows : [];
  const flows: SensorFlowObservation[] = [];
  for (const f of flowsRaw) {
    if (!isObject(f) || typeof f.flowName !== 'string' || typeof f.criterion !== 'string') continue;
    const facts = parseFacts(f.facts);
    if (!facts) continue; // malformed/forged observation: reject this flow (A9)
    flows.push({ flowName: f.flowName, criterion: f.criterion, facts });
  }
  return {
    schema: raw.schema,
    engine: typeof raw.engine === 'string' ? raw.engine : null,
    engineVersion: typeof raw.engineVersion === 'string' ? raw.engineVersion : null,
    flows,
  };
}

/**
 * Derive runtime claim drafts from a validated sensor report. `repoId` is the
 * TRUSTED repo id from the webhook (never the report), and `assertedAt` is the
 * check-run completion time so a redelivered report produces byte-identical claims.
 */
export function sensorDerive(report: SensorReport, repoId: number, assertedAt: string): ClaimDraft[] {
  const assertedBy =
    report.engine && report.engineVersion
      ? `runtime-sensor@${report.engine}/${report.engineVersion}`
      : 'runtime-sensor';
  const passEligible = runtimePassEligibleCriteria();
  const drafts: ClaimDraft[] = [];

  for (const flow of report.flows) {
    const criterion = flow.criterion;
    // Only the criterion this sensor is pinned to; a report claiming another is ignored.
    if (criterion !== SENSOR_CRITERION) continue;
    const level = levelOf(criterion);
    if (!level) continue; // unknown/non-2.2 criterion: can't type a claim

    // Re-judge server-side from the raw facts — the authoritative decision (A9).
    let state = judgeObservation(flow.facts);
    // Never a silent pass outside the pinned runtime eligibility set.
    if (state === 'pass' && !passEligible.has(criterion)) state = 'not-evaluated';

    const subjectKey = flowSubjectKeyForName(repoId, flow.flowName);
    const canonical = canonicalizeFacts(flow.facts);

    drafts.push({
      body: {
        subjectKind: 'flow',
        subjectKey,
        criterion,
        wcagVersion: '2.2',
        level,
        state,
        method: 'runtime',
        confidence: 1, // directly observed; the judge never returns a partial belief
        assertedBy,
        assertedAt,
      },
      // not-evaluated carries no evidence (ledger invariant); pass/fail carry the
      // normalized dom-trace so two runs of an unchanged transition hash identically.
      evidence:
        state === 'not-evaluated'
          ? null
          : { type: 'dom-trace', producerVersion: assertedBy, blob: canonical },
    });
  }

  return drafts;
}
