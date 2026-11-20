import { NextResponse } from 'next/server';
import { supabaseServer } from '../../lib/auth.js';
import { env } from '../../lib/env.js';

export const dynamic = 'force-dynamic';

// Sign-out MUST be POST-only. A GET handler here is prefetched by Next.js (the
// dashboard's sign-out control) and crawled by bots, both of which would silently
// destroy the session the moment the dashboard renders.
export async function POST(): Promise<Response> {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${env.appBaseUrl()}/dashboard`, { status: 303 });
}
