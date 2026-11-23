// Pass-eligibility: which criteria the deterministic scanner may assert a PASS
// for, per engine + scan path. This is risk #1 in the Phase 1 plan — a wrong
// entry here asserts a `pass` nobody earned — so the set is a PINNED, deliberately
// tiny allowlist, not derived automatically, and every entry is an M-primary
// criterion where "no violation on a scanned file" genuinely means conformant.
//
// Expand ONLY with review against docs/conformance/wcag-2.2-aa-matrix.md. A
// criterion that is split M/S (e.g. 2.4.2 presence vs. descriptiveness, 4.1.2
// name presence vs. name quality) is NOT pass-eligible from the scanner alone —
// its `pass` needs the Phase 3 agent + human confirmation.
import { bucketOf } from './wcag-matrix.js';

export type ScanPath = 'html' | 'jsx' | 'markdown';

// Seed: the criteria where absence of a violation fully proves conformance.
//  1.4.2  no autoplaying audio > 3s (axe no-autoplay-audio)
//  3.1.1  page has a valid lang (axe html-has-lang + html-lang-valid)
const PASS_ELIGIBLE: Readonly<Record<ScanPath, readonly string[]>> = {
  html: ['1.4.2', '3.1.1'],
  // The JSX/ESLint path reliably full-decides almost nothing to a PASS (it mostly
  // flags; absence is not proof). Empty until a criterion earns its place.
  jsx: [],
  markdown: [],
};

/**
 * The criteria a scan on `scanPath` may assert a `pass` for. Returns a Set for
 * O(1) membership. Every returned criterion is asserted to be M-primary (guarded
 * below so a matrix edit that reclassifies one drops it automatically).
 */
export function passEligibleCriteria(scanPath: ScanPath): ReadonlySet<string> {
  const seed = PASS_ELIGIBLE[scanPath] ?? [];
  // Defensive: never return a criterion the matrix does not classify M.
  return new Set(seed.filter(c => bucketOf(c) === 'M'));
}
