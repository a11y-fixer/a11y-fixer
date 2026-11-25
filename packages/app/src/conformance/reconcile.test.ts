import { describe, it, expect } from 'vitest';
import type { SuccessCriterion } from '@a11y-fixer/core';
import type { CriterionVerdictRecord, VerdictSource, VerdictValue } from '../db/store.js';
import { reconcile, unconfirmedSupports, forPublication, summarizeReconciled } from './reconcile.js';

function sc(id: string): SuccessCriterion {
  return {
    id,
    title: `Criterion ${id}`,
    level: 'AA',
    wcagVersion: '2.0',
    understandingUrl: `https://example.test/${id}`,
    en301549Clause: `9.${id}`,
    coveringRuleIds: [],
    hasAutomatedCoverage: true,
  };
}

const CATALOG = [sc('1.1.1'), sc('1.4.3'), sc('2.4.6')];

function verdict(
  wcagId: string,
  source: VerdictSource,
  value: VerdictValue,
  remarks = '',
): CriterionVerdictRecord {
  return {
    id: `${wcagId}-${source}`,
    auditId: 'a1',
    wcagId,
    source,
    verdict: value,
    remarks,
    evidence: source === 'machine' ? { automated: true } : null,
    authorId: source === 'human' ? 'u1' : null,
    updatedAt: 't',
  };
}

describe('reconcile', () => {
  it('returns one row per catalog criterion, in order', () => {
    const out = reconcile(CATALOG, []);
    expect(out.map(r => r.wcagId)).toEqual(['1.1.1', '1.4.3', '2.4.6']);
  });

  it('resolves a criterion with no verdict to not_evaluated and flags review', () => {
    const [row] = reconcile([sc('1.1.1')], []);
    expect(row.verdict).toBe('not_evaluated');
    expect(row.needsHumanReview).toBe(true);
  });

  it('lets the machine draft stand but flags it for review', () => {
    const [row] = reconcile([sc('1.1.1')], [verdict('1.1.1', 'machine', 'supports')]);
    expect(row.verdict).toBe('supports');
    expect(row.source).toBe('machine');
    expect(row.needsHumanReview).toBe(true);
  });

  it('lets a human verdict win over the machine draft and clears the flag', () => {
    const out = reconcile(
      [sc('1.1.1')],
      [
        verdict('1.1.1', 'machine', 'partially_supports', 'auto found issues'),
        verdict('1.1.1', 'human', 'supports', 'tester confirmed'),
      ],
    );
    expect(out[0].verdict).toBe('supports');
    expect(out[0].source).toBe('human');
    expect(out[0].remarks).toBe('tester confirmed');
    expect(out[0].needsHumanReview).toBe(false);
  });

  it('carries catalog title and level onto each row', () => {
    const [row] = reconcile([sc('1.4.3')], []);
    expect(row.title).toBe('Criterion 1.4.3');
    expect(row.level).toBe('AA');
  });

  it('treats a human verdict with no author as unreviewed and falls back to the machine draft', () => {
    // author_id is `on delete set null`, so a deleted reviewer leaves an
    // unattributable human row. It must not count as a confirmed human verdict.
    const orphanHuman: CriterionVerdictRecord = { ...verdict('1.1.1', 'human', 'supports', 'orphan'), authorId: null };
    const [row] = reconcile([sc('1.1.1')], [verdict('1.1.1', 'machine', 'partially_supports'), orphanHuman]);
    expect(row.source).toBe('machine');
    expect(row.verdict).toBe('partially_supports');
    expect(row.needsHumanReview).toBe(true);
  });

  it('treats a machine supports "confirmed" only by an authorless human row as unconfirmed', () => {
    const orphanHuman: CriterionVerdictRecord = { ...verdict('1.1.1', 'human', 'supports'), authorId: null };
    const out = reconcile([sc('1.1.1')], [verdict('1.1.1', 'machine', 'supports'), orphanHuman]);
    expect(unconfirmedSupports(out).map(b => b.wcagId)).toEqual(['1.1.1']);
  });
});

describe('unconfirmedSupports', () => {
  it('lists criteria that are supports on machine evidence alone', () => {
    const out = reconcile(CATALOG, [
      verdict('1.1.1', 'machine', 'supports'),
      verdict('1.4.3', 'human', 'supports'),
      verdict('2.4.6', 'machine', 'partially_supports'),
    ]);
    expect(unconfirmedSupports(out).map(b => b.wcagId)).toEqual(['1.1.1']);
  });

  it('is empty once every machine-only supports is human-confirmed', () => {
    const out = reconcile(CATALOG, [
      verdict('1.1.1', 'human', 'supports'),
      verdict('1.4.3', 'human', 'supports'),
      verdict('2.4.6', 'machine', 'partially_supports'),
    ]);
    expect(unconfirmedSupports(out)).toEqual([]);
  });

  it('does not list machine partially_supports or not_evaluated', () => {
    const out = reconcile([sc('1.1.1'), sc('1.4.3')], [
      verdict('1.1.1', 'machine', 'partially_supports'),
      // 1.4.3 has no verdict → not_evaluated
    ]);
    expect(unconfirmedSupports(out)).toEqual([]);
  });
});

describe('forPublication', () => {
  it('downgrades an unconfirmed machine supports to not_evaluated and notes why', () => {
    const out = forPublication(reconcile([sc('1.1.1')], [verdict('1.1.1', 'machine', 'supports')]));
    expect(out[0].verdict).toBe('not_evaluated');
    expect(out[0].source).toBe('machine');
    expect(out[0].needsHumanReview).toBe(true);
    expect(out[0].remarks).toMatch(/not confirmed|Not Evaluated/i);
  });

  it('preserves existing remarks when it appends the unverified note', () => {
    const out = forPublication(reconcile([sc('1.1.1')], [verdict('1.1.1', 'machine', 'supports', 'auto-checked')]));
    expect(out[0].remarks).toMatch(/^auto-checked /);
  });

  it('leaves a human-confirmed supports unchanged', () => {
    const out = forPublication(
      reconcile([sc('1.1.1')], [verdict('1.1.1', 'human', 'supports', 'tester confirmed')]),
    );
    expect(out[0].verdict).toBe('supports');
    expect(out[0].source).toBe('human');
    expect(out[0].remarks).toBe('tester confirmed');
  });

  it('leaves machine partially_supports, does_not_support and not_evaluated unchanged', () => {
    const out = forPublication(
      reconcile([sc('1.1.1'), sc('1.4.3'), sc('2.4.6')], [
        verdict('1.1.1', 'machine', 'partially_supports'),
        verdict('1.4.3', 'machine', 'does_not_support'),
        // 2.4.6 → not_evaluated
      ]),
    );
    expect(out.map(r => r.verdict)).toEqual(['partially_supports', 'does_not_support', 'not_evaluated']);
  });
});

describe('summarizeReconciled', () => {
  it('counts verdicts and criteria needing review', () => {
    const out = reconcile(CATALOG, [
      verdict('1.1.1', 'machine', 'supports'), // needs review
      verdict('1.4.3', 'human', 'does_not_support'),
      // 2.4.6 → not_evaluated, needs review
    ]);
    const s = summarizeReconciled(out);
    expect(s.supports).toBe(1);
    expect(s.does_not_support).toBe(1);
    expect(s.not_evaluated).toBe(1);
    expect(s.needsHumanReview).toBe(2);
  });
});
