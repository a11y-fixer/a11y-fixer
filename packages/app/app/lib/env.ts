// Server-only environment access for the Next.js layer. Throws early (and
// loudly) if a required secret is missing, rather than failing deep in a request.
// Never log these values.
import 'server-only';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  supabaseUrl: () => required('SUPABASE_URL'),
  supabaseServiceRoleKey: () => required('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseAnonKey: () => required('SUPABASE_ANON_KEY'),
  githubClientId: () => required('GITHUB_APP_CLIENT_ID'),
  githubClientSecret: () => required('GITHUB_APP_CLIENT_SECRET'),
  appBaseUrl: () => required('APP_BASE_URL'),
};
