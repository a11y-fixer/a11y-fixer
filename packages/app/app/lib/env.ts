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
  // App-level credentials (M4 scan orchestration): used to mint installation
  // tokens for dispatching workflows. Already in the Vercel secret list.
  githubAppId: () => required('GITHUB_APP_ID'),
  githubAppPrivateKey: () => required('GITHUB_APP_PRIVATE_KEY'),
  // Ed25519 PKCS#8 PEM used to mint free-tier license keys (M5). MUST be the key
  // pair of the public key embedded in the Action's license.ts, or issued keys
  // won't verify. Verify once with scripts/check-signing-key.mjs.
  licenseSigningKey: () => required('LICENSE_SIGNING_KEY'),
  // Optional, comma/space-separated GitHub logins allowed to view the internal
  // telemetry analytics page. Not required(): when unset, no one qualifies and
  // the page 404s for everyone (see src/admin/access.ts).
  adminGithubLogins: () => process.env['ADMIN_GITHUB_LOGINS'] ?? '',
};
