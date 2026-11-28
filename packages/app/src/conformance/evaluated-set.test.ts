import { describe, it, expect } from 'vitest';
import { passEligibleCriteria, runtimePassEligibleCriteria } from './evaluated-set.js';
import { bucketOf } from './wcag-matrix.js';

describe('passEligibleCriteria — deterministic (M)', () => {
  it('pins html to M-primary criteria only', () => {
    const set = passEligibleCriteria('html');
    expect(set.has('1.4.2')).toBe(true);
    expect(set.has('3.1.1')).toBe(true);
    for (const c of set) expect(bucketOf(c)).toBe('M');
  });
  it('jsx and markdown assert no passes', () => {
    expect(passEligibleCriteria('jsx').size).toBe(0);
    expect(passEligibleCriteria('markdown').size).toBe(0);
  });
});

describe('runtimePassEligibleCriteria — runtime (R)', () => {
  it('includes 4.1.3 and only R-primary criteria', () => {
    const set = runtimePassEligibleCriteria();
    expect(set.has('4.1.3')).toBe(true);
    for (const c of set) expect(bucketOf(c)).toBe('R');
  });
  it('does not overlap the deterministic html set', () => {
    const runtime = runtimePassEligibleCriteria();
    for (const c of passEligibleCriteria('html')) expect(runtime.has(c)).toBe(false);
  });
});
