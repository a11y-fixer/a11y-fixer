import { describe, it, expect } from 'vitest';
import { renderDocumentDocx } from './docx.js';
import type { AcrDocument, StatementDocument, DocumentMeta } from './model.js';

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
});
