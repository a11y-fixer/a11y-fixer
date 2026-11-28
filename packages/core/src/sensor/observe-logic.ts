// The pure, browser-free logic the observer runs over raw page snapshots. Kept
// separate from observer.ts (which is thin Puppeteer glue — page.evaluate,
// launchBrowser, settle timing — and excluded from coverage) so the parts that
// actually decide what a fact says are unit-tested without a real browser.
import {
  hashContent,
  redactRouteLabel,
  type RegionFingerprint,
  type RouteChangeFacts,
} from './facts.js';

/** A live region as captured in the page, before hashing. */
export interface RawRegion {
  role: string;
  name: string | null;
  text: string;
  childCount: number;
  ariaBusy: boolean;
}

/** A page snapshot captured before/after a transition (raw, pre-hash). */
export interface RawSnapshot {
  regions: RawRegion[];
  /** Structural signatures of every element, for new-subtree detection. */
  elementSignatures: string[];
  /** Signature of the focused element, or null when focus is on body/none. */
  focusSignature: string | null;
}

/** An internal link to a known route, identified by its anchor index. */
export interface InternalLink {
  selectorIndex: number;
  toPath: string;
}

/** Hash the raw (possibly PII-bearing) region strings into safe fingerprints. */
export function fingerprint(regions: RawRegion[]): RegionFingerprint[] {
  return regions.map(r => ({
    role: r.role,
    nameHash: r.name != null ? hashContent(r.name) : null,
    textHash: hashContent(r.text),
    childCount: r.childCount,
    ariaBusy: r.ariaBusy,
  }));
}

/**
 * From the hrefs on a page, pick the same-origin internal links that target a
 * known route — deduped by destination and sorted for deterministic ordering.
 * The index is the anchor's document position, so the driver can click it.
 */
export function selectInternalLinks(hrefs: string[], routePaths: Set<string>): InternalLink[] {
  const links: InternalLink[] = [];
  const seen = new Set<string>();
  hrefs.forEach((href, selectorIndex) => {
    if (!href.startsWith('/') || href.startsWith('//')) return; // internal, same-origin only
    const path = href.split(/[?#]/, 1)[0] || '/';
    if (!routePaths.has(path) || seen.has(path)) return;
    seen.add(path);
    links.push({ selectorIndex, toPath: path });
  });
  return links.sort((a, b) => a.toPath.localeCompare(b.toPath));
}

/**
 * Did focus land on a node ABSENT from the before-snapshot — i.e. focus moved
 * into newly rendered content, not merely onto a node that already existed.
 */
export function focusMovedIntoNewContent(
  beforeSignatures: string[],
  afterFocusSignature: string | null,
): boolean {
  if (afterFocusSignature == null) return false;
  return !new Set(beforeSignatures).has(afterFocusSignature);
}

/** Assemble the raw route-change facts from the before/after snapshots. */
export function buildFacts(opts: {
  fromPath: string;
  toPath: string;
  settled: boolean;
  before: RawSnapshot;
  after: RawSnapshot;
}): RouteChangeFacts {
  return {
    fromLabel: redactRouteLabel(opts.fromPath),
    toLabel: redactRouteLabel(opts.toPath),
    settled: opts.settled,
    liveRegionsBefore: fingerprint(opts.before.regions),
    liveRegionsAfter: fingerprint(opts.after.regions),
    focusMovedIntoNewContent: focusMovedIntoNewContent(
      opts.before.elementSignatures,
      opts.after.focusSignature,
    ),
  };
}
