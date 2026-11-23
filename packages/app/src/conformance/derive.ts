// Machine-derived conformance draft.
//
// Given a scan's violation rows and the WCAG catalog (from @a11y-fixer/core),
// produce one machine verdict per success criterion. This is the *draft* a human
// audit opens with; it never produces a final, publishable claim on its own.
//
// Honesty posture (the whole point of the feature):
//   - A criterion with NO automated detector → `not_evaluated`. We don't guess.
//   - A criterion with automated coverage and NO violations → `supports`, but
//     tagged automated-only; reconciliation (Phase 2) forbids publishing it as
//     Supports without a human verdict.
//   - A criterion with automated coverage and violations → `partially_supports`.
// The machine NEVER emits `does_not_support` or `not_applicable`: an automated
// scan can prove a problem exists, not that a feature wholly fails or is out of
// scope. Those verdicts belong to human reviewers.
import type { SuccessCriterion } from '@a11y-fixer/core';
import type { ViolationRecord, VerdictValue } from '../db/store.js';

/** Max per-criterion example violations kept in evidence (keeps rows small). */
const MAX_SAMPLES = 5;

/** JSON evidence attached to a machine verdict. Stored in `criterion_verdicts.evidence`. */
export interface MachineEvidence {
  /** Marks the evidence as automated (vs. human-collected). */
  automated: true;
  /** Total violations detected for this criterion. */
  violationCount: number;
  /** Count of violations by axe impact (e.g. { serious: 2, moderate: 1 }). */
  impactCounts: Record<string, number>;
  /** Distinct rule ids that fired, sorted. */
  ruleIds: string[];
  /** Up to MAX_SAMPLES example violations for display. */
  samples: Array<{
    ruleId: string;
    impact: string;
    description: string;
    path: string | null;
    line: number | null;
  }>;
}

/** One criterion's machine verdict in a derived draft. */
export interface MachineVerdict {
  wcagId: string;
  verdict: VerdictValue;
  remarks: string;
  /** Present only when violations were found; null for clean/not-evaluated. */
  evidence: MachineEvidence | null;
}

const NO_COVERAGE_REMARK =
  'No automated test is available for this criterion. It requires manual evaluation by a human reviewer.';

const CLEAN_REMARK =
  'No violations were detected by automated testing. Automated tools cover only part of this ' +
  'criterion — manual confirmation is required before claiming conformance.';

function summarize(hits: readonly ViolationRecord[]): MachineEvidence {
  const impactCounts: Record<string, number> = {};
  const ruleIds: string[] = [];
  for (const h of hits) {
    impactCounts[h.impact] = (impactCounts[h.impact] ?? 0) + 1;
    if (!ruleIds.includes(h.ruleId)) ruleIds.push(h.ruleId);
  }
  return {
    automated: true,
    violationCount: hits.length,
    impactCounts,
    ruleIds: ruleIds.sort(),
    samples: hits.slice(0, MAX_SAMPLES).map(h => ({
      ruleId: h.ruleId,
      impact: h.impact,
      description: h.description,
      path: h.path,
      line: h.line,
    })),
  };
}

function partialRemark(ev: MachineEvidence): string {
  const breakdown = Object.entries(ev.impactCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([impact, n]) => `${n} ${impact}`)
    .join(', ');
  const impactStr = breakdown ? ` (${breakdown})` : '';
  const rules = ev.ruleIds.length ? ` Rules: ${ev.ruleIds.join(', ')}.` : '';
  return (
    `Automated testing found ${ev.violationCount} issue(s)${impactStr}.${rules} ` +
    'Marked Partially Supports pending manual review.'
  );
}

/**
 * Derive machine verdicts for every catalog criterion from a scan's violations.
 *
 * Pure: the catalog is injected (not imported here) so callers control which
 * criteria set they target and tests can use fixtures. The result has exactly
 * one entry per input criterion, in catalog order.
 *
 * Violations whose `wcagId` is not a catalog criterion id (e.g. an unmapped raw
 * axe rule id) are ignored — they cannot be placed in a VPAT row.
 */
export function deriveMachineVerdicts(
  criteria: readonly SuccessCriterion[],
  violations: readonly ViolationRecord[],
): MachineVerdict[] {
  const byCriterion = new Map<string, ViolationRecord[]>();
  for (const v of violations) {
    const arr = byCriterion.get(v.wcagId);
    if (arr) arr.push(v);
    else byCriterion.set(v.wcagId, [v]);
  }

  return criteria.map(sc => {
    if (!sc.hasAutomatedCoverage) {
      return { wcagId: sc.id, verdict: 'not_evaluated', remarks: NO_COVERAGE_REMARK, evidence: null };
    }
    const hits = byCriterion.get(sc.id) ?? [];
    if (hits.length === 0) {
      return { wcagId: sc.id, verdict: 'supports', remarks: CLEAN_REMARK, evidence: null };
    }
    const evidence = summarize(hits);
    return { wcagId: sc.id, verdict: 'partially_supports', remarks: partialRemark(evidence), evidence };
  });
}

/** Counts of each verdict value in a derived draft, for UI summaries. */
export function summarizeDraft(verdicts: readonly MachineVerdict[]): Record<VerdictValue, number> {
  const counts: Record<VerdictValue, number> = {
    supports: 0,
    partially_supports: 0,
    does_not_support: 0,
    not_applicable: 0,
    not_evaluated: 0,
  };
  for (const v of verdicts) counts[v.verdict]++;
  return counts;
}
