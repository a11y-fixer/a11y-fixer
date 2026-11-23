// Publish a conformance audit — gated on the honesty rule: refuses while any
// criterion is claimed Supports on machine evidence alone (publishAudit returns
// the blockers). POST only, same-origin guarded, viewer-authorized.
import { NextResponse } from 'next/server';
import { SUCCESS_CRITERIA } from '@a11y-fixer/core';
import { getSignedInUser } from '../../../../../../lib/auth.js';
import { serviceRoleStore } from '../../../../../../lib/supabase.js';
import { env } from '../../../../../../lib/env.js';
import { isSameOrigin } from '../../../../../../../src/http/same-origin.js';
import { authorizeInstallationView } from '../../../../../../../src/auth/installations.js';
import { auditBelongsTo } from '../../../../../../../src/conformance/audit-authz.js';
import { publishAudit, type AuditDeps } from '../../../../../../../src/conformance/audit-service.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const deps: AuditDeps = { now: () => new Date().toISOString(), newId: () => crypto.randomUUID() };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ installationId: string; auditId: string }> },
): Promise<Response> {
  const { installationId, auditId } = await params;
  const id = Number(installationId);
  if (!Number.isInteger(id)) return new NextResponse('Not found', { status: 404 });

  if (!isSameOrigin(req.headers.get('origin'), env.appBaseUrl())) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const user = await getSignedInUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const store = serviceRoleStore();
  const viewableIds = await store.listInstallationsForUser(user.id);
  if (!authorizeInstallationView(viewableIds, id)) {
    return new NextResponse('Not found', { status: 404 });
  }

  const audit = await store.getAudit(auditId);
  if (!auditBelongsTo(audit, id)) return new NextResponse('Not found', { status: 404 });

  const result = await publishAudit(store, SUCCESS_CRITERIA, auditId, deps);
  const base = `${env.appBaseUrl()}/dashboard/${id}/audits/${auditId}`;
  const query = result.published ? '?published=1' : `?blocked=${result.blockers.length}`;
  return NextResponse.redirect(`${base}${query}`, { status: 303 });
}
