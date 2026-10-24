import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ScrollableRegionFocusableFixer, addTabindexZero } from './scrollable-region-focusable.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'scrollable-region-focusable'): A11yViolation {
  return {
    id,
    wcagId: '2.1.1',
    impact: 'serious',
    description: 'Scrollable region must have keyboard access',
    helpUrl: '',
    nodes: [{
      html: '<div class="scroll">content</div>',
      target: ['div.scroll'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('addTabindexZero', () => {
  it('inserts tabindex on a tag with no attributes', () => {
    expect(addTabindexZero('<div>x</div>')).toBe('<div tabindex="0">x</div>');
  });

  it('inserts tabindex while preserving existing attributes', () => {
    expect(addTabindexZero('<div class="scroll" id="a">x</div>'))
      .toBe('<div tabindex="0" class="scroll" id="a">x</div>');
  });

  it('preserves a self-closing tag', () => {
    expect(addTabindexZero('<section />')).toBe('<section tabindex="0" />');
  });

  it('returns null when a tabindex is already present', () => {
    expect(addTabindexZero('<div tabindex="-1">x</div>')).toBeNull();
  });

  it('returns null when there is no opening tag', () => {
    expect(addTabindexZero('  plain text, no tag')).toBeNull();
  });
});

describe('ScrollableRegionFocusableFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'scrollable-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not other ids', () => {
    const fixer = new ScrollableRegionFocusableFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'tabindex'))).toBe(false);
  });

  it('adds tabindex on the recorded line, leaving other lines untouched', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<div class="scroll">content</div>\n</main>');
    const fixer = new ScrollableRegionFocusableFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<div tabindex="0" class="scroll">content</div>');
    expect(contents).toContain('<main>'); // other lines untouched
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new ScrollableRegionFocusableFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div class="scroll">content</div>');
    const fixer = new ScrollableRegionFocusableFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line already has a tabindex', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div class="scroll" tabindex="-1">content</div>');
    const fixer = new ScrollableRegionFocusableFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no opening tag', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, 'just some text');
    const fixer = new ScrollableRegionFocusableFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
