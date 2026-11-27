// Machine-readable WCAG 2.2 A+AA classification — the Phase 0 matrix as data.
// Source of truth in prose: docs/conformance/wcag-2.2-aa-matrix.md. This encodes
// each criterion's conformance level and its PRIMARY producer bucket, which
// decides who may assert a `pass`. 4.1.1 (Parsing) is omitted: removed in 2.2.
//
// Bucket legend: M machine-decidable, R runtime-observable, S semantic, H human.
// A `pass` from the deterministic scanner is only honest for M-primary criteria
// (absence of a violation == conformant). For R/S/H, a detected violation is a
// real `fail`, but "no violation" never proves conformance — see PASS_ELIGIBLE.

export type Bucket = 'M' | 'R' | 'S' | 'H';
export interface CriterionMeta {
  level: 'A' | 'AA';
  bucket: Bucket;
}

export const WCAG_2_2: Readonly<Record<string, CriterionMeta>> = {
  // Level A
  '1.1.1': { level: 'A', bucket: 'S' },
  '1.2.1': { level: 'A', bucket: 'H' },
  '1.2.2': { level: 'A', bucket: 'H' },
  '1.2.3': { level: 'A', bucket: 'H' },
  '1.3.1': { level: 'A', bucket: 'M' },
  '1.3.2': { level: 'A', bucket: 'R' },
  '1.3.3': { level: 'A', bucket: 'S' },
  '1.4.1': { level: 'A', bucket: 'H' },
  '1.4.2': { level: 'A', bucket: 'M' },
  '2.1.1': { level: 'A', bucket: 'R' },
  '2.1.2': { level: 'A', bucket: 'R' },
  '2.1.4': { level: 'A', bucket: 'R' },
  '2.2.1': { level: 'A', bucket: 'M' },
  '2.2.2': { level: 'A', bucket: 'M' },
  '2.3.1': { level: 'A', bucket: 'H' },
  '2.4.1': { level: 'A', bucket: 'M' },
  '2.4.2': { level: 'A', bucket: 'M' },
  '2.4.3': { level: 'A', bucket: 'R' },
  '2.4.4': { level: 'A', bucket: 'S' },
  '2.5.1': { level: 'A', bucket: 'R' },
  '2.5.2': { level: 'A', bucket: 'R' },
  '2.5.3': { level: 'A', bucket: 'M' },
  '2.5.4': { level: 'A', bucket: 'R' },
  '3.1.1': { level: 'A', bucket: 'M' },
  '3.2.1': { level: 'A', bucket: 'R' },
  '3.2.2': { level: 'A', bucket: 'R' },
  '3.2.6': { level: 'A', bucket: 'R' },
  '3.3.1': { level: 'A', bucket: 'R' },
  '3.3.2': { level: 'A', bucket: 'M' },
  '3.3.7': { level: 'A', bucket: 'R' },
  '4.1.2': { level: 'A', bucket: 'M' },
  // Level AA
  '1.2.4': { level: 'AA', bucket: 'H' },
  '1.2.5': { level: 'AA', bucket: 'H' },
  '1.3.4': { level: 'AA', bucket: 'R' },
  '1.3.5': { level: 'AA', bucket: 'M' },
  '1.4.3': { level: 'AA', bucket: 'M' },
  '1.4.4': { level: 'AA', bucket: 'R' },
  '1.4.5': { level: 'AA', bucket: 'S' },
  '1.4.10': { level: 'AA', bucket: 'R' },
  '1.4.11': { level: 'AA', bucket: 'R' },
  '1.4.12': { level: 'AA', bucket: 'R' },
  '1.4.13': { level: 'AA', bucket: 'R' },
  '2.4.5': { level: 'AA', bucket: 'R' },
  '2.4.6': { level: 'AA', bucket: 'M' },
  '2.4.7': { level: 'AA', bucket: 'R' },
  '2.4.11': { level: 'AA', bucket: 'R' },
  '2.5.7': { level: 'AA', bucket: 'R' },
  '2.5.8': { level: 'AA', bucket: 'R' },
  '3.1.2': { level: 'AA', bucket: 'M' },
  '3.2.3': { level: 'AA', bucket: 'R' },
  '3.2.4': { level: 'AA', bucket: 'S' },
  '3.3.3': { level: 'AA', bucket: 'S' },
  '3.3.4': { level: 'AA', bucket: 'H' },
  '3.3.8': { level: 'AA', bucket: 'R' },
  '4.1.3': { level: 'AA', bucket: 'R' },
};

/** Level of a criterion, or null if it is not a tracked WCAG 2.2 A/AA SC. */
export function levelOf(criterion: string): 'A' | 'AA' | null {
  return WCAG_2_2[criterion]?.level ?? null;
}

export function bucketOf(criterion: string): Bucket | null {
  return WCAG_2_2[criterion]?.bucket ?? null;
}
