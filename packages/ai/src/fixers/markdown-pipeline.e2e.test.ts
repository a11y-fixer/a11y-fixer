import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { A11yViolation } from '@a11y-fixer/core';
import { scanMarkdown } from '../scan/markdown.js';
import { buildFullRegistry } from './registry.js';
import type { AIProvider } from '../provider/index.js';

/**
 * End-to-end coverage of the Markdown path: the repo-local `scanMarkdown` finds
 * `.md` violations, `buildFullRegistry().applyAll` routes them to the Markdown
 * fixers, the edits land on disk, and a re-scan confirms they cleared. Hermetic:
 * a deterministic fake provider, no network, no key, no browser.
 */
const fakeProvider: AIProvider = {
  available: () => true,
  describeImage: async () => 'A diagram',
  suggestAltText: async () => 'A diagram',
  rewriteLinkText: async () => 'the pricing page',
  suggestAccessibleName: async () => 'Submit',
};

const FIXTURE = [
  '# Handbook',
  '',
  'Our logo: ![](logo.png)',
  '',
  'See [click here](/pricing) for details.',
  '',
  'A good link: [the full pricing guide](/pricing).',
  '',
].join('\n');

let dir: string;
let file: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'md-e2e-'));
  file = join(dir, 'doc.md');
  await writeFile(file, FIXTURE, 'utf8');
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('Markdown fixer pipeline (real scanner, fake provider)', () => {
  it('scans .md, applies alt + link fixes to disk, and a re-scan clears them', async () => {
    const before = await scanMarkdown(dir);
    expect(before.map(v => v.id).sort()).toEqual(['md-image-alt', 'md-link-text']);

    const fixes = await buildFullRegistry(fakeProvider, dir).applyAll(before as A11yViolation[]);
    expect(fixes.every(f => f.applied && f.bucket === 'ai-assisted')).toBe(true);

    const content = await readFile(file, 'utf8');
    expect(content).toContain('![A diagram](logo.png)');
    expect(content).toContain('[the pricing page](/pricing)');
    // The already-descriptive link is untouched.
    expect(content).toContain('[the full pricing guide](/pricing)');

    const after = await scanMarkdown(dir);
    expect(after).toHaveLength(0);
  });

  it('fixes BOTH constructs when two share one line (sequential-splice column shift)', async () => {
    // Regression: the first splice lengthens the line; without rightmost-first
    // emission the second construct's recorded column goes stale and it ships
    // unfixed. An image + link, and two images, both on single lines.
    await writeFile(file, 'Logo ![](a.png) see [click here](/x)\nTwo ![](c.png) ![](d.png)\n', 'utf8');
    const before = await scanMarkdown(dir);
    expect(before).toHaveLength(4);

    const fixes = await buildFullRegistry(fakeProvider, dir).applyAll(before as A11yViolation[]);
    expect(fixes.every(f => f.applied && f.bucket === 'ai-assisted')).toBe(true);

    const content = await readFile(file, 'utf8');
    expect(content).toBe('Logo ![A diagram](a.png) see [the pricing page](/x)\nTwo ![A diagram](c.png) ![A diagram](d.png)\n');
    expect(await scanMarkdown(dir)).toHaveLength(0);
  });
});
