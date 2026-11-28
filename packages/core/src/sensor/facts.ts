// Runtime sensor — the raw observation ("facts") for one SPA route transition.
//
// The sensor's trust model: the DRIVER (headless Chrome in CI) is UNTRUSTED and
// ships *facts only* — it never emits a pass/fail verdict and never holds the
// signing key. A single pure `judgeObservation` (judge.ts) turns these facts into
// a 4.1.3 verdict; the backend re-runs it on the received facts to mint the signed
// claim, so a forged `state` field can't exist (there is none to forge).
//
// Two hard rules baked into the fact shape:
//  - PII (A8): accessible NAMES and text content can carry user data (a name in
//    the nav, an order number in a heading). They are NEVER stored verbatim —
//    only salted-free sha-256 hashes + counts + booleans travel in a fact.
//  - Determinism (A5): two runs of a structurally identical transition must hash
//    identically, or every scheduled run appends a phantom claim forever. So text
//    is normalized before hashing, region lists are sorted, and route labels are
//    stripped of volatile ids/query tokens before they enter the blob.
import { createHash } from 'node:crypto';

/** sha-256 (hex) of a value — the only form accessible text/names ever take. */
export function hashText(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 32);
}

/** Collapse whitespace and trim, so trivial rendering differences hash identically. */
export function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** The hash of empty/whitespace-only content — a region with this "announces" nothing. */
export const EMPTY_TEXT_HASH = hashText('');

/** Hash of normalized text; empty/whitespace-only content maps to {@link EMPTY_TEXT_HASH}. */
export function hashContent(value: string): string {
  return hashText(normalizeText(value));
}

/**
 * Redact a route label (path) for the evidence blob: drop the query/hash, and
 * replace id-shaped segments (digits, uuids, long hex/slugs) with `:param`. This
 * keeps user data out of the blob AND normalizes volatile ids so `/orders/8821`
 * and `/orders/9910` are the same flow (A5 + A8).
 */
export function redactRouteLabel(path: string): string {
  const noQuery = path.split(/[?#]/, 1)[0] || '/';
  const segments = noQuery.split('/').map(seg => {
    if (!seg) return seg;
    const idShaped =
      /^\d+$/.test(seg) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg) ||
      /^[0-9a-f]{16,}$/i.test(seg);
    return idShaped ? ':param' : seg;
  });
  const joined = segments.join('/');
  return joined.startsWith('/') ? joined : `/${joined}`;
}

/**
 * The structural fingerprint of one ARIA live region at a point in time. Text and
 * accessible name are hashed, never stored. This is what lets the judge decide a
 * TEXT DELTA (not mere presence) without ever seeing the text.
 */
export interface RegionFingerprint {
  /** Normalized live politeness/role: 'status' | 'alert' | 'polite' | 'assertive'. */
  role: string;
  /** Hashed accessible name, or null when the region has none. */
  nameHash: string | null;
  /** Hashed normalized text content; {@link EMPTY_TEXT_HASH} when empty. */
  textHash: string;
  /** Child element count — a cheap structural signal orthogonal to text. */
  childCount: number;
  /** `aria-busy="true"` at capture — a region mid-update announces nothing yet. */
  ariaBusy: boolean;
}

/**
 * The raw observation of one route transition A → B. NO verdict field: pass/fail
 * is derived from these by `judgeObservation`, in the driver (for the CI check
 * conclusion) and again in the backend (for the signed claim).
 */
export interface RouteChangeFacts {
  /** Redacted source route label — evidence only, NEVER flow identity (A3). */
  fromLabel: string;
  /** Redacted destination route label — evidence only. */
  toLabel: string;
  /** True when the settle window reached quiescence; false means it timed out. */
  settled: boolean;
  /** Live-region fingerprints before the transition. */
  liveRegionsBefore: RegionFingerprint[];
  /** Live-region fingerprints after the transition settled. */
  liveRegionsAfter: RegionFingerprint[];
  /** True when focus landed on a node ABSENT from the before-snapshot's subtree
   *  (i.e. focus moved into newly rendered content), not merely onto `<main>`. */
  focusMovedIntoNewContent: boolean;
}

/** Stable sort key for a region fingerprint — so region ordering can't perturb the hash. */
function regionKey(r: RegionFingerprint): string {
  return `${r.role}\u0000${r.nameHash ?? ''}\u0000${r.textHash}\u0000${r.childCount}\u0000${r.ariaBusy}`;
}

function sortRegions(regions: RegionFingerprint[]): RegionFingerprint[] {
  return [...regions].sort((a, b) => regionKey(a).localeCompare(regionKey(b)));
}

/**
 * Canonicalize facts for hashing: sort region lists deterministically so two runs
 * of a structurally identical transition produce byte-identical evidence (A5). The
 * route labels are already redacted/normalized by the observer.
 */
export function canonicalizeFacts(facts: RouteChangeFacts): RouteChangeFacts {
  return {
    ...facts,
    liveRegionsBefore: sortRegions(facts.liveRegionsBefore),
    liveRegionsAfter: sortRegions(facts.liveRegionsAfter),
  };
}

/**
 * Did a live region ANNOUNCE — i.e. gain non-empty text content that was not
 * already present before the transition? Mere presence of a live region, or one
 * whose text did not change, is NOT an announcement (A1: the false-pass guard).
 */
export function liveRegionTextChanged(facts: RouteChangeFacts): boolean {
  const before = new Set(
    facts.liveRegionsBefore
      .filter(r => r.textHash !== EMPTY_TEXT_HASH)
      .map(r => r.textHash),
  );
  return facts.liveRegionsAfter.some(
    r => !r.ariaBusy && r.textHash !== EMPTY_TEXT_HASH && !before.has(r.textHash),
  );
}
