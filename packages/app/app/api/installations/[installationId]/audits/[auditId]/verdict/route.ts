// Record a human reviewer's verdict for one success criterion in an audit.
// POST only, same-origin guarded, viewer-authorized, audit-ownership checked.
import { NextResponse } from 'next/server';
import { isKnownCriterion } from '@a11y-fixer/core';
import { getSignedInUser } from '../../../../../../lib/auth.js';
import { serviceRoleStore } from '../../../../../../lib/supabase.js';
import { env } from '../../../../../../lib/env.js';
import { isSameOrigin } from '../../../../../../../src/http/same-origin.js';
import { authorizeInstallationView } from '../../../../../../../src/auth/installations.js';
import { auditBelongsTo } from '../../../../../../../src/conformance/audit-authz.js';
import { recordHumanVerdict, type AuditDeps } from '../../../../../../../src/conformance/audit-service.js';
import { SELECTABLE_VERDICTS } from '../../../../../../../src/conformance/view-model.js';
import type { VerdictValue } from '../../../../../../../src/db/store.js';

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

  // The audit must belong to this installation (defense in depth over RLS).
  const audit = await store.getAudit(auditId);
  if (!auditBelongsTo(audit, id)) return new NextResponse('Not found', { status: 404 });

  // A published audit is a finalized conformance record — read-only.
  if (audit.status === 'published') return new NextResponse('Audit is published', { status: 409 });

  const form = await req.formData();
  const wcagId = String(form.get('wcagId') ?? '');
  const verdict = String(form.get('verdict') ?? '');
  const remarks = String(form.get('remarks') ?? '');
  // wcagId must name a real catalog criterion, else the row is an orphan reconcile
  // silently ignores. verdict must be one the reviewer is allowed to pick.
  if (!isKnownCriterion(wcagId) || !SELECTABLE_VERDICTS.includes(verdict as VerdictValue)) {
    return new NextResponse('Bad request', { status: 400 });
  }

  await recordHumanVerdict(
    store,
    { auditId, wcagId, verdict: verdict as VerdictValue, remarks, authorId: user.id },
    deps,
  );

  return NextResponse.redirect(
    `${env.appBaseUrl()}/dashboard/${id}/audits/${auditId}#sc-${wcagId.replace(/\./g, '')}`,
    { status: 303 },
  );
}
