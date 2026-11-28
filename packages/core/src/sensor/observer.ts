// The observer — drives real SPA route transitions in headless Chrome and records
// raw 4.1.3 facts. Reuses the shared puppeteer loader (`launchBrowser`), the same
// browser primitive AxeDetector/PuppeteerRunner already depend on, so the sensor
// adds NO new CI browser dependency. It observes; it never judges (judge.ts does)
// and never signs (the backend does). Text and accessible names are hashed the
// instant they leave the page context — raw strings never enter a fact or a blob.
import { launchBrowser } from '../detector/load-puppeteer.js';
import {
  hashContent,
  hashText,
  redactRouteLabel,
  type RegionFingerprint,
  type RouteChangeFacts,
} from './facts.js';
import { resolveFlowName, type DiscoveredRoute } from './route-discovery.js';

/** One observed transition: the flow it belongs to and its raw facts. */
export interface SensorObservation {
  /** Stable human flow name (the destination route) — seeds `flowId`. */
  flowName: string;
  /** Raw route-change facts for the judge. */
  facts: RouteChangeFacts;
}

export interface RunSensorOptions {
  /** Base URL of the running app under test, e.g. 'http://localhost:3000'. */
  baseUrl: string;
  /** Auto-discovered routes (from a RouteDiscovery adapter). */
  routes: DiscoveredRoute[];
  /** Rename aliases (old redacted label → current), for stable chains (A3). */
  aliases?: Readonly<Record<string, string>>;
  /** Cap on transitions observed per run — bounds the synthetic traffic (A3/sampling). */
  maxTransitions?: number;
  /** Quiescence window: ms of no DOM mutation that counts as "settled". */
  settleQuietMs?: number;
  /** Hard cap on settle wait before giving up → `not-evaluated` (A4). */
  settleTimeoutMs?: number;
}

const DEFAULTS = { maxTransitions: 25, settleQuietMs: 400, settleTimeoutMs: 8000 };

/**
 * Drive the app and observe up to `maxTransitions` route changes, returning one
 * observation per transition. Transitions are auto-discovered: from each route,
 * crawl the rendered internal links that target another known route and click
 * them (a real client-side navigation). Deterministic ordering (sorted routes +
 * sorted links, deduped by flow pair) so the same app yields the same run.
 */
export async function runRouteSensor(opts: RunSensorOptions): Promise<SensorObservation[]> {
  const cfg = { ...DEFAULTS, ...opts };
  const routePaths = new Set(opts.routes.map(r => r.path));
  const observations: SensorObservation[] = [];
  const seenPairs = new Set<string>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const browser: any = await launchBrowser();
  try {
    const page = await browser.newPage();
    for (const route of opts.routes) {
      if (observations.length >= cfg.maxTransitions) break;
      const fromUrl = new URL(route.path, opts.baseUrl).href;
      let targets: InternalLink[];
      try {
        await page.goto(fromUrl, { waitUntil: 'networkidle0' });
        targets = await discoverInternalLinks(page, routePaths);
      } catch {
        continue; // route didn't load; skip, never a fabricated fail
      }
      for (const target of targets) {
        if (observations.length >= cfg.maxTransitions) break;
        const toFlow = resolveFlowName(target.toPath, opts.aliases);
        const pairKey = `${route.path}\u0000${toFlow}`;
        if (seenPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);
        try {
          const facts = await observeTransition(page, fromUrl, target, cfg);
          observations.push({ flowName: toFlow, facts });
        } catch {
          // Observation failed mid-flight: skip rather than guess a verdict.
        }
      }
    }
    return observations;
  } finally {
    await browser.close().catch(() => undefined);
  }
}

interface InternalLink {
  selectorIndex: number;
  toPath: string;
}

