// Public, unauthenticated conformance-document permalink. A published audit's
// revision carries an unguessable `public_slug` (a capability token); anyone with
// the link can read the frozen, immutable document. There is no auth check by
// design — possession of the slug is the grant. Only published revisions have a
// slug, so every reachable document is one the vendor chose to publish. An
// unknown slug is a plain 404 (no existence oracle beyond the random token).
import { NextResponse } from 'next/server';
import { serviceRoleStore } from '../../lib/supabase.js';
import {
  buildDocumentFromRevision,
  documentFilename,
  FORMAT_META,
} from '../../../src/conformance/documents/audit-document.js';
import { renderDocumentHtml } from '../../../src/conformance/documents/html.js';
import { renderDocumentDocx } from '../../../src/conformance/documents/docx.js';
import type { DocumentFormat, DocumentKind } from '../../../src/conformance/documents/model.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const KINDS: readonly DocumentKind[] = ['acr', 'statement', 'roadmap', 'letter'];
const FORMATS: readonly DocumentFormat[] = ['html', 'pdf', 'docx'];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  const url = new URL(req.url);
  // The public link defaults to the accessibility statement (the public-facing
  // document); the ACR/roadmap/letter are reachable via the same permalink.
  const kind = (url.searchParams.get('doc') ?? 'statement') as DocumentKind;
  const format = (url.searchParams.get('format') ?? 'html') as DocumentFormat;
  if (!KINDS.includes(kind) || !FORMATS.includes(format)) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const store = serviceRoleStore();
  const revision = await store.getRevisionBySlug(slug);
  if (!revision) return new NextResponse('Not found', { status: 404 });

  const doc = buildDocumentFromRevision(revision, kind);
  const { contentType } = FORMAT_META[format];
  const filename = documentFilename(doc, format);
  // The revision is immutable, so the response is safely cacheable.
  const cacheControl = 'public, max-age=3600';

  if (format === 'html') {
    return new NextResponse(renderDocumentHtml(doc), {
      status: 200,
      headers: {
        'content-type': contentType,
        'content-disposition': `inline; filename="${filename}"`,
        'cache-control': cacheControl,
      },
    });
  }

  let body: Buffer;
  if (format === 'docx') {
    body = await renderDocumentDocx(doc);
  } else {
    const { htmlToPdf, PdfUnavailableError } = await import('../../../src/conformance/documents/pdf.js');
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
    headers: {
      'content-type': contentType,
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': cacheControl,
    },
  });
}
