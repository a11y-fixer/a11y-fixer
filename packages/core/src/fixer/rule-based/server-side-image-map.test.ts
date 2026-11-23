import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ServerSideImageMapFixer, removeIsMap } from './server-side-image-map.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'server-side-image-map'): A11yViolation {
  return {
    id,
    wcagId: '2.1.1',
    impact: 'minor',
    description: 'Server-side image maps must not be used',
    helpUrl: '',
    nodes: [{ html: '<img ismap src="m.png">', target: ['img'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeIsMap', () => {
  it('removes ismap from an <img>', () => {
    expect(removeIsMap('<img ismap src="m.png">')).toBe('<img src="m.png">');
  });

  it('returns null when the img has no ismap', () => {
    expect(removeIsMap('<img src="m.png">')).toBeNull();
  });

  it('returns null when there is no img tag', () => {
    expect(removeIsMap('<div ismap>x</div>')).toBeNull();
  });
});

describe('ServerSideImageMapFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'ssim-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new ServerSideImageMapFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'image-alt'))).toBe(false);
  });

  it('removes ismap on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<a href="/x">\n<img ismap src="m.png">\n</a>');
    const result = await new ServerSideImageMapFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<img src="m.png">');
  });

  it('human-flags when there is nothing to remove', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<img src="m.png">');
    const result = await new ServerSideImageMapFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
