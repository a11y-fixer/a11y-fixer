import { describe, it, expect } from 'vitest';
import { renderDocumentHtml } from './html.js';
import type {
  AcrDocument,
  ConformanceLetterDocument,
  DocumentMeta,
  RemediationRoadmapDocument,
  StatementDocument,
} from './model.js';

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

describe('renderDocumentHtml (roadmap)', () => {
  it('renders the intro and a table per group, escaping untrusted text', () => {
    const doc: RemediationRoadmapDocument = {
      kind: 'roadmap',
      meta: META(true),
      intro: 'Work for acme/<widget>',
      groups: [
        {
          id: 'failures',
          heading: 'Confirmed failures to remediate',
          note: 'Fix these.',
          items: [{ wcagId: '1.4.3', title: 'Contrast <x>', level: 'AA', status: 'Does Not Support', remark: 'low' }],
        },
      ],
    };
    const html = renderDocumentHtml(doc);
    expect(html).toContain('<h2>Confirmed failures to remediate</h2>');
    expect(html).toContain('Does Not Support');
    expect(html).toContain('Contrast &lt;x&gt;');
    expect(html).toContain('Work for acme/&lt;widget&gt;');
  });
});

describe('renderDocumentHtml (letter)', () => {
  it('renders attestation paragraphs and the signature block', () => {
    const doc: ConformanceLetterDocument = {
      kind: 'letter',
      meta: META(true),
      paragraphs: ['To whom it may concern,', 'We attest that it conforms.'],
      signature: ['acme', '2026-11-23'],
    };
    const html = renderDocumentHtml(doc);
    expect(html).toContain('We attest that it conforms.');
    expect(html).toContain('<div class="signature">');
    expect(html).toContain('<div>acme</div>');
  });
});
