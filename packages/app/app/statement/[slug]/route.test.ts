// Tests for the public, unauthenticated permalink route shell: the query
// allow-list (400), unknown-slug 404, the HTML success response (inline,
// cacheable) and the PdfUnavailableError -> 501 fallback. The route has NO auth
// by design — possession of the slug is the grant — so the only gate is the slug
// lookup. documentFilename + FORMAT_META run for real; the store, the snapshot
// composition and the renderers are mocked.
//
// Value: protects=the public route's slug gate (unknown -> 404, never an
// existence oracle), the doc/format allow-list, the cacheable inline HTML
// response, and the lazy-PDF 501 fallback; fails_when=the slug lookup, the
// allow-list, or the PdfUnavailableError catch is removed or inverted, or auth
// is accidentally required; why_new=the route is new on this branch; seam=none
// (PDF Chromium isolated in pdf.ts and mocked); no_claim=does not prove the
// builders or byte output (mocked) — covered by the document builder/renderer
// tests.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConformanceDocument } from '../../../src/conformance/documents/model.js';

const { getRevisionBySlug, buildDocumentFromRevision, renderDocumentHtml, renderDocumentDocx, htmlToPdf } =
  vi.hoisted(() => ({
    getRevisionBySlug: vi.fn(),
    buildDocumentFromRevision: vi.fn(),
    renderDocumentHtml: vi.fn(),
    renderDocumentDocx: vi.fn(),
    htmlToPdf: vi.fn(),
  }));

class PdfUnavailableError extends Error {
  constructor(cause: string) {
    super(cause);
    this.name = 'PdfUnavailableError';
  }
}

vi.mock('../../lib/supabase.js', () => ({ serviceRoleStore: () => ({ getRevisionBySlug }) }));
vi.mock('../../../src/conformance/documents/audit-document.js', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../src/conformance/documents/audit-document.js')>()),
  buildDocumentFromRevision,
}));
vi.mock('../../../src/conformance/documents/html.js', () => ({ renderDocumentHtml }));
vi.mock('../../../src/conformance/documents/docx.js', () => ({ renderDocumentDocx }));
vi.mock('../../../src/conformance/documents/pdf.js', () => ({ htmlToPdf, PdfUnavailableError }));

import { GET } from './route.js';

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

const DOC: ConformanceDocument = {
  kind: 'statement',
  meta: {
    productName: 'owner/repo',
    vendor: 'owner',
    headSha: 'abc1234def5678',
    date: '2026-01-01',
    published: true,
    evaluationMethods: 'methods',
    conformanceTarget: 'WCAG 2.2 Level AA',
  },
  sections: [],
};

function getRequest(slug = 'the-slug', query = ''): Request {
  const qs = query ? `?${query}` : '';
  return new Request(`https://app.example.com/statement/${slug}${qs}`);
}

describe('GET /statement/[slug]', () => {
  beforeEach(() => {
    getRevisionBySlug.mockResolvedValue({ id: 'r1', publicSlug: 'the-slug', snapshot: {} });
    buildDocumentFromRevision.mockReturnValue(DOC);
    renderDocumentHtml.mockReturnValue('<!doctype html><title>statement</title>');
    renderDocumentDocx.mockResolvedValue(Buffer.from('docx-bytes'));
    htmlToPdf.mockRejectedValue(new PdfUnavailableError('no Chromium'));
  });
  afterEach(() => vi.clearAllMocks());

  it('returns 400 for a doc/format outside the allow-list, before any lookup', async () => {
    const res = await GET(getRequest('the-slug', 'format=bogus'), params('the-slug'));
    expect(res.status).toBe(400);
    expect(getRevisionBySlug).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown slug and renders nothing', async () => {
    getRevisionBySlug.mockResolvedValue(null);
    const res = await GET(getRequest('nope'), params('nope'));
    expect(res.status).toBe(404);
    expect(buildDocumentFromRevision).not.toHaveBeenCalled();
    expect(renderDocumentHtml).not.toHaveBeenCalled();
  });

  it('defaults to the statement and serves cacheable inline HTML on a hit', async () => {
    const res = await GET(getRequest(), params('the-slug'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.headers.get('content-disposition')).toBe('inline; filename="statement-owner-repo-abc1234.html"');
    expect(res.headers.get('cache-control')).toBe('public, max-age=3600');
    // Default doc kind is 'statement'.
    expect(buildDocumentFromRevision).toHaveBeenCalledWith(expect.anything(), 'statement');
    expect(await res.text()).toBe('<!doctype html><title>statement</title>');
  });

  it('returns 501 (not a crash) when the PDF browser is unavailable', async () => {
    const res = await GET(getRequest('the-slug', 'format=pdf'), params('the-slug'));
    expect(res.status).toBe(501);
  });

  // Value: protects=the docx branch of the public permalink — a .docx download is
  // served as a binary attachment (not inline), with the right content-type and
  // the same immutable cache header; fails_when=the docx body is not awaited, is
  // served inline instead of as an attachment, or the renderer is skipped;
  // why_new=the html/pdf branches are covered but the docx branch is not;
  // seam=renderDocumentDocx mocked (docx packing proven in docx.test.ts).
  it('serves docx as a binary attachment with the cacheable header', async () => {
    const res = await GET(getRequest('the-slug', 'format=docx'), params('the-slug'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(res.headers.get('content-disposition')).toBe(
      'attachment; filename="statement-owner-repo-abc1234.docx"',
    );
    expect(res.headers.get('cache-control')).toBe('public, max-age=3600');
    expect(renderDocumentDocx).toHaveBeenCalled();
    expect(Buffer.from(await res.arrayBuffer()).toString()).toBe('docx-bytes');
  });
});
