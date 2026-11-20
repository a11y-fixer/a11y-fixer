// Supabase client construction for the Next.js layer.
//
// Two clients, two trust levels:
//  - service-role: bypasses RLS. Used by the webhook sink and server-side admin
//    reads. Never exposed to the browser.
//  - user-scoped: anon key + the signed-in user's JWT, so Postgres RLS enforces
//    per-installation visibility (see db/schema.sql).
//
// The service-role client satisfies the structural `SupabaseLike` the core
// `SupabaseStore` types against, so we wrap it directly.
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SupabaseStore } from '../../src/db/supabase-store.js';
import type { SupabaseLike } from '../../src/db/supabase-store.js';
import { env } from './env.js';

/** A service-role-backed Store (bypasses RLS). For the webhook sink + admin reads. */
export function serviceRoleStore(): SupabaseStore {
  const client = createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return new SupabaseStore(client as unknown as SupabaseLike);
}

/** A user-scoped client (RLS-enforced) built from the signed-in user's access token. */
export function userClient(accessToken: string): SupabaseClient {
  return createClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
