// Start GitHub OAuth via Supabase Auth. Redirects the browser to GitHub's
// consent screen; GitHub returns to /auth/callback.
import { NextResponse } from 'next/server';
import { supabaseServer } from '../../lib/auth.js';
import { env } from '../../lib/env.js';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${env.appBaseUrl()}/auth/callback`,
      // read:user to resolve identity; the App's installations are read with the
      // provider token against GET /user/installations.
      scopes: 'read:user',
    },
  });
  if (error || !data.url) {
    return NextResponse.json({ error: 'oauth_init_failed' }, { status: 500 });
  }
  return NextResponse.redirect(data.url);
}
