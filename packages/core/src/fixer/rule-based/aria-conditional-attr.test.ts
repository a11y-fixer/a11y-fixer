import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaConditionalAttrFixer } from './aria-conditional-attr.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, summary = 'Remove aria-checked, which conflicts with the native checkbox state', id = 'aria-conditional-attr'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'ARIA attribute is not allowed given the element state',
    helpUrl: '',
    nodes: [{ html: '<input type="checkbox" aria-checked="true" aria-label="ok">', target: ['input'], failureSummary: summary, sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('AriaConditionalAttrFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-conditional-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaConditionalAttrFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, undefined, 'aria-allowed-attr'))).toBe(false);
  });

  it('removes only the conditional attribute named in the summary', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<form>\n<input type="checkbox" aria-checked="true" aria-label="ok">\n</form>');
    const result = await new AriaConditionalAttrFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).not.toContain('aria-checked');
    expect(contents).toContain('aria-label="ok"');
  });

  it('human-flags when the summary names no ARIA attribute', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<input type="checkbox" aria-checked="true">');
    const result = await new AriaConditionalAttrFixer(dir).fix(violation(file, 1, 'nothing useful here'));
    expect(result.bucket).toBe('human-flagged');
  });
});
