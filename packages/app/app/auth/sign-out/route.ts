import { NextResponse } from 'next/server';
import { supabaseServer } from '../../lib/auth.js';
import { env } from '../../lib/env.js';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${env.appBaseUrl()}/dashboard`);
}
