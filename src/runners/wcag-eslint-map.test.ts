import { describe, it, expect } from 'vitest';
import { WCAG_TO_ESLINT, ESLINT_TO_WCAG, AUTO_FIXABLE_RULES } from './wcag-eslint-map.js';

describe('wcag-eslint-map', () => {
  it('ESLINT_TO_WCAG is the exact inverse of WCAG_TO_ESLINT', () => {
    for (const [wcag, rule] of Object.entries(WCAG_TO_ESLINT)) {
      expect(ESLINT_TO_WCAG[rule]).toBe(wcag);
    }
    expect(Object.keys(ESLINT_TO_WCAG)).toHaveLength(Object.keys(WCAG_TO_ESLINT).length);
  });

  it('has no duplicate ESLint rule names (inversion is lossless)', () => {
    const rules = Object.values(WCAG_TO_ESLINT);
    expect(new Set(rules).size).toBe(rules.length);
  });

  it('every auto-fixable rule is a known jsx-a11y rule in the map', () => {
    const known = new Set(Object.values(WCAG_TO_ESLINT));
    for (const rule of AUTO_FIXABLE_RULES) {
      expect(known.has(rule)).toBe(true);
    }
  });

  it('maps WCAG ids to jsx-a11y/* rule names', () => {
    for (const rule of Object.values(WCAG_TO_ESLINT)) {
      expect(rule).toMatch(/^jsx-a11y\//);
    }
  });
});
