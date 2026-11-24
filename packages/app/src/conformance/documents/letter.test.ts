import { describe, it, expect } from 'vitest';
import type { ReconciledCriterion } from '../reconcile.js';
import { buildLetter } from './letter.js';
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

describe('buildLetter', () => {
  it('attests conformance only when every criterion supports and is human-reviewed', () => {
    const doc = buildLetter({
      meta: META,
      reconciled: [
        rc({ wcagId: '1.1.1', verdict: 'supports', source: 'human' }),
        rc({ wcagId: '1.4.3', verdict: 'not_applicable', source: 'human' }),
      ],
    });
    const body = doc.paragraphs.join(' ');
    expect(body).toMatch(/we attest that .*conforms to/i);
    expect(body).not.toMatch(/partially conforms/i);
    expect(doc.signature).toEqual(['acme', '2026-11-23']);
  });

  it('never claims full conformance while a criterion fails', () => {
    const doc = buildLetter({
      meta: META,
      reconciled: [rc({ wcagId: '1.4.3', verdict: 'does_not_support', source: 'human' })],
    });
    const body = doc.paragraphs.join(' ');
    expect(body).toMatch(/partially conforms/i);
    expect(body).toMatch(/does not claim full conformance/i);
    expect(body).not.toMatch(/we attest that .*conforms to/i);
  });

  it('never claims full conformance on an unreviewed machine pass', () => {
    const doc = buildLetter({
      meta: META,
      reconciled: [rc({ wcagId: '1.1.1', verdict: 'supports', source: 'machine', needsHumanReview: true })],
    });
    expect(doc.paragraphs.join(' ')).toMatch(/partially conforms/i);
  });
});
