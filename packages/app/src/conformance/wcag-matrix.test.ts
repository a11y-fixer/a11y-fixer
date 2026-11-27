import { describe, it, expect } from 'vitest';
import { getSuccessCriterion } from '@a11y-fixer/core';
import { WCAG_2_2_BUCKETS, levelOf, bucketOf } from './wcag-matrix.js';

// The reconciliation guarantee: the ledger's criterion set and the core catalog
// (which the audit pipeline derives against) are ONE source. If they drift — a
// level changes, a criterion is added or removed — these tests fail, so a `fail`
// claim and a `partially_supports` verdict can never disagree on identity/level.
describe('wcag-matrix ↔ core catalog reconciliation', () => {
  it('every bucketed criterion is a real A/AA criterion in the core catalog', () => {
    for (const id of Object.keys(WCAG_2_2_BUCKETS)) {
      const sc = getSuccessCriterion(id);
      expect(sc, `criterion ${id} must exist in the core catalog`).toBeDefined();
      expect(['A', 'AA'], `criterion ${id} must be level A or AA`).toContain(sc!.level);
    }
  });

  it('levelOf returns the catalog level for every tracked criterion', () => {
    for (const id of Object.keys(WCAG_2_2_BUCKETS)) {
      expect(levelOf(id)).toBe(getSuccessCriterion(id)!.level);
    }
  });
});

describe('levelOf', () => {
  it('is null for criteria the ledger does not track', () => {
    expect(levelOf('4.1.1')).toBeNull(); // Parsing: removed in WCAG 2.2
    expect(levelOf('2.2.4')).toBeNull(); // Interruptions: AAA, out of scope
    expect(levelOf('9.9.9')).toBeNull(); // not a criterion at all
  });

  it('does not promote a catalog criterion the ledger has not bucketed', () => {
    // 4.1.1 Parsing is still in the core catalog at level A (it carries 2.0/2.1
    // VPATs) but is intentionally NOT bucketed here — it was removed in WCAG 2.2.
    // levelOf must stay null: the bucket map is the ledger's membership gate, not
    // mere catalog presence. This is the exact case where the two sources differ
    // by design, and the fold must respect it.
    expect(getSuccessCriterion('4.1.1')?.level).toBe('A'); // in the catalog...
    expect('4.1.1' in WCAG_2_2_BUCKETS).toBe(false); // ...but not bucketed
    expect(levelOf('4.1.1')).toBeNull(); // ...so the ledger does not track it
  });
});

describe('bucketOf', () => {
  it('returns the hand-maintained bucket for a tracked criterion', () => {
    expect(bucketOf('1.4.2')).toBe('M');
    expect(bucketOf('2.1.1')).toBe('R');
    expect(bucketOf('1.1.1')).toBe('S');
    expect(bucketOf('1.2.1')).toBe('H');
  });

  it('is null for an untracked criterion', () => {
    expect(bucketOf('4.1.1')).toBeNull();
  });
});
