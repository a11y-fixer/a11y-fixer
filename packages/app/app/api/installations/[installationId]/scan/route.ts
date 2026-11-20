// Trigger a scan for an installation (or specific repos) — the app's first
// mutation route. POST only, same-origin guarded, viewer-authorized, then the
// unit-tested `dispatchInstallationScan` core does the GitHub work. The
// installation token lives only inside that call; it never reaches this shell.
import { NextResponse } from 'next/server';
import { getSignedInUser } from '../../../../lib/auth.js';
import { serviceRoleStore } from '../../../../lib/supabase.js';
import { env } from '../../../../lib/env.js';
import { isSameOrigin } from '../../../../../src/http/same-origin.js';
import { authorizeInstallationView } from '../../../../../src/auth/installations.js';
import { dispatchInstallationScan } from '../../../../../src/github/scan-orchestrator.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ installationId: string }> },
): Promise<Response> {
  const { installationId } = await params;
  const id = Number(installationId);
  if (!Number.isInteger(id)) return new NextResponse('Not found', { status: 404 });

  // CSRF guard: a cross-site form POST still carries SameSite=Lax session
  // cookies, so require a same-origin request before mutating anything.
  if (!isSameOrigin(req.headers.get('origin'), env.appBaseUrl())) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const user = await getSignedInUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const store = serviceRoleStore();
  const viewableIds = await store.listInstallationsForUser(user.id);
  // 404 (not 403) so a crafted id can't confirm an installation exists.
  if (!authorizeInstallationView(viewableIds, id)) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Optional per-repo scope: repeated `repoId` form fields. Absent = whole
  // installation (all selected repos).
  const form = await req.formData();
  const repoIds = form
    .getAll('repoId')
    .map(v => Number(v))
    .filter(n => Number.isInteger(n));

  const summary = await dispatchInstallationScan({
    appId: env.githubAppId(),
    privateKey: env.githubAppPrivateKey(),
    installationId: id,
    store,
    repoIds: repoIds.length > 0 ? repoIds : undefined,
    fetchImpl: fetch,
  });

  const scan = `${summary.dispatched}/${summary.requested}`;
  return NextResponse.redirect(`${env.appBaseUrl()}/dashboard/${id}?scan=${scan}`, { status: 303 });
}
