// OAuth return: exchange the code for a Supabase session, then reconcile the
// user's GitHub identity + visible installations into our tables. The pure
// GitHub calls live in src/auth/installations.ts (unit-tested); this shell wires
// them to the session and the service-role Store.
import { NextResponse } from 'next/server';
import { supabaseServer } from '../../lib/auth.js';
import { serviceRoleStore } from '../../lib/supabase.js';
import { env } from '../../lib/env.js';
import { fetchUserInstallationIds, fetchViewer } from '../../../src/auth/installations.js';

export const dynamic = 'force-dynamic';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect(`${env.appBaseUrl()}/dashboard?error=missing_code`);

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(`${env.appBaseUrl()}/dashboard?error=auth_failed`);
  }

  const token = data.session?.provider_token;
  if (token) {
    const store = serviceRoleStore();
    const viewer = await fetchViewer(token, fetch);
    await store.upsertUser({ userId: data.user.id, ...viewer });
    const installationIds = await fetchUserInstallationIds(token, fetch);
    for (const id of installationIds) {
      // An installation GitHub reports may not be in our `installations` table
      // yet (the `installation` webhook can arrive after this sign-in). Skip it
      // rather than fail the whole login on the FK violation — the link is
      // reconciled on the next sign-in once the webhook has landed.
      try {
        await store.linkUserInstallation(data.user.id, id);
      } catch {
        // not-yet-synced installation; ignore.
      }
    }
  }

  return NextResponse.redirect(`${env.appBaseUrl()}/dashboard`);
}
