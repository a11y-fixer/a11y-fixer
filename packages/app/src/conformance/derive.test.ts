import { describe, it, expect } from 'vitest';
import type { SuccessCriterion } from '@a11y-fixer/core';
import type { ViolationRecord } from '../db/store.js';
import { deriveMachineVerdicts, summarizeDraft } from './derive.js';

// Fixture catalog (a type-only import of SuccessCriterion keeps this test
// independent of @a11y-fixer/core's build). Three shapes we care about:
//   1.1.1 — has automated coverage
//   1.4.3 — has automated coverage
//   1.2.1 — no automated coverage (manual-only)
function sc(id: string, hasAutomatedCoverage: boolean, ruleIds: string[] = []): SuccessCriterion {
  return {
    id,
    title: `Criterion ${id}`,
    level: 'A',
    wcagVersion: '2.0',
    understandingUrl: `https://example.test/${id}`,
    en301549Clause: `9.${id}`,
    coveringRuleIds: ruleIds,
    hasAutomatedCoverage,
  };
}

const CATALOG: SuccessCriterion[] = [
  sc('1.1.1', true, ['image-alt']),
  sc('1.4.3', true, ['color-contrast']),
  sc('1.2.1', false),
];

function violation(wcagId: string, ruleId: string, impact: string): ViolationRecord {
  return {
    ruleId,
    wcagId,
    impact,
    description: `${ruleId} failed`,
    helpUrl: `https://help.test/${ruleId}`,
    path: 'src/App.tsx',
    line: 10,
  };
}

describe('deriveMachineVerdicts', () => {
  it('emits exactly one verdict per catalog criterion, in order', () => {
    const out = deriveMachineVerdicts(CATALOG, []);
    expect(out.map(v => v.wcagId)).toEqual(['1.1.1', '1.4.3', '1.2.1']);
  });

  it('marks covered criteria with no violations as supports (automated, no evidence)', () => {
    const out = deriveMachineVerdicts(CATALOG, []);
    const altText = out.find(v => v.wcagId === '1.1.1')!;
    expect(altText.verdict).toBe('supports');
    expect(altText.evidence).toBeNull();
    expect(altText.remarks).toMatch(/manual confirmation is required/i);
  });

  it('marks criteria without automated coverage as not_evaluated', () => {
    const out = deriveMachineVerdicts(CATALOG, []);
    const manual = out.find(v => v.wcagId === '1.2.1')!;
    expect(manual.verdict).toBe('not_evaluated');
    expect(manual.evidence).toBeNull();
    expect(manual.remarks).toMatch(/no automated test/i);
  });

  it('marks covered criteria with violations as partially_supports with evidence', () => {
    const violations = [
      violation('1.4.3', 'color-contrast', 'serious'),
      violation('1.4.3', 'color-contrast', 'serious'),
      violation('1.4.3', 'link-contrast', 'moderate'),
    ];
    const out = deriveMachineVerdicts(CATALOG, violations);
    const contrast = out.find(v => v.wcagId === '1.4.3')!;
    expect(contrast.verdict).toBe('partially_supports');
    expect(contrast.evidence).not.toBeNull();
    expect(contrast.evidence!.violationCount).toBe(3);
    expect(contrast.evidence!.impactCounts).toEqual({ serious: 2, moderate: 1 });
    expect(contrast.evidence!.ruleIds).toEqual(['color-contrast', 'link-contrast']); // sorted, deduped
    expect(contrast.remarks).toMatch(/3 issue\(s\)/);
    // Other criteria remain unaffected.
    expect(out.find(v => v.wcagId === '1.1.1')!.verdict).toBe('supports');
  });

  it('never emits does_not_support or not_applicable from automated evidence', () => {
    const violations = [violation('1.1.1', 'image-alt', 'critical')];
    const out = deriveMachineVerdicts(CATALOG, violations);
    for (const v of out) {
      expect(['supports', 'partially_supports', 'not_evaluated']).toContain(v.verdict);
    }
  });

  it('ignores violations whose wcagId is not a catalog criterion', () => {
    const violations = [violation('9.9.9', 'some-future-rule', 'minor')];
    const out = deriveMachineVerdicts(CATALOG, violations);
    // No criterion flips to partial; 9.9.9 simply has no row.
    expect(out.every(v => v.verdict !== 'partially_supports')).toBe(true);
    expect(out.find(v => v.wcagId === '9.9.9')).toBeUndefined();
  });

  it('caps evidence samples at five', () => {
    const many = Array.from({ length: 8 }, () => violation('1.1.1', 'image-alt', 'minor'));
    const out = deriveMachineVerdicts(CATALOG, many);
    const altText = out.find(v => v.wcagId === '1.1.1')!;
    expect(altText.evidence!.violationCount).toBe(8);
    expect(altText.evidence!.samples).toHaveLength(5);
  });
});

describe('summarizeDraft', () => {
  it('counts verdicts by value', () => {
    const out = deriveMachineVerdicts(CATALOG, [violation('1.4.3', 'color-contrast', 'serious')]);
    expect(summarizeDraft(out)).toEqual({
      supports: 1, // 1.1.1
      partially_supports: 1, // 1.4.3
      does_not_support: 0,
      not_applicable: 0,
      not_evaluated: 1, // 1.2.1
    });
  });
});
