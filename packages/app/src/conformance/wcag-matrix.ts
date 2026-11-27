// Machine-readable WCAG 2.2 A+AA classification — the Phase 0 matrix as data.
// Source of truth in prose: docs/conformance/wcag-2.2-aa-matrix.md.
//
// This file encodes ONE thing the core catalog doesn't: each criterion's PRIMARY
// producer bucket (M/R/S/H), which decides who may assert a `pass`. A criterion's
// conformance LEVEL is NOT duplicated here — it is sourced from the core catalog
// (`getSuccessCriterion`), the single source of truth shared with the audit
// pipeline (`derive.ts`/`deriveMachineVerdicts`). That fold is deliberate: a
// deterministic `fail` claim (ledger) and a `partially_supports` verdict (audit)
// are now derived against the same criterion identities and levels, so they can
// never silently disagree about whether a criterion exists or what level it is.
// `wcag-matrix.test.ts` asserts every bucketed criterion below is a real A/AA
// criterion in the catalog, so the two can't drift.
//
// Bucket legend: M machine-decidable, R runtime-observable, S semantic, H human.
// A `pass` from the deterministic scanner is only honest for M-primary criteria
// (absence of a violation == conformant). For R/S/H, a detected violation is a
// real `fail`, but "no violation" never proves conformance — see PASS_ELIGIBLE.
// 4.1.1 (Parsing) is intentionally absent: removed in WCAG 2.2.
import { getSuccessCriterion } from '@a11y-fixer/core';

export type Bucket = 'M' | 'R' | 'S' | 'H';

/** PRIMARY producer bucket per tracked WCAG 2.2 A/AA criterion. Hand-maintained. */
export const WCAG_2_2_BUCKETS: Readonly<Record<string, Bucket>> = {
  // Level A
  '1.1.1': 'S',
  '1.2.1': 'H',
  '1.2.2': 'H',
  '1.2.3': 'H',
  '1.3.1': 'M',
  '1.3.2': 'R',
  '1.3.3': 'S',
  '1.4.1': 'H',
  '1.4.2': 'M',
  '2.1.1': 'R',
  '2.1.2': 'R',
  '2.1.4': 'R',
  '2.2.1': 'M',
  '2.2.2': 'M',
  '2.3.1': 'H',
  '2.4.1': 'M',
  '2.4.2': 'M',
  '2.4.3': 'R',
  '2.4.4': 'S',
  '2.5.1': 'R',
  '2.5.2': 'R',
  '2.5.3': 'M',
  '2.5.4': 'R',
  '3.1.1': 'M',
  '3.2.1': 'R',
  '3.2.2': 'R',
  '3.2.6': 'R',
  '3.3.1': 'R',
  '3.3.2': 'M',
  '3.3.7': 'R',
  '4.1.2': 'M',
  // Level AA
  '1.2.4': 'H',
  '1.2.5': 'H',
  '1.3.4': 'R',
  '1.3.5': 'M',
  '1.4.3': 'M',
  '1.4.4': 'R',
  '1.4.5': 'S',
  '1.4.10': 'R',
  '1.4.11': 'R',
  '1.4.12': 'R',
  '1.4.13': 'R',
  '2.4.5': 'R',
  '2.4.6': 'M',
  '2.4.7': 'R',
  '2.4.11': 'R',
  '2.5.7': 'R',
  '2.5.8': 'R',
  '3.1.2': 'M',
  '3.2.3': 'R',
  '3.2.4': 'S',
  '3.3.3': 'S',
  '3.3.4': 'H',
  '3.3.8': 'R',
  '4.1.3': 'R',
};

/**
 * Level of a criterion, or null if it is not a tracked WCAG 2.2 A/AA SC. The
 * level is read from the core catalog (shared source of truth); a criterion the
 * ledger doesn't bucket, or one the catalog doesn't carry at A/AA, returns null.
 */
export function levelOf(criterion: string): 'A' | 'AA' | null {
  if (!(criterion in WCAG_2_2_BUCKETS)) return null;
  const sc = getSuccessCriterion(criterion);
  return sc && (sc.level === 'A' || sc.level === 'AA') ? sc.level : null;
}

/** Primary producer bucket of a criterion, or null if it is not tracked. */
export function bucketOf(criterion: string): Bucket | null {
  return WCAG_2_2_BUCKETS[criterion] ?? null;
}
