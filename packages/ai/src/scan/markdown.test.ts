import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scanMarkdown, scanLine } from './markdown.js';

describe('scanLine', () => {
  it('flags an empty-alt image as md-image-alt / 1.1.1 with the right column', () => {
    const v = scanLine('f.md', 3, 'Intro ![](logo.png) text');
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ id: 'md-image-alt', wcagId: '1.1.1' });
    expect(v[0].nodes[0]).toMatchObject({ sourceFile: 'f.md', sourceLine: 3, sourceColumn: 7 });
  });

  it('flags whitespace-only alt', () => {
    expect(scanLine('f.md', 1, '![   ](a.png)')).toHaveLength(1);
  });

  it('does NOT flag an image that already has alt text', () => {
    expect(scanLine('f.md', 1, '![A company logo](logo.png)')).toHaveLength(0);
  });

  it('flags each generic link phrase as md-link-text / 2.4.4', () => {
    for (const text of ['click here', 'here', 'read more', 'learn more']) {
      const v = scanLine('f.md', 1, `See [${text}](/page).`);
      expect(v, text).toHaveLength(1);
      expect(v[0]).toMatchObject({ id: 'md-link-text', wcagId: '2.4.4' });
    }
  });

  it('flags empty link text', () => {
    const v = scanLine('f.md', 1, 'A [](/page) link.');
    expect(v).toHaveLength(1);
    expect(v[0].id).toBe('md-link-text');
  });

  it('flags a bare URL used as its own link text', () => {
    const v = scanLine('f.md', 1, '[https://example.com/docs](https://example.com/docs)');
    expect(v).toHaveLength(1);
    expect(v[0].id).toBe('md-link-text');
  });

  it('does NOT flag a descriptive link', () => {
    expect(scanLine('f.md', 1, 'Read the [enterprise pricing guide](/pricing).')).toHaveLength(0);
  });

  it('does NOT treat an image as a link (no double-report)', () => {
    const v = scanLine('f.md', 1, '![](logo.png)');
    expect(v).toHaveLength(1);
    expect(v[0].id).toBe('md-image-alt');
  });

  it('reports multiple constructs on one line with distinct columns', () => {
    const v = scanLine('f.md', 1, '![](a.png) and [here](/x)');
    expect(v.map(x => x.id).sort()).toEqual(['md-image-alt', 'md-link-text']);
    const cols = v.map(x => x.nodes[0].sourceColumn);
    expect(new Set(cols).size).toBe(2);
  });

  it('ignores reference-style images/links (v1 scope)', () => {
    expect(scanLine('f.md', 1, '![][logo] and [here][ref]')).toHaveLength(0);
  });
});

describe('scanMarkdown', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'md-scan-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('walks .md/.markdown files and records absolute source locations', async () => {
    await writeFile(path.join(dir, 'a.md'), 'line one\n![](x.png)\n');
    await mkdir(path.join(dir, 'sub'), { recursive: true });
    await writeFile(path.join(dir, 'sub', 'b.markdown'), '[click here](/y)');

    const v = await scanMarkdown(dir);
    expect(v).toHaveLength(2);
    const img = v.find(x => x.id === 'md-image-alt');
    expect(img?.nodes[0]).toMatchObject({ sourceFile: path.join(dir, 'a.md'), sourceLine: 2 });
    const link = v.find(x => x.id === 'md-link-text');
    expect(link?.nodes[0]).toMatchObject({ sourceFile: path.join(dir, 'sub', 'b.markdown'), sourceLine: 1 });
  });

  it('skips node_modules and .git', async () => {
    await mkdir(path.join(dir, 'node_modules'), { recursive: true });
    await writeFile(path.join(dir, 'node_modules', 'dep.md'), '![](x.png)');
    await writeFile(path.join(dir, 'ok.md'), '![](y.png)');

    const v = await scanMarkdown(dir);
    expect(v).toHaveLength(1);
    expect(v[0].nodes[0].sourceFile).toBe(path.join(dir, 'ok.md'));
  });

  it('ignores non-markdown files', async () => {
    await writeFile(path.join(dir, 'page.html'), '<img src="x.png">');
    expect(await scanMarkdown(dir)).toHaveLength(0);
  });
});
