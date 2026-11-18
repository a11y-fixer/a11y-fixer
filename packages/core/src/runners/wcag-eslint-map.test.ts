import { describe, it, expect } from 'vitest';
import { WCAG_TO_ESLINT, ESLINT_TO_WCAG, AUTO_FIXABLE_RULES } from './wcag-eslint-map.js';

describe('wcag-eslint-map', () => {
  it('every WCAG_TO_ESLINT entry has a corresponding ESLINT_TO_WCAG entry', () => {
    for (const [wcag, rule] of Object.entries(WCAG_TO_ESLINT)) {
      expect(ESLINT_TO_WCAG[rule]).toBe(wcag);
    }
    // ESLINT_TO_WCAG may have MORE entries: additional rules that share a WCAG
    // criterion with the primary rule, and custom inline rules.
    expect(Object.keys(ESLINT_TO_WCAG).length).toBeGreaterThanOrEqual(
      Object.keys(WCAG_TO_ESLINT).length,
    );
  });

  it('WCAG_TO_ESLINT has no duplicate ESLint rule names (primary map is injective)', () => {
    const rules = Object.values(WCAG_TO_ESLINT);
    expect(new Set(rules).size).toBe(rules.length);
  });

  it('every auto-fixable rule is a known jsx-a11y rule in the map', () => {
    const known = new Set(Object.values(WCAG_TO_ESLINT));
    for (const rule of AUTO_FIXABLE_RULES) {
      expect(known.has(rule)).toBe(true);
    }
  });

  it('WCAG_TO_ESLINT maps WCAG ids to jsx-a11y/* rule names', () => {
    for (const rule of Object.values(WCAG_TO_ESLINT)) {
      expect(rule).toMatch(/^jsx-a11y\//);
    }
  });

  it('ESLINT_TO_WCAG covers all four BrokenComponent violation rule IDs', () => {
    expect(ESLINT_TO_WCAG['jsx-a11y/alt-text']).toBe('1.1.1');
    expect(ESLINT_TO_WCAG['a11y-custom/button-must-have-label']).toBe('4.1.2');
    expect(ESLINT_TO_WCAG['a11y-custom/input-must-have-label']).toBe('1.3.1');
    expect(ESLINT_TO_WCAG['a11y-custom/no-generic-link-text']).toBe('2.4.4');
  });
});
