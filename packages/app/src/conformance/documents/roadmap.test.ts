import { describe, it, expect } from 'vitest';
import type { ReconciledCriterion } from '../reconcile.js';
import { buildRoadmap } from './roadmap.js';
import type { DocumentMeta } from './model.js';

function rc(
  p: Partial<ReconciledCriterion> & Pick<ReconciledCriterion, 'wcagId' | 'verdict' | 'source'>,
): ReconciledCriterion {
  return {
    title: `Criterion ${p.wcagId}`,
    level: 'A',
    remarks: '',
    evidence: null,
    needsHumanReview: p.source === 'machine',
    ...p,
  };
}

const META: DocumentMeta = {
  productName: 'acme/widget',
  vendor: 'acme',
  headSha: 'abcdef1',
  date: '2026-11-23',
  published: true,
  evaluationMethods: 'Automated + manual.',
  conformanceTarget: 'WCAG 2.2 Level AA',
};

const group = (doc: ReturnType<typeof buildRoadmap>, id: string) => doc.groups.find(g => g.id === id);

describe('buildRoadmap', () => {
  it('lists confirmed failures with their verdict label and remark', () => {
    const doc = buildRoadmap({
      meta: META,
      reconciled: [
        rc({ wcagId: '1.4.3', verdict: 'does_not_support', source: 'human', remarks: 'Low contrast.' }),
        rc({ wcagId: '2.1.1', verdict: 'partially_supports', source: 'human' }),
      ],
    });
    const failures = group(doc, 'failures')!;
    expect(failures.items.map(i => i.wcagId)).toEqual(['1.4.3', '2.1.1']);
    expect(failures.items[0]).toMatchObject({ status: 'Does Not Support', remark: 'Low contrast.' });
    expect(failures.items[1].status).toBe('Partially Supports');
  });

  it('separates machine-only passes (pending review) from failures and never marks them done', () => {
    const doc = buildRoadmap({
      meta: META,
      reconciled: [rc({ wcagId: '1.1.1', verdict: 'supports', source: 'machine', needsHumanReview: true })],
    });
    expect(group(doc, 'failures')).toBeUndefined();
    const pending = group(doc, 'pending-review')!;
    expect(pending.items).toHaveLength(1);
    expect(pending.items[0].status).toBe('Pending review');
  });

  it('reports not_evaluated criteria as "Not evaluated", never passing', () => {
    const doc = buildRoadmap({
      meta: META,
      reconciled: [rc({ wcagId: '1.2.1', verdict: 'not_evaluated', source: 'machine', needsHumanReview: true })],
    });
    expect(group(doc, 'pending-review')).toBeUndefined();
    const notEval = group(doc, 'not-evaluated')!;
    expect(notEval.items[0].status).toBe('Not evaluated');
  });

  it('produces an empty roadmap that says so when nothing is outstanding', () => {
    const doc = buildRoadmap({
      meta: META,
      reconciled: [
        rc({ wcagId: '1.1.1', verdict: 'supports', source: 'human' }),
        rc({ wcagId: '1.4.3', verdict: 'not_applicable', source: 'human' }),
      ],
    });
    expect(doc.groups).toHaveLength(0);
    expect(doc.intro).toMatch(/no outstanding/i);
  });
});
