// The real, framework-free logic behind the Next.js telemetry route.
//
// `app/api/telemetry/route.ts` is a one-line shell that builds the production
// Store and calls `handleTelemetryRequest(req, store)`. This endpoint is public
// and unauthenticated (machine-to-machine from the GitHub Action, which has no
// browser Origin and no shared secret), so the body is UNTRUSTED: every field is
// validated and clamped here before it reaches the Store. A malformed or hostile
// payload yields a 400 and never writes.
import type { ActionRunRecord, Store } from '../db/store.js';

/** Modes the Action can report. Anything else is coerced to `unknown`. */
const VALID_MODES = new Set(['check', 'scan', 'fix']);

/** Upper bound on any single stored count, to cap a hostile payload. */
const MAX_COUNT = 1_000_000;

/** Coerce to a non-negative integer in [0, MAX_COUNT]; non-numbers → 0. */
function clampCount(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : 0;
  if (n < 0) return 0;
  return n > MAX_COUNT ? MAX_COUNT : n;
}

/** A bounded, trimmed string (or null) for a short free-text field. */
function shortString(value: unknown, max = 64): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function asBool(value: unknown): boolean {
  return value === true;
}

/**
 * Validate and normalize an untrusted telemetry body into an `ActionRunRecord`,
 * or null if it isn't a usable object. We are permissive on missing fields
 * (older Action versions may omit some) but strict on types and bounds.
 */
export function parseTelemetry(body: unknown): ActionRunRecord | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const mode = typeof b.mode === 'string' && VALID_MODES.has(b.mode) ? b.mode : 'unknown';
  return {
    actionVersion: shortString(b.actionVersion),
    mode,
    licensed: asBool(b.licensed),
    publicRepo: asBool(b.publicRepo),
    violationsBefore: clampCount(b.violationsBefore),
    violationsAfter: clampCount(b.violationsAfter),
    fixesApplied: clampCount(b.fixesApplied),
    fixesReverted: clampCount(b.fixesReverted),
    regressions: clampCount(b.regressions),
    usedUrl: asBool(b.usedUrl),
    usedHtml: asBool(b.usedHtml),
    usedMarkdown: asBool(b.usedMarkdown),
    usedComponents: asBool(b.usedComponents),
    platform: shortString(b.platform, 32) ?? 'unknown',
    arch: shortString(b.arch, 32) ?? 'unknown',
    nodeVersion: shortString(b.nodeVersion, 32) ?? 'unknown',
  };
}

/**
 * Read a telemetry `Request`, validate it, record one event, and return the
 * `Response`. 400 on a non-JSON or unusable body; 202 once the event is stored.
 * Keeping it here means the whole edge is unit-testable with a plain `Request`
 * and the in-memory Store — no Next.js runtime, no network.
 */
export async function handleTelemetryRequest(req: Request, store: Store): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  const event = parseTelemetry(body);
  if (!event) return new Response('Bad request', { status: 400 });
  await store.recordActionRun(event);
  return new Response('ok', { status: 202 });
}
