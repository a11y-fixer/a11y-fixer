import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextAppRouterDiscovery, resolveFlowName } from './route-discovery.js';

async function page(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'page.tsx'), 'export default function P() { return null; }');
}

describe('NextAppRouterDiscovery', () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'a11y-routes-'));
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('maps page.tsx directories to routes, honoring groups and dynamic segments', async () => {
    await page(root); // '/'
    await page(join(root, 'dashboard')); // '/dashboard'
    await page(join(root, '(marketing)', 'pricing')); // group stripped → '/pricing'
    await page(join(root, 'orders', '[id]')); // '/orders/:id'
    await page(join(root, 'docs', '[...slug]')); // '/docs/:slug'
    await mkdir(join(root, 'api', 'health'), { recursive: true });
    await writeFile(join(root, 'api', 'health', 'route.ts'), 'export const GET = () => {};'); // not a page

    const routes = (await new NextAppRouterDiscovery(root).discover()).map(r => r.path);
    expect(routes).toEqual(['/', '/dashboard', '/docs/:slug', '/orders/:id', '/pricing']);
  });

  it('returns an empty list for a missing app dir (never throws)', async () => {
    expect(await new NextAppRouterDiscovery(join(root, 'nope')).discover()).toEqual([]);
  });
});

describe('resolveFlowName — A3 stable identity', () => {
  it('redacts ids so sibling instances share a flow', () => {
    expect(resolveFlowName('/orders/8821')).toBe(resolveFlowName('/orders/9910'));
  });
  it('applies a rename alias so a renamed route keeps its chain', () => {
    expect(resolveFlowName('/purchases', { '/purchases': '/orders' })).toBe('/orders');
  });
});
