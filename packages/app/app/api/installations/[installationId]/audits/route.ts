// Create a conformance audit (VPAT/ACR draft) for a repo's latest scan.
// POST only, same-origin guarded, viewer-authorized. Derives the machine draft
// (src/conformance) from the scan's violations crossed with the WCAG catalog.
import { NextResponse } from 'next/server';
import { SUCCESS_CRITERIA } from '@a11y-fixer/core';
import { getSignedInUser } from '../../../../lib/auth.js';
import { serviceRoleStore } from '../../../../lib/supabase.js';
import { env } from '../../../../lib/env.js';
import { isSameOrigin } from '../../../../../src/http/same-origin.js';
import { authorizeInstallationView } from '../../../../../src/auth/installations.js';
import { latestScanByRepo } from '../../../../../src/conformance/audit-authz.js';
import { createDraftAudit, type AuditDeps } from '../../../../../src/conformance/audit-service.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const deps: AuditDeps = { now: () => new Date().toISOString(), newId: () => crypto.randomUUID() };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ installationId: string }> },
): Promise<Response> {
  const { installationId } = await params;
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

  const form = await req.formData();
  const repoId = Number(form.get('repoId'));
  if (!Number.isInteger(repoId)) return new NextResponse('Bad request', { status: 400 });

  // Seed the audit from the repo's most recent scan. Without one there is no
  // evidence to draft from, so send the user back with an explanation.
  const scans = await store.listScansByInstallation(id);
  const scan = latestScanByRepo(scans).get(repoId);
  if (!scan) {
    return NextResponse.redirect(`${env.appBaseUrl()}/dashboard/${id}/audits?error=no-scan`, { status: 303 });
  }

  const audit = await createDraftAudit(
    store,
    SUCCESS_CRITERIA,
    { repoId, installationId: id, headSha: scan.headSha, checkRunId: scan.checkRunId },
    deps,
  );

  return NextResponse.redirect(`${env.appBaseUrl()}/dashboard/${id}/audits/${audit.id}`, { status: 303 });
}
