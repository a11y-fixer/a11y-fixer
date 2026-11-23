import { describe, it, expect } from 'vitest';
import type { ReconciledCriterion } from '../reconcile.js';
import { buildAcr } from './vpat.js';
import type { DocumentMeta } from './model.js';

function rc(p: Partial<ReconciledCriterion> & Pick<ReconciledCriterion, 'wcagId' | 'level' | 'verdict' | 'source'>): ReconciledCriterion {
  return {
    title: `Criterion ${p.wcagId}`,
    remarks: '',
    evidence: null,
    needsHumanReview: p.source === 'machine',
    ...p,
  };
}

const META: DocumentMeta = {
  productName: 'acme/widget',
  vendor: 'acme',
  headSha: 'abcdef1234567',
  date: '2026-11-23',
  published: true,
  evaluationMethods: 'Automated + manual.',
  conformanceTarget: 'WCAG 2.2 Level AA',
};

describe('buildAcr', () => {
  it('splits criteria into Level A and AA tables and always includes 508 + EN reports', () => {
    const doc = buildAcr({
      meta: META,
      reconciled: [
        rc({ wcagId: '1.1.1', level: 'A', verdict: 'supports', source: 'human' }),
        rc({ wcagId: '1.4.3', level: 'AA', verdict: 'does_not_support', source: 'human' }),
      ],
    });
    const ids = doc.tables.map(t => t.id);
    expect(ids).toEqual(['wcag-a', 'wcag-aa', 'section-508', 'en-301-549']);
    expect(doc.tables.find(t => t.id === 'wcag-a')!.rows.map(r => r.wcagId)).toEqual(['1.1.1']);
    expect(doc.tables.find(t => t.id === 'wcag-aa')!.rows.map(r => r.wcagId)).toEqual(['1.4.3']);
  });

  it('omits the AAA table unless an AAA criterion was evaluated', () => {
    const without = buildAcr({ meta: META, reconciled: [rc({ wcagId: '1.1.1', level: 'A', verdict: 'supports', source: 'human' })] });
    expect(without.tables.some(t => t.id === 'wcag-aaa')).toBe(false);

    const withAAA = buildAcr({
      meta: META,
      reconciled: [rc({ wcagId: '2.2.4', level: 'AAA', verdict: 'supports', source: 'human' })],
    });
    expect(withAAA.tables.some(t => t.id === 'wcag-aaa')).toBe(true);
  });

  it('renders EN 301 549 clauses as 9.<id> taking each WCAG result', () => {
    const doc = buildAcr({ meta: META, reconciled: [rc({ wcagId: '1.4.3', level: 'AA', verdict: 'partially_supports', source: 'human' })] });
    const en = doc.tables.find(t => t.id === 'en-301-549')!;
    expect(en.rows[0].wcagId).toBe('9.1.4.3');
    expect(en.rows[0].conformance).toBe('Partially Supports');
  });

  it('excludes AAA criteria from the EN 301 549 table (Ch 9 incorporates only A and AA)', () => {
    const doc = buildAcr({
      meta: META,
      reconciled: [
        rc({ wcagId: '1.1.1', level: 'A', verdict: 'supports', source: 'human' }),
        rc({ wcagId: '2.2.4', level: 'AAA', verdict: 'supports', source: 'human' }),
      ],
    });
    const en = doc.tables.find(t => t.id === 'en-301-549')!;
    const clauses = en.rows.map(r => r.wcagId);
    expect(clauses).toContain('9.1.1.1');
    expect(clauses).not.toContain('9.2.2.4'); // no EN web clause for a AAA criterion
  });

  it('annotates an unreviewed machine verdict so the reader knows no person confirmed it', () => {
    const doc = buildAcr({ meta: META, reconciled: [rc({ wcagId: '1.1.1', level: 'A', verdict: 'supports', source: 'machine' })] });
    const row = doc.tables.find(t => t.id === 'wcag-a')!.rows[0];
    expect(row.remarks).toMatch(/not confirmed by manual review/i);
  });

  it('marks not_evaluated criteria explicitly rather than implying conformance', () => {
    const doc = buildAcr({ meta: META, reconciled: [rc({ wcagId: '1.2.1', level: 'A', verdict: 'not_evaluated', source: 'machine' })] });
    const row = doc.tables.find(t => t.id === 'wcag-a')!.rows[0];
    expect(row.conformance).toBe('Not Evaluated');
    expect(row.remarks).toMatch(/was not evaluated/i);
  });

  it('keeps the reviewer remarks and appends the honesty note', () => {
    const doc = buildAcr({
      meta: META,
      reconciled: [rc({ wcagId: '1.1.1', level: 'A', verdict: 'supports', source: 'machine', remarks: 'Alt text present.', needsHumanReview: true })],
    });
    expect(doc.tables.find(t => t.id === 'wcag-a')!.rows[0].remarks).toBe('Alt text present. Automated detection only — not confirmed by manual review.');
  });
});
