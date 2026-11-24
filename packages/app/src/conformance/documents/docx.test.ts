import { describe, it, expect } from 'vitest';
import { renderDocumentDocx } from './docx.js';
import type {
  AcrDocument,
  ConformanceLetterDocument,
  DocumentMeta,
  RemediationRoadmapDocument,
  StatementDocument,
} from './model.js';

const META: DocumentMeta = {
  productName: 'acme/widget',
  vendor: 'acme',
  headSha: 'abcdef1',
  date: '2026-11-23',
  published: true,
  evaluationMethods: 'Automated + manual.',
  conformanceTarget: 'WCAG 2.2 Level AA',
};

describe('renderDocumentDocx', () => {
  it('packs an ACR to a non-empty .docx (zip) buffer', async () => {
    const doc: AcrDocument = {
      kind: 'acr',
      meta: META,
      summary: [{ label: 'Product', value: 'acme/widget' }],
      tables: [{ id: 'wcag-a', title: 'Table 1', rows: [{ wcagId: '1.1.1', title: 'Non-text Content', level: 'A', conformance: 'Supports', remarks: 'ok' }] }],
    };
    const buf = await renderDocumentDocx(doc);
    expect(buf.length).toBeGreaterThan(0);
    // .docx is a zip; it starts with the PK signature.
    expect(buf.subarray(0, 2).toString('latin1')).toBe('PK');
  });

  it('packs a statement to a .docx buffer', async () => {
    const doc: StatementDocument = {
      kind: 'statement',
      meta: META,
      sections: [{ heading: 'Conformance status', paragraphs: ['Partially conformant.'], items: ['1.4.3 contrast'] }],
    };
    const buf = await renderDocumentDocx(doc);
    expect(buf.subarray(0, 2).toString('latin1')).toBe('PK');
  });

  it('packs a roadmap to a .docx buffer', async () => {
    const doc: RemediationRoadmapDocument = {
      kind: 'roadmap',
      meta: META,
      intro: 'Outstanding work.',
      groups: [{ id: 'failures', heading: 'Confirmed failures', note: 'Fix.', items: [{ wcagId: '1.4.3', title: 'Contrast', level: 'AA', status: 'Does Not Support', remark: 'low' }] }],
    };
    const buf = await renderDocumentDocx(doc);
    expect(buf.subarray(0, 2).toString('latin1')).toBe('PK');
  });

  it('packs a conformance letter to a .docx buffer', async () => {
    const doc: ConformanceLetterDocument = {
      kind: 'letter',
      meta: META,
      paragraphs: ['To whom it may concern,', 'We attest.'],
      signature: ['acme', '2026-11-23'],
    };
    const buf = await renderDocumentDocx(doc);
    expect(buf.subarray(0, 2).toString('latin1')).toBe('PK');
  });
});
