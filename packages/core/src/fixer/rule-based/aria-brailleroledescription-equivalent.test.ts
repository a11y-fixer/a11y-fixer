import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaBrailleRoledescriptionEquivalentFixer, removeDanglingBrailleRoledescription } from './aria-brailleroledescription-equivalent.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'aria-brailleroledescription-equivalent'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'aria-brailleroledescription needs aria-roledescription',
    helpUrl: '',
    nodes: [{ html: '<div aria-brailleroledescription="sl">x</div>', target: ['div'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeDanglingBrailleRoledescription', () => {
  it('removes it when there is no aria-roledescription', () => {
    expect(removeDanglingBrailleRoledescription('<div aria-brailleroledescription="sl">y</div>')).toBe('<div>y</div>');
  });
  it('leaves it when aria-roledescription is present', () => {
    expect(removeDanglingBrailleRoledescription('<div aria-roledescription="slide" aria-brailleroledescription="sl">y</div>')).toBeNull();
  });
  it('returns null when absent', () => {
    expect(removeDanglingBrailleRoledescription('<div>y</div>')).toBeNull();
  });
});

describe('AriaBrailleRoledescriptionEquivalentFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'brailleroledesc-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaBrailleRoledescriptionEquivalentFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-roledescription'))).toBe(false);
  });

  it('removes the orphaned braille role description', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<div aria-brailleroledescription="sl">x</div>\n</main>');
    const result = await new AriaBrailleRoledescriptionEquivalentFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<div>x</div>');
  });

  it('human-flags when aria-roledescription is present', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div aria-roledescription="slide" aria-brailleroledescription="sl">x</div>');
    const result = await new AriaBrailleRoledescriptionEquivalentFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
