// Refreshes the Supabase auth session on every matched request and writes the
// rotated auth cookies back to the response. This is required by @supabase/ssr:
// Server Components can read cookies but cannot write them, so without this
// middleware an expiring access token is never refreshed and nested navigations
// (e.g. /dashboard -> /dashboard/[installationId]) intermittently appear signed
// out. Keep createServerClient and getUser() adjacent — running other logic
// between them risks random sign-outs.
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from './app/lib/env.js';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the user to trigger a refresh + cookie rotation when needed.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on the authenticated surfaces. The OAuth callback sets its own cookies,
  // so it doesn't need refreshing here.
  matcher: ['/dashboard/:path*'],
};
