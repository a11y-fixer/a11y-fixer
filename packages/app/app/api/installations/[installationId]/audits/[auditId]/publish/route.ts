// Publish a conformance audit — gated on the honesty rule: refuses while any
// criterion is claimed Supports on machine evidence alone (publishAudit returns
// the blockers). POST only, same-origin guarded, viewer-authorized.
import { NextResponse } from 'next/server';
import { SUCCESS_CRITERIA } from '@a11y-fixer/core/wcag';
import { getSignedInUser } from '../../../../../../lib/auth.js';
import { serviceRoleStore } from '../../../../../../lib/supabase.js';
import { env } from '../../../../../../lib/env.js';
import { isSameOrigin } from '../../../../../../../src/http/same-origin.js';
import { authorizeInstallationView } from '../../../../../../../src/auth/installations.js';
import { auditBelongsTo } from '../../../../../../../src/conformance/audit-authz.js';
import { publishAudit, type AuditDeps } from '../../../../../../../src/conformance/audit-service.js';
import { createRevisionForAudit, type RevisionDeps } from '../../../../../../../src/conformance/documents/audit-document.js';
import { conformanceSigningConfigFromEnv } from '../../../../../../../src/conformance/keyring.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const deps: AuditDeps = { now: () => new Date().toISOString(), newId: () => crypto.randomUUID() };
// An unguessable (128-bit) URL-safe capability token for the public permalink.
const revisionDeps: RevisionDeps = {
  now: () => new Date().toISOString(),
  newId: () => crypto.randomUUID(),
  newSlug: () => crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''),
};

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
  // On a successful publish, freeze an immutable revision (the public permalink's
  // frozen snapshot). Idempotent, so a re-published audit does not duplicate it.
  // The publish has already committed, so a revision-write failure must NOT turn a
  // successful publish into a 500: swallow it and let a later publish recreate the
  // revision (buildAuditDocument falls back to a live render until then).
  if (result.published) {
    try {
      // Signing config is optional: when CONFORMANCE_SIGNING_KEY isn't provisioned
      // the revision freezes without backing claims (publish still succeeds).
      const rev = await createRevisionForAudit(
        store,
        SUCCESS_CRITERIA,
        auditId,
        revisionDeps,
        conformanceSigningConfigFromEnv(),
      );
      // null = retries exhausted or the audit vanished mid-publish: the audit is
      // published without a public link. The dashboard shows a "retry public link"
      // control (re-POST is idempotent and recreates it), so log for visibility.
      if (!rev) console.error(`publish: no revision snapshot created for audit ${auditId}`);
    } catch (err) {
      console.error(`publish: revision snapshot failed for audit ${auditId}`, err);
    }
  }
  const base = `${env.appBaseUrl()}/dashboard/${id}/audits/${auditId}`;
  const query = result.published ? '?published=1' : `?blocked=${result.blockers.length}`;
  return NextResponse.redirect(`${base}${query}`, { status: 303 });
}
