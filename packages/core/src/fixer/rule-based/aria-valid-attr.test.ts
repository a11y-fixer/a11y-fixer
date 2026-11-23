import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaValidAttrFixer } from './aria-valid-attr.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, summary = 'Invalid ARIA attribute name: aria-labeledby', id = 'aria-valid-attr'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'ARIA attributes must conform to valid names',
    helpUrl: '',
    nodes: [{ html: '<div aria-labeledby="h1" aria-label="ok">x</div>', target: ['div'], failureSummary: summary, sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('AriaValidAttrFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-valid-attr-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaValidAttrFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, undefined, 'aria-allowed-attr'))).toBe(false);
  });

  it('removes only the invalid attribute named in the summary', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<section>\n<div aria-labeledby="h1" aria-label="ok">x</div>\n</section>');
    const result = await new AriaValidAttrFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).not.toContain('aria-labeledby');
    expect(contents).toContain('aria-label="ok"');
  });

  it('human-flags when the summary names no ARIA attribute', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div aria-labeledby="h1">x</div>');
    const result = await new AriaValidAttrFixer(dir).fix(violation(file, 1, 'something unhelpful'));
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when the invalid attribute is not on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div class="x">x</div>');
    const result = await new AriaValidAttrFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
