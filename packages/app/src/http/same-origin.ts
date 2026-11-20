// CSRF guard for the app's mutation routes.
//
// Supabase session cookies are `SameSite=Lax`, so a cross-site top-level form
// POST still carries them. For the first write path (triggering a scan) we add an
// explicit same-origin check: the request's `Origin` header host must match the
// app's own base URL host. Missing or mismatched → reject. Kept pure so it is
// unit-testable with no Next runtime.

function hostOf(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

/**
 * True when `origin` is present and its host matches `appBaseUrl`'s host. A
 * missing or unparseable `origin`, or a mismatched host, returns false.
 */
export function isSameOrigin(origin: string | null | undefined, appBaseUrl: string): boolean {
  const originHost = hostOf(origin);
  const appHost = hostOf(appBaseUrl);
  if (originHost === null || appHost === null) return false;
  return originHost === appHost;
}
