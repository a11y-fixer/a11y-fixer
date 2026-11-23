import { describe, it, expect } from 'vitest';
import {
  SUCCESS_CRITERIA,
  getSuccessCriterion,
  isKnownCriterion,
  criteriaWithAutomatedCoverage,
} from './catalog.js';
import { AXE_WCAG_MAP } from '../detector/axe.js';
import { ESLINT_TO_WCAG } from '../runners/wcag-eslint-map.js';

describe('WCAG catalog', () => {
  it('has unique, well-formed, canonically-ordered criterion ids', () => {
    const ids = SUCCESS_CRITERIA.map((sc) => sc.id);
    expect(new Set(ids).size, 'duplicate ids').toBe(ids.length);
    for (const sc of SUCCESS_CRITERIA) {
      expect(sc.id, sc.id).toMatch(/^\d+\.\d+\.\d+$/);
      expect(sc.title.length, sc.id).toBeGreaterThan(0);
    }
    // Sorted numerically by each dotted segment.
    const sorted = [...SUCCESS_CRITERIA].sort((a, b) => {
      const pa = a.id.split('.').map(Number);
      const pb = b.id.split('.').map(Number);
      for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
      return 0;
    });
    expect(SUCCESS_CRITERIA.map((s) => s.id)).toEqual(sorted.map((s) => s.id));
  });

  it('contains Level A and AA criteria, plus only AAA criteria a detector can emit', () => {
    for (const sc of SUCCESS_CRITERIA) {
      // AAA is out of scope for AA procurement, except where an axe/eslint rule
      // maps to it: then it must carry metadata so the finding never drops.
      const allowed = sc.level === 'AAA' ? sc.hasAutomatedCoverage : true;
      expect(allowed, `${sc.id} (${sc.level})`).toBe(true);
      expect(['A', 'AA', 'AAA'], sc.id).toContain(sc.level);
    }
  });

  it('derives the EN 301 549 web clause from the criterion id', () => {
    expect(getSuccessCriterion('1.1.1')?.en301549Clause).toBe('9.1.1.1');
    expect(getSuccessCriterion('1.4.3')?.en301549Clause).toBe('9.1.4.3');
  });

  // Drift guard: every WCAG id the detector maps emit must resolve to a catalog
  // entry, or a scan could report a criterion the catalog (and thus the VPAT)
  // doesn't know about. Same spirit as detector/axe-map.test.ts.
  it('contains every WCAG id reachable from the detector maps', () => {
    const reachable = new Set<string>([
      ...Object.values(AXE_WCAG_MAP),
      ...Object.values(ESLINT_TO_WCAG),
    ]);
    for (const wcagId of reachable) {
      expect(isKnownCriterion(wcagId), `missing catalog entry for ${wcagId}`).toBe(true);
    }
  });

  it('reports automated coverage that matches the detector maps', () => {
    const covered = new Set(criteriaWithAutomatedCoverage().map((sc) => sc.id));
    const expected = new Set<string>([
      ...Object.values(AXE_WCAG_MAP),
      ...Object.values(ESLINT_TO_WCAG),
    ]);
    expect([...covered].sort()).toEqual([...expected].sort());

    // A spot check that rule ids from both maps land on the right criterion.
    const altText = getSuccessCriterion('1.1.1');
    expect(altText?.coveringRuleIds).toContain('image-alt'); // axe
    expect(altText?.coveringRuleIds).toContain('jsx-a11y/alt-text'); // eslint
  });

  it('marks criteria with no detector as lacking automated coverage', () => {
    // 1.2.1 (audio/video-only) has no automated detector in a11y-fixer.
    const sc = getSuccessCriterion('1.2.1');
    expect(sc?.hasAutomatedCoverage).toBe(false);
    expect(sc?.coveringRuleIds).toEqual([]);
  });
});
