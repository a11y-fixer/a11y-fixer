import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaRoledescriptionFixer, removeRoledescription } from './aria-roledescription.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'aria-roledescription'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'aria-roledescription unsupported',
    helpUrl: '',
    nodes: [{ html: '<div aria-roledescription="slide">x</div>', target: ['div'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeRoledescription', () => {
  it('removes the attribute', () => {
    expect(removeRoledescription('<div aria-roledescription="slide" class="x">y</div>')).toBe('<div class="x">y</div>');
  });
  it('returns null when absent', () => {
    expect(removeRoledescription('<div class="x">y</div>')).toBeNull();
  });
});

describe('AriaRoledescriptionFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-roledesc-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaRoledescriptionFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-roles'))).toBe(false);
  });

  it('removes the unsupported attribute', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<section>\n<div aria-roledescription="slide">x</div>\n</section>');
    const result = await new AriaRoledescriptionFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<div>x</div>');
  });

  it('human-flags when absent', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div>x</div>');
    const result = await new AriaRoledescriptionFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
