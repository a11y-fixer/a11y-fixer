// Route auto-discovery — derive the route set from the app's router config, never
// a hand-maintained list (the #1 six-month regret vector: a hand-list goes stale
// and the "coverage" quietly decays to a sliver). The reachable TRANSITION set is
// built at runtime by crawling rendered internal links (see observer.ts); this
// module owns the static route inventory and the stable flow identity.
import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { redactRouteLabel } from './facts.js';

/** One discovered route: its URL path and the stable human-facing flow name. */
export interface DiscoveredRoute {
  /** Route path as the router defines it, e.g. '/dashboard' or '/orders/:param'. */
  path: string;
  /** Stable flow name (redacted path) — the seed for `flowId`. See `resolveFlowName`. */
  flowName: string;
}

/** A router adapter: given a project, enumerate its routes. One per framework. */
export interface RouteDiscovery {
  discover(): Promise<DiscoveredRoute[]>;
}

const PAGE_FILE = /^page\.(tsx|ts|jsx|js|mdx)$/;

/**
 * Next.js App Router discovery: walk `<appDir>` for `page.*` files and map each
 * directory to a route. Filesystem routing IS the router config here, so this is
 * genuine auto-discovery with nothing to hand-maintain. Conventions handled:
 *   - route groups `(group)`      → stripped from the path (no URL segment)
 *   - dynamic `[param]`           → `:param`
 *   - catch-all `[...slug]`       → `:slug`
 *   - optional catch-all `[[..]]` → `:slug`
 *   - parallel `@slot` / private `_folder` / `api` → skipped (not navigable pages)
 */
export class NextAppRouterDiscovery implements RouteDiscovery {
  constructor(private readonly appDir: string) {}

  async discover(): Promise<DiscoveredRoute[]> {
    const routes = new Map<string, DiscoveredRoute>();
    await this.walk(this.appDir, [], routes);
    return [...routes.values()].sort((a, b) => a.path.localeCompare(b.path));
  }

  private segmentFor(dirName: string): string | null | undefined {
    // undefined → skip this whole subtree; null → no URL segment (route group)
    if (dirName.startsWith('@') || dirName.startsWith('_') || dirName === 'api') return undefined;
    if (dirName.startsWith('(') && dirName.endsWith(')')) return null;
    const catchAll = /^\[\[?\.\.\.(.+?)\]?\]$/.exec(dirName);
    if (catchAll) return `:${catchAll[1]}`;
    const dynamic = /^\[(.+?)\]$/.exec(dirName);
    if (dynamic) return `:${dynamic[1]}`;
    return dirName;
  }

  private async walk(
    dir: string,
    segments: string[],
    out: Map<string, DiscoveredRoute>,
  ): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await readdir(dir, { withFileTypes: true, encoding: 'utf8' });
    } catch {
      return; // missing/unreadable dir: nothing to discover here
    }
    const hasPage = entries.some(e => e.isFile() && PAGE_FILE.test(e.name));
    if (hasPage) {
      const path = '/' + segments.filter(Boolean).join('/');
      const normalized = path === '/' ? '/' : path.replace(/\/+/g, '/');
      out.set(normalized, { path: normalized, flowName: resolveFlowName(normalized) });
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const seg = this.segmentFor(entry.name);
      if (seg === undefined) continue; // skip subtree
      const nextSegments = seg === null ? segments : [...segments, seg];
      await this.walk(join(dir, entry.name), nextSegments, out);
    }
  }
}

/**
 * The canonical flow name for a route, applying any rename aliases. `aliases` maps
 * an OLD route label to the CURRENT one so a deliberate route rename keeps the same
 * conformance chain (A3). The name is the redacted path, so `/orders/8821` and
 * `/orders/9910` already share a flow; only a genuine path rename needs an alias.
 */
export function resolveFlowName(
  routePath: string,
  aliases: Readonly<Record<string, string>> = {},
): string {
  const redacted = redactRouteLabel(routePath);
  return aliases[redacted] ?? redacted;
}
