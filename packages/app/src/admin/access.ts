// Author-only access control for internal pages (the telemetry analytics view).
//
// There is no "admin" role in the data model; internal pages are gated by a
// static allowlist of GitHub logins supplied via the ADMIN_GITHUB_LOGINS env
// var (see app/lib/env.ts). Both parsing and the membership check live here so
// they are pure and unit-testable, with no Next.js or env coupling.

/**
 * Parse the raw ADMIN_GITHUB_LOGINS value into a normalized set of logins.
 * Accepts commas, whitespace, or newlines as separators; lower-cases and trims
 * each entry; drops blanks. An empty/undefined input yields an empty list.
 */
export function parseAdminLogins(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[\s,]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Whether `login` is in the allowlist. GitHub logins are case-insensitive, so
 * the comparison is lower-cased on both sides. A null/empty login never matches.
 */
export function isAdminLogin(login: string | null | undefined, allowed: string[]): boolean {
  if (!login) return false;
  return allowed.includes(login.trim().toLowerCase());
}
