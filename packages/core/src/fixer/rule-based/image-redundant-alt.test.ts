import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ImageRedundantAltFixer, emptyRedundantAlt } from './image-redundant-alt.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'image-redundant-alt'): A11yViolation {
  return {
    id,
    wcagId: '1.1.1',
    impact: 'minor',
    description: 'alt text should not duplicate adjacent text',
    helpUrl: '',
    nodes: [{ html: '<img src="dl.png" alt="Download">', target: ['img'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('emptyRedundantAlt', () => {
  it('empties a non-empty alt', () => {
    expect(emptyRedundantAlt('<img src="dl.png" alt="Download">')).toBe('<img src="dl.png" alt="">');
  });

  it('returns null when alt is already empty', () => {
    expect(emptyRedundantAlt('<img src="dl.png" alt="">')).toBeNull();
  });

  it('returns null when there is no alt', () => {
    expect(emptyRedundantAlt('<img src="dl.png">')).toBeNull();
  });

  it('returns null when there is no img tag', () => {
    expect(emptyRedundantAlt('<div alt="x">y</div>')).toBeNull();
  });
});

describe('ImageRedundantAltFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'redundant-alt-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not plain image-alt', () => {
    const fixer = new ImageRedundantAltFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'image-alt'))).toBe(false);
  });

  it('empties the redundant alt on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<a href="/dl">\n<img src="dl.png" alt="Download"> Download\n</a>');
    const result = await new ImageRedundantAltFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<img src="dl.png" alt="">');
  });

  it('human-flags when there is nothing to empty', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<img src="dl.png" alt="">');
    const result = await new ImageRedundantAltFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
