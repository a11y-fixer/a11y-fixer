// Reconciliation: merge machine + human verdicts into the final per-criterion
// result a VPAT/ACR would publish.
//
// Rules (the honesty posture of the feature):
//   - A human verdict always wins over the machine draft for the same criterion.
//   - Where no human has reviewed, the machine verdict stands but is flagged
//     `needsHumanReview`.
//   - A document may be published at any time, but a `supports` claim resting on
//     machine evidence alone is DOWNGRADED to `not_evaluated` in the published
//     document (`forPublication`). Automated tools cannot prove conformance, only
//     the absence of detectable failures, so an unconfirmed machine pass is
//     reported as "not evaluated" rather than claimed as "Supports". The reviewer
//     UI still sees the undowngraded draft (via `reconcile`) so a person can
//     confirm it; confirming upgrades the row to a real human `supports`.
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
    // A human verdict only counts as reviewed when it has a real author. author_id
    // is `on delete set null`, so deleting a reviewer would otherwise leave an
    // unattributable "human" claim that silently passes the publish gate. Treat
    // such a row as not-yet-reviewed so the gate falls back to the machine draft.
    const reviewedHuman = human && human.authorId ? human : undefined;
    const winner = reviewedHuman ?? machine;
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
 * Criteria claimed `supports` on machine evidence alone. These do not block
 * publishing, but they are downgraded to `not_evaluated` in the published
 * document (`forPublication`) until a reviewer confirms them. The reviewer UI
 * lists these so a tester knows exactly which rows a human pass would upgrade.
 */
export function unconfirmedSupports(reconciled: readonly ReconciledCriterion[]): ReconciledCriterion[] {
  return reconciled.filter(r => r.verdict === 'supports' && r.source === 'machine');
}

/**
 * The note appended to a downgraded criterion's remarks, so the published
 * document explains why an automated pass reads as "Not Evaluated".
 */
const UNVERIFIED_NOTE =
  'Automated checks found no failures, but a person has not confirmed this criterion, so it is reported as Not Evaluated.';

/**
 * Transform reconciled rows for publication under the honesty posture: an
 * unconfirmed machine `supports` is downgraded to `not_evaluated` (automated
 * tools can only prove the absence of detectable failures, never conformance).
 * Human-confirmed verdicts and every other verdict pass through unchanged. This
 * is what the published document — and its frozen revision snapshot — renders;
 * `reconcile` itself is left intact for the reviewer UI.
 */
export function forPublication(reconciled: readonly ReconciledCriterion[]): ReconciledCriterion[] {
  return reconciled.map(r => {
    if (r.verdict === 'supports' && r.source === 'machine') {
      return {
        ...r,
        verdict: 'not_evaluated' as const,
        remarks: r.remarks ? `${r.remarks} ${UNVERIFIED_NOTE}` : UNVERIFIED_NOTE,
        needsHumanReview: true,
      };
    }
    return r;
  });
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
