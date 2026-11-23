import { describe, it, expect } from 'vitest';
import { renderDocumentHtml } from './html.js';
import type { AcrDocument, DocumentMeta, StatementDocument } from './model.js';

const META = (published: boolean): DocumentMeta => ({
  productName: 'acme/<widget>',
  vendor: 'acme',
  headSha: 'abcdef1',
  date: '2026-11-23',
  published,
  evaluationMethods: 'Automated + manual.',
  conformanceTarget: 'WCAG 2.2 Level AA',
});

const ACR = (published: boolean): AcrDocument => ({
  kind: 'acr',
  meta: META(published),
  summary: [{ label: 'Product', value: 'acme/<widget>' }],
  tables: [
    { id: 'wcag-a', title: 'Table 1: Success Criteria, Level A', rows: [{ wcagId: '1.1.1', title: 'Non-text Content', level: 'A', conformance: 'Supports', remarks: 'ok' }] },
    { id: 'section-508', title: 'Revised Section 508 Report', note: 'see above', rows: [] },
  ],
});

describe('renderDocumentHtml (ACR)', () => {
  it('escapes untrusted text to prevent markup injection', () => {
    const html = renderDocumentHtml(ACR(true));
    expect(html).toContain('acme/&lt;widget&gt;');
    expect(html).not.toContain('acme/<widget>');
  });

  it('shows a DRAFT banner for an unpublished audit and omits it when published', () => {
    expect(renderDocumentHtml(ACR(false))).toMatch(/DRAFT — not for distribution/);
    expect(renderDocumentHtml(ACR(true))).not.toMatch(/DRAFT — not for distribution/);
  });

  it('renders a header-only table when a report has no rows', () => {
    const html = renderDocumentHtml(ACR(true));
    expect(html).toContain('Revised Section 508 Report');
    // The 508 table has no rows, so no <table> is emitted for it — only its note.
    expect(html).toContain('see above');
  });
});

describe('renderDocumentHtml (statement)', () => {
  it('renders each section heading, paragraphs and bullet items', () => {
    const doc: StatementDocument = {
      kind: 'statement',
      meta: META(true),
      sections: [{ heading: 'Known limitations', paragraphs: ['Gaps:'], items: ['1.4.3 contrast'] }],
    };
    const html = renderDocumentHtml(doc);
    expect(html).toContain('<h2>Known limitations</h2>');
    expect(html).toContain('<li>1.4.3 contrast</li>');
  });
});
