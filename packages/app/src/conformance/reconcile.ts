// Reconciliation: merge machine + human verdicts into the final per-criterion
// result a VPAT/ACR would publish.
//
// Rules (the honesty posture of the feature):
//   - A human verdict always wins over the machine draft for the same criterion.
//   - Where no human has reviewed, the machine verdict stands but is flagged
//     `needsHumanReview`.
//   - A document may NOT be published while any criterion is claimed `supports`
//     on machine evidence alone (see `publishBlockers`). Automated tools cannot
//     prove conformance, only the absence of detectable failures.
import type { SuccessCriterion } from '@a11y-fixer/core';
import type { CriterionVerdictRecord, VerdictSource, VerdictValue } from '../db/store.js';

/** One criterion's reconciled result, carrying catalog metadata for rendering. */
export interface ReconciledCriterion {
  wcagId: string;
  title: string;
  level: SuccessCriterion['level'];
  /** The winning verdict. `not_evaluated` when nothing has been recorded. */
  verdict: VerdictValue;
  /** Which source won: 'human' if a reviewer recorded one, else 'machine'. */
  source: VerdictSource;
  remarks: string;
  evidence: unknown;
  /** True when the winning verdict is the unreviewed machine draft. */
  needsHumanReview: boolean;
}

function pick(
  verdicts: readonly CriterionVerdictRecord[],
  source: VerdictSource,
): CriterionVerdictRecord | undefined {
  return verdicts.find(v => v.source === source);
}

/**
 * Produce one reconciled row per catalog criterion, in catalog order. Human
 * verdicts win; otherwise the machine draft stands, flagged for review. A
 * criterion with no verdict at all resolves to `not_evaluated`.
 */
export function reconcile(
  criteria: readonly SuccessCriterion[],
  verdicts: readonly CriterionVerdictRecord[],
): ReconciledCriterion[] {
  const byCriterion = new Map<string, CriterionVerdictRecord[]>();
  for (const v of verdicts) {
    const arr = byCriterion.get(v.wcagId);
    if (arr) arr.push(v);
    else byCriterion.set(v.wcagId, [v]);
  }

  return criteria.map(sc => {
    const rows = byCriterion.get(sc.id) ?? [];
    const human = pick(rows, 'human');
    const machine = pick(rows, 'machine');
    const winner = human ?? machine;
    const base = {
      wcagId: sc.id,
      title: sc.title,
      level: sc.level,
    };
    if (!winner) {
      return {
        ...base,
        verdict: 'not_evaluated' as const,
        source: 'machine' as const,
        remarks: '',
        evidence: null,
        needsHumanReview: true,
      };
    }
    return {
      ...base,
      verdict: winner.verdict,
      source: winner.source,
      remarks: winner.remarks,
      evidence: winner.evidence,
      needsHumanReview: winner.source === 'machine',
    };
  });
}

/**
 * Criteria that block publishing: claimed `supports` on machine evidence alone.
 * These must get a human verdict before the document can assert conformance.
 */
export function publishBlockers(reconciled: readonly ReconciledCriterion[]): ReconciledCriterion[] {
  return reconciled.filter(r => r.verdict === 'supports' && r.source === 'machine');
}

/** True when nothing blocks publishing (no machine-only `supports` claims). */
export function canPublish(reconciled: readonly ReconciledCriterion[]): boolean {
  return publishBlockers(reconciled).length === 0;
}

/** Counts of reconciled verdicts by value, plus how many still need review. */
export function summarizeReconciled(
  reconciled: readonly ReconciledCriterion[],
): Record<VerdictValue, number> & { needsHumanReview: number } {
  const counts = {
    supports: 0,
    partially_supports: 0,
    does_not_support: 0,
    not_applicable: 0,
    not_evaluated: 0,
    needsHumanReview: 0,
  };
  for (const r of reconciled) {
    counts[r.verdict]++;
    if (r.needsHumanReview) counts.needsHumanReview++;
  }
  return counts;
}
