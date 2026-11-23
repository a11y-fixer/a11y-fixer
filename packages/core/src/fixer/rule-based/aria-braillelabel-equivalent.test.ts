import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaBrailleLabelEquivalentFixer, removeDanglingBrailleLabel } from './aria-braillelabel-equivalent.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'aria-braillelabel-equivalent'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'aria-braillelabel needs an accessible name',
    helpUrl: '',
    nodes: [{ html: '<button aria-braillelabel="x">x</button>', target: ['button'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeDanglingBrailleLabel', () => {
  it('removes aria-braillelabel when there is no aria-label', () => {
    expect(removeDanglingBrailleLabel('<button aria-braillelabel="x">y</button>')).toBe('<button>y</button>');
  });
  it('leaves it when a non-empty aria-label is present', () => {
    expect(removeDanglingBrailleLabel('<button aria-label="Save" aria-braillelabel="x">y</button>')).toBeNull();
  });
  it('returns null when absent', () => {
    expect(removeDanglingBrailleLabel('<button>y</button>')).toBeNull();
  });
});

describe('AriaBrailleLabelEquivalentFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'braillelabel-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaBrailleLabelEquivalentFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-valid-attr'))).toBe(false);
  });

  it('removes the orphaned braille label', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div>\n<button aria-braillelabel="x">x</button>\n</div>');
    const result = await new AriaBrailleLabelEquivalentFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<button>x</button>');
  });

  it('human-flags when an aria-label is present', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<button aria-label="Save" aria-braillelabel="x">x</button>');
    const result = await new AriaBrailleLabelEquivalentFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
