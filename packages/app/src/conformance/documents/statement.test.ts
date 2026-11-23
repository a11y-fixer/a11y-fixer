import { describe, it, expect } from 'vitest';
import type { ReconciledCriterion } from '../reconcile.js';
import { buildStatement } from './statement.js';
import type { DocumentMeta } from './model.js';

function rc(p: Partial<ReconciledCriterion> & Pick<ReconciledCriterion, 'wcagId' | 'verdict' | 'source'>): ReconciledCriterion {
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

function section(doc: ReturnType<typeof buildStatement>, heading: string) {
  return doc.sections.find(s => s.heading === heading);
}

describe('buildStatement', () => {
  it('claims full conformance only when every criterion supports and is reviewed', () => {
    const doc = buildStatement({
      meta: META,
      feedbackContact: 'a@b.test',
      reconciled: [
        rc({ wcagId: '1.1.1', verdict: 'supports', source: 'human' }),
        rc({ wcagId: '1.4.3', verdict: 'not_applicable', source: 'human' }),
      ],
    });
    expect(section(doc, 'Conformance status')!.paragraphs.join(' ')).toMatch(/fully conforms/i);
    expect(section(doc, 'Known limitations')).toBeUndefined();
  });

  it('says partially conformant and lists failures with their remarks', () => {
    const doc = buildStatement({
      meta: META,
      feedbackContact: 'a@b.test',
      reconciled: [
        rc({ wcagId: '1.4.3', verdict: 'does_not_support', source: 'human', remarks: 'Low contrast buttons.' }),
      ],
    });
    expect(section(doc, 'Conformance status')!.paragraphs.join(' ')).toMatch(/partially conforms/i);
    const limits = section(doc, 'Known limitations')!;
    expect(limits.items).toEqual(['1.4.3 Criterion 1.4.3 (Does Not Support) — Low contrast buttons.']);
  });

  it('treats an unreviewed machine verdict as partially conformant and flags criteria pending review', () => {
    const doc = buildStatement({
      meta: META,
      feedbackContact: 'a@b.test',
      reconciled: [rc({ wcagId: '1.1.1', verdict: 'supports', source: 'machine', needsHumanReview: true })],
    });
    expect(section(doc, 'Conformance status')!.paragraphs.join(' ')).toMatch(/partially conforms/i);
    expect(section(doc, 'Criteria pending review')).toBeDefined();
  });

  it('reports not_evaluated criteria as "not evaluated", never as "checked automatically"', () => {
    const doc = buildStatement({
      meta: META,
      feedbackContact: 'a@b.test',
      // No-winner reconcile: nothing (machine or human) evaluated it.
      reconciled: [rc({ wcagId: '1.2.1', verdict: 'not_evaluated', source: 'machine', needsHumanReview: true })],
    });
    const notEval = section(doc, 'Criteria not evaluated');
    expect(notEval).toBeDefined();
    expect(notEval!.paragraphs.join(' ')).toMatch(/have not been evaluated/i);
    // Must NOT be rolled into the "checked automatically" pending-review sentence.
    expect(section(doc, 'Criteria pending review')).toBeUndefined();
    const allText = doc.sections.flatMap(s => s.paragraphs).join(' ');
    expect(allText).not.toMatch(/checked automatically/i);
  });

  it('keeps machine-checked (supports) criteria separate from not-evaluated ones', () => {
    const doc = buildStatement({
      meta: META,
      feedbackContact: 'a@b.test',
      reconciled: [
        rc({ wcagId: '1.1.1', verdict: 'supports', source: 'machine', needsHumanReview: true }),
        rc({ wcagId: '1.2.1', verdict: 'not_evaluated', source: 'machine', needsHumanReview: true }),
      ],
    });
    expect(section(doc, 'Criteria pending review')!.paragraphs.join(' ')).toMatch(/passed automated checks/i);
    expect(section(doc, 'Criteria not evaluated')!.paragraphs.join(' ')).toMatch(/have not been evaluated/i);
  });

  it('always includes assessment approach and feedback sections', () => {
    const doc = buildStatement({
      meta: META,
      feedbackContact: 'mailto:a@b.test',
      reconciled: [rc({ wcagId: '1.1.1', verdict: 'supports', source: 'human' })],
    });
    expect(section(doc, 'Assessment approach')!.paragraphs.join(' ')).toContain(META.headSha);
    expect(section(doc, 'Feedback')!.items).toContain('mailto:a@b.test');
  });
});
