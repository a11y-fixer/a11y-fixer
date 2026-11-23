import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scanComponents, maskNonTemplate } from './index.js';
import { maskRanges } from './mask.js';
import { extractSvelte } from './extract-svelte.js';
import { extractAstro } from './extract-astro.js';
import type { Detector, DetectorOptions, A11yViolation } from '../../detector/index.js';

/**
 * A detector that returns one canned `image-alt` violation for a `logo.png`
 * image. The runner locates it in the markup we actually pass, so if masking
 * failed to remove a decoy `<img>` the located line would move — that's what the
 * tests assert on.
 */
function stubImgDetector(): Detector {
  return {
    async scan(_opts: DetectorOptions): Promise<A11yViolation[]> {
      return [{
        id: 'image-alt',
        wcagId: '1.1.1',
        impact: 'critical',
        description: 'Images must have alternate text',
        helpUrl: '',
        nodes: [{ html: '<img src="logo.png">', target: ['img'], failureSummary: '' }],
      }];
    },
  };
}

describe('maskNonTemplate', () => {
  it('Vue: keeps template markup, blanks <script>/<style> (line numbers preserved)', async () => {
    const vue = [
      '<script setup>',
      'const img = "<img src=\\"logo.png\\">"; // decoy in script',
      '</script>',
      '',
      '<template>',
      '  <img src="logo.png">',
      '</template>',
      '',
      '<style>.x { color: red }</style>',
    ].join('\n');
    const masked = await maskNonTemplate('/c/App.vue', vue);
    expect(masked).not.toBeNull();
    const lines = masked!.split('\n');
    // Same number of lines — positions preserved.
    expect(lines).toHaveLength(9);
    // The only surviving <img> is the template one, on its original line (6).
    expect(lines[5]).toContain('<img src="logo.png">');
    expect(lines[1]).not.toContain('<img');
    expect(masked).not.toContain('<script');
    expect(masked).not.toContain('<template');
  });

  it('Vue: returns null when there is no <template> block', async () => {
    expect(await maskNonTemplate('/c/util.vue', '<script>export const x = 1</script>')).toBeNull();
  });

  it('Svelte: blanks <script> and <style>, keeps the rest in place', () => {
    const svelte = '<script>let img = "<img src=x>";</script>\n<img src="logo.png">\n<style>a{}</style>';
    const masked = maskRanges(svelte, extractSvelte(svelte));
    const lines = masked.split('\n');
    expect(lines[0]).not.toContain('<img');
    expect(lines[1]).toContain('<img src="logo.png">');
    expect(masked).not.toContain('<style>a{}');
  });

  it('Svelte: blanks a <script> closed with whitespace before > (</script >)', () => {
    const svelte = '<script>const img = "<img src=decoy>";</script >\n<img src="logo.png">';
    const masked = maskRanges(svelte, extractSvelte(svelte));
    expect(masked).not.toContain('decoy');
    expect(masked.split('\n')[1]).toContain('<img src="logo.png">');
  });

  it('Astro: blanks the leading --- frontmatter fence only', () => {
    const astro = '---\nconst x = "<img src=decoy>";\n---\n<img src="logo.png">';
    const masked = maskRanges(astro, extractAstro(astro));
    const lines = masked.split('\n');
    expect(lines[1]).not.toContain('<img');
    expect(lines[3]).toContain('<img src="logo.png">');
  });
});

describe('scanComponents', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'components-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('stamps the violation at the template line, ignoring a decoy <img> in <script>', async () => {
    const vue = [
      '<script setup>',
      'const s = "<img src=\\"logo.png\\">";', // decoy, line 2
      '</script>',
      '<template>',
      '  <img src="logo.png">', // real, line 5
      '</template>',
    ].join('\n');
    await writeFile(path.join(dir, 'App.vue'), vue, 'utf8');

    const violations = await scanComponents(dir, stubImgDetector());
    expect(violations).toHaveLength(1);
    const node = violations[0].nodes[0];
    expect(node.sourceFile).toBe(path.join(dir, 'App.vue'));
    expect(node.sourceLine).toBe(5);
  });

  it('returns [] when no component files are present', async () => {
    expect(await scanComponents(dir, stubImgDetector())).toEqual([]);
  });

  it('drops whole-document rules that are artifacts of wrapping a fragment', async () => {
    await writeFile(path.join(dir, 'App.vue'), '<template><img src="/logo.png"></template>', 'utf8');
    const detector: Detector = {
      async scan(): Promise<A11yViolation[]> {
        return [
          { id: 'document-title', wcagId: '2.4.2', impact: 'serious', description: '', helpUrl: '', nodes: [{ html: '<html>', target: ['html'], failureSummary: '' }] },
          { id: 'region', wcagId: 'region', impact: 'moderate', description: '', helpUrl: '', nodes: [{ html: '<img src="/logo.png">', target: ['img'], failureSummary: '' }] },
          { id: 'image-alt', wcagId: '1.1.1', impact: 'critical', description: '', helpUrl: '', nodes: [{ html: '<img src="/logo.png">', target: ['img'], failureSummary: '' }] },
        ];
      },
    };
    const violations = await scanComponents(dir, detector);
    expect(violations.map(v => v.id)).toEqual(['image-alt']);
  });
});
