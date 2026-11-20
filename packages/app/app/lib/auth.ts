// Cookie-backed Supabase Auth for the App Router.
//
// `@supabase/ssr` wires the auth session to Next's cookie store. We expose a
// server client for route handlers / Server Components, plus a helper that
// returns the signed-in user (or null) and their provider (GitHub) access token.
import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from './env.js';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet: CookieToSet[]) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component render (read-only cookies); the
          // session is refreshed in a route handler / proxy instead. Safe to ignore.
        }
      },
    },
  });
}

export interface SignedInUser {
  /** Supabase Auth user id = auth.uid(). */
  id: string;
  /** GitHub OAuth access token (user-to-server), present right after login. */
  githubToken: string | null;
}

/** The signed-in user, or null when there is no valid session. */
export async function getSignedInUser(): Promise<SignedInUser | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  return { id: data.user.id, githubToken: sessionData.session?.provider_token ?? null };
}
