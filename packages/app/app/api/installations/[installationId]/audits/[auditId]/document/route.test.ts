// Tests for the document route shell: the security + dispatch wiring above the
// store-backed buildAuditDocument composition and the pure renderers (query
// allow-list 400, auth 401, 404-not-403 enumeration defense, HTML inline
// success, and the PdfUnavailableError -> 501 fallback). Mirrors
// ../verdict/route.test.ts and ../publish/route.test.ts: the pure guard
// (authorizeInstallationView) and documentFilename run for real; only the
// auth/store/composition/renderer boundaries are mocked.
//
// Value: protects=the document route's validation order (400 before auth),
// auth 401, cross-tenant/visibility 404, the html inline Content-Disposition +
// Content-Type success response, and the lazy-PDF 501 fallback; fails_when=the
// query allow-list, the sign-in gate, the authorizeInstallationView 404, the
// inline-vs-attachment disposition, the filename, or the PdfUnavailableError
// catch is removed or inverted; why_new=the route is new on this branch and had
// no shell test; seam=none (PDF browser launch is isolated in pdf.ts and mocked
// here, as its real Chromium cannot run in CI); no_claim=does not prove the
// VPAT/statement builders, the HTML/DOCX byte output, or buildAuditDocument's
// null-composition logic (mocked) — those are covered by vpat/statement/html/
// docx/audit-document .test.ts.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConformanceDocument } from '../../../../../../../src/conformance/documents/model.js';

const { getSignedInUser, listInstallationsForUser, buildAuditDocument, renderDocumentHtml, renderDocumentDocx, htmlToPdf } =
  vi.hoisted(() => ({
    getSignedInUser: vi.fn(),
    listInstallationsForUser: vi.fn(),
    buildAuditDocument: vi.fn(),
    renderDocumentHtml: vi.fn(),
    renderDocumentDocx: vi.fn(),
    htmlToPdf: vi.fn(),
  }));

// A PdfUnavailableError whose identity the route's `instanceof` check (against
// the same mocked module) will recognise.
class PdfUnavailableError extends Error {
  constructor(cause: string) {
    super(cause);
    this.name = 'PdfUnavailableError';
  }
}

vi.mock('../../../../../../lib/auth.js', () => ({ getSignedInUser }));
vi.mock('../../../../../../lib/supabase.js', () => ({
  serviceRoleStore: () => ({ listInstallationsForUser }),
}));
// Keep documentFilename + FORMAT_META real (they shape the response headers we
// assert); only the store-backed composition is mocked.
vi.mock('../../../../../../../src/conformance/documents/audit-document.js', async importOriginal => ({
  ...(await importOriginal<typeof import('../../../../../../../src/conformance/documents/audit-document.js')>()),
  buildAuditDocument,
}));
vi.mock('../../../../../../../src/conformance/documents/html.js', () => ({ renderDocumentHtml }));
vi.mock('../../../../../../../src/conformance/documents/docx.js', () => ({ renderDocumentDocx }));
vi.mock('../../../../../../../src/conformance/documents/pdf.js', () => ({ htmlToPdf, PdfUnavailableError }));

import { GET } from './route.js';

const params = (installationId: string, auditId: string) => ({
  params: Promise.resolve({ installationId, auditId }),
});

const DOC: ConformanceDocument = {
  kind: 'acr',
  meta: {
    productName: 'owner/repo',
    vendor: 'owner',
    headSha: 'abc1234def5678',
    date: '2026-01-01',
    published: true,
    evaluationMethods: 'methods',
    conformanceTarget: 'WCAG 2.2 Level AA',
  },
  summary: [],
  tables: [],
};

function getRequest(query = 'doc=acr&format=html'): Request {
  return new Request(`https://app.example.com/api/installations/42/audits/a1/document?${query}`);
}

describe('GET /api/installations/[installationId]/audits/[auditId]/document', () => {
  beforeEach(() => {
    getSignedInUser.mockResolvedValue({ id: 'user-1' });
    listInstallationsForUser.mockResolvedValue([42]);
    buildAuditDocument.mockResolvedValue(DOC);
    renderDocumentHtml.mockReturnValue('<!doctype html><title>doc</title>');
    renderDocumentDocx.mockResolvedValue(Buffer.from('docx-bytes'));
    htmlToPdf.mockRejectedValue(new PdfUnavailableError('no Chromium'));
  });
  afterEach(() => vi.clearAllMocks());

  it('returns 400 for a doc/format outside the allow-list, before touching auth', async () => {
    const res = await GET(getRequest('doc=acr&format=bogus'), params('42', 'a1'));
    expect(res.status).toBe(400);
    expect(getSignedInUser).not.toHaveBeenCalled();
  });

  it('returns 401 when the user is not signed in', async () => {
    getSignedInUser.mockResolvedValue(null);
    const res = await GET(getRequest(), params('42', 'a1'));
    expect(res.status).toBe(401);
    expect(buildAuditDocument).not.toHaveBeenCalled();
  });

  it('returns 404 (not 403) when the user may not view the installation', async () => {
    listInstallationsForUser.mockResolvedValue([99]); // 42 not visible
    const res = await GET(getRequest(), params('42', 'a1'));
    expect(res.status).toBe(404);
    expect(buildAuditDocument).not.toHaveBeenCalled();
  });

  it('renders HTML inline with a 200, text/html, and a derived download filename', async () => {
    const res = await GET(getRequest(), params('42', 'a1'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(res.headers.get('content-disposition')).toBe('inline; filename="acr-owner-repo-abc1234.html"');
    expect(await res.text()).toBe('<!doctype html><title>doc</title>');
  });

  it('returns 501 (not a crash) when the PDF browser is unavailable', async () => {
    const res = await GET(getRequest('doc=acr&format=pdf'), params('42', 'a1'));
    expect(res.status).toBe(501);
  });

  it('returns 404 when the audit does not resolve to a document (unknown / wrong installation)', async () => {
    buildAuditDocument.mockResolvedValue(null);
    const res = await GET(getRequest(), params('42', 'a1'));
    expect(res.status).toBe(404);
    expect(renderDocumentHtml).not.toHaveBeenCalled();
  });

  it('serves DOCX as an attachment with the officedocument content-type and a .docx filename', async () => {
    const res = await GET(getRequest('doc=acr&format=docx'), params('42', 'a1'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(res.headers.get('content-disposition')).toBe('attachment; filename="acr-owner-repo-abc1234.docx"');
    expect(Buffer.from(await res.arrayBuffer()).toString()).toBe('docx-bytes');
  });
});
