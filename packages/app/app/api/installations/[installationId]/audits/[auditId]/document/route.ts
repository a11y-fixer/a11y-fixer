// Render a conformance document (ACR/VPAT or accessibility statement) for an
// audit, in HTML, PDF, or DOCX. GET only (read-only, so no CSRF guard needed),
// viewer-authorized, audit-ownership checked. Drafts render with a visible
// "not for distribution" watermark rather than being withheld.
import { NextResponse } from 'next/server';
import { SUCCESS_CRITERIA } from '@a11y-fixer/core/wcag';
import { getSignedInUser } from '../../../../../../lib/auth.js';
import { serviceRoleStore } from '../../../../../../lib/supabase.js';
import { authorizeInstallationView } from '../../../../../../../src/auth/installations.js';
import {
  buildAuditDocument,
  documentFilename,
  FORMAT_META,
} from '../../../../../../../src/conformance/documents/audit-document.js';
import { renderDocumentHtml } from '../../../../../../../src/conformance/documents/html.js';
import { renderDocumentDocx } from '../../../../../../../src/conformance/documents/docx.js';
import type { DocumentFormat, DocumentKind } from '../../../../../../../src/conformance/documents/model.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const KINDS: readonly DocumentKind[] = ['acr', 'statement'];
const FORMATS: readonly DocumentFormat[] = ['html', 'pdf', 'docx'];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ installationId: string; auditId: string }> },
): Promise<Response> {
  const { installationId, auditId } = await params;
  const id = Number(installationId);
  if (!Number.isInteger(id)) return new NextResponse('Not found', { status: 404 });

  const url = new URL(req.url);
  const kind = (url.searchParams.get('doc') ?? 'acr') as DocumentKind;
  const format = (url.searchParams.get('format') ?? 'html') as DocumentFormat;
  if (!KINDS.includes(kind) || !FORMATS.includes(format)) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const user = await getSignedInUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const store = serviceRoleStore();
  const viewableIds = await store.listInstallationsForUser(user.id);
  if (!authorizeInstallationView(viewableIds, id)) return new NextResponse('Not found', { status: 404 });

  const doc = await buildAuditDocument(store, SUCCESS_CRITERIA, { installationId: id, auditId, kind });
  if (!doc) return new NextResponse('Not found', { status: 404 });

  const { contentType } = FORMAT_META[format];
  const filename = documentFilename(doc, format);

  if (format === 'html') {
    // Inline so the browser displays it; it is also the source for the PDF.
    return new NextResponse(renderDocumentHtml(doc), {
      status: 200,
      headers: { 'content-type': contentType, 'content-disposition': `inline; filename="${filename}"` },
    });
  }

  let body: Buffer;
  if (format === 'docx') {
    body = await renderDocumentDocx(doc);
  } else {
    // PDF deps are loaded lazily (serverExternalPackages); a missing browser
    // becomes a clean 501 rather than a crashed route.
    const { htmlToPdf, PdfUnavailableError } = await import('../../../../../../../src/conformance/documents/pdf.js');
    try {
      body = await htmlToPdf(renderDocumentHtml(doc));
    } catch (err) {
      if (err instanceof PdfUnavailableError) {
        return new NextResponse('PDF rendering is unavailable in this environment.', { status: 501 });
      }
      throw err;
    }
  }

  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: { 'content-type': contentType, 'content-disposition': `attachment; filename="${filename}"` },
  });
}