/** Collect internal links on the current page that target another known route. */
async function discoverInternalLinks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
  routePaths: Set<string>,
): Promise<InternalLink[]> {
  const hrefs: string[] = await page.$$eval('a[href]', (els: Element[]) =>
    els.map(el => (el as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
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

/** Observe one A → B client-side transition and build its facts. */
async function observeTransition(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
  fromUrl: string,
  target: InternalLink,
  cfg: { settleQuietMs: number; settleTimeoutMs: number },
): Promise<RouteChangeFacts> {
  await page.goto(fromUrl, { waitUntil: 'networkidle0' });
  const before = await captureSnapshot(page);

  // Client-side navigation: click the nth internal anchor in document order.
  await page.evaluate((idx: number) => {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    (anchors[idx] as HTMLElement | undefined)?.click();
  }, target.selectorIndex);

  const settled = await waitForSettle(page, cfg.settleQuietMs, cfg.settleTimeoutMs);
  const after = await captureSnapshot(page);

  const beforeSignatures = new Set(before.elementSignatures);
  const focusMovedIntoNewContent =
    after.focusSignature != null && !beforeSignatures.has(after.focusSignature);

  return {
    fromLabel: redactRouteLabel(new URL(fromUrl).pathname),
    toLabel: redactRouteLabel(target.toPath),
    settled,
    liveRegionsBefore: fingerprint(before.regions),
    liveRegionsAfter: fingerprint(after.regions),
    focusMovedIntoNewContent,
  };
}

interface RawRegion {
  role: string;
  name: string | null;
  text: string;
  childCount: number;
  ariaBusy: boolean;
}
interface RawSnapshot {
  regions: RawRegion[];
  elementSignatures: string[];
  focusSignature: string | null;
}

/** Hash the raw (possibly PII-bearing) region strings into safe fingerprints. */
function fingerprint(regions: RawRegion[]): RegionFingerprint[] {
  return regions.map(r => ({
    role: r.role,
    nameHash: r.name != null ? hashContent(r.name) : null,
    textHash: hashContent(r.text),
    childCount: r.childCount,
    ariaBusy: r.ariaBusy,
  }));
}

/** Capture live regions, focus signature, and element signatures from the page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function captureSnapshot(page: any): Promise<RawSnapshot> {
  return page.evaluate(() => {
    const sigOf = (el: Element): string => {
      const role = el.getAttribute('role') ?? '';
      const label = el.getAttribute('aria-label') ?? '';
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
      return `${el.tagName}|${role}|${label}|${text}`;
    };
    const regionEls = Array.from(
      document.querySelectorAll('[aria-live], [role="status"], [role="alert"], output'),
    );
    const regions = regionEls.map(el => {
      const live = el.getAttribute('aria-live');
      const roleAttr = el.getAttribute('role');
      const role = live || (roleAttr === 'alert' ? 'assertive' : roleAttr === 'status' ? 'polite' : 'polite');
      const name = el.getAttribute('aria-label');
      return {
        role,
        name: name && name.length ? name : null,
        text: el.textContent ?? '',
        childCount: el.childElementCount,
        ariaBusy: el.getAttribute('aria-busy') === 'true',
      };
    });
    const elementSignatures = Array.from(document.querySelectorAll('body *')).map(sigOf);
    const active = document.activeElement;
    const focusSignature = active && active !== document.body ? sigOf(active) : null;
    return { regions, elementSignatures, focusSignature };
  });
}

/**
 * Wait for the main region to go quiet: resolve `true` once no DOM mutation has
 * fired for `quietMs`, or `false` at `timeoutMs` (→ not-evaluated). Bare
 * network-idle is NOT used — polling/websocket/analytics apps never idle, which
 * would silently time out every transition while CI stayed green (A4).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function waitForSettle(page: any, quietMs: number, timeoutMs: number): Promise<boolean> {
  return page.evaluate(
    (quiet: number, timeout: number) =>
      new Promise<boolean>(resolve => {
        const root = document.querySelector('main') ?? document.body;
        let quietTimer: ReturnType<typeof setTimeout>;
        const obs = new MutationObserver(() => {
          clearTimeout(quietTimer);
          quietTimer = setTimeout(settled, quiet);
        });
        const done = (value: boolean) => {
          clearTimeout(quietTimer);
          clearTimeout(hardTimer);
          obs.disconnect();
          resolve(value);
        };
        const settled = () => done(true);
        const hardTimer = setTimeout(() => done(false), timeout);
        obs.observe(root, { childList: true, subtree: true, characterData: true, attributes: true });
        quietTimer = setTimeout(settled, quiet);
      }),
    quietMs,
    timeoutMs,
  );
}

// Re-export so a driver importing the observer gets the hashing helper too.
export { hashText };
