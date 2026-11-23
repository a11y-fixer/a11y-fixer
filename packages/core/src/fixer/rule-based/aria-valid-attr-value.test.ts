import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaValidAttrValueFixer, normalizeAriaValueOnLine } from './aria-valid-attr-value.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, summary = 'Invalid ARIA attribute value: aria-expanded="yes"', id = 'aria-valid-attr-value'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'ARIA attributes must conform to valid values',
    helpUrl: '',
    nodes: [{ html: '<button aria-expanded="yes">x</button>', target: ['button'], failureSummary: summary, sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('normalizeAriaValueOnLine', () => {
  it('maps a boolean near-miss to the canonical token', () => {
    expect(normalizeAriaValueOnLine('<button aria-expanded="yes">y</button>', 'aria-expanded="yes"'))
      .toBe('<button aria-expanded="true">y</button>');
    expect(normalizeAriaValueOnLine('<div aria-hidden="1">y</div>', 'aria-hidden="1"'))
      .toBe('<div aria-hidden="true">y</div>');
  });
  it('returns null for a token-valued or tristate attribute', () => {
    expect(normalizeAriaValueOnLine('<div aria-current="page">y</div>', 'aria-current="yep"')).toBeNull();
    expect(normalizeAriaValueOnLine('<div aria-checked="mixd">y</div>', 'aria-checked="mixd"')).toBeNull();
  });
  it('returns null when the value is not a recognized near-miss', () => {
    expect(normalizeAriaValueOnLine('<div aria-hidden="wat">y</div>', 'aria-hidden="wat"')).toBeNull();
  });
});

describe('AriaValidAttrValueFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-valid-value-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaValidAttrValueFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, undefined, 'aria-valid-attr'))).toBe(false);
  });

  it('normalizes a boolean near-miss on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div>\n<button aria-expanded="yes">x</button>\n</div>');
    const result = await new AriaValidAttrValueFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('aria-expanded="true"');
  });

  it('human-flags an ambiguous value', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<button aria-expanded="wat">x</button>');
    const result = await new AriaValidAttrValueFixer(dir).fix(violation(file, 1, 'aria-expanded="wat"'));
    expect(result.bucket).toBe('human-flagged');
  });
});
