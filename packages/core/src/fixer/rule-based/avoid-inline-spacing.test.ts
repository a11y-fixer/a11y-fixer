import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AvoidInlineSpacingFixer, stripSpacingImportant } from './avoid-inline-spacing.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'avoid-inline-spacing'): A11yViolation {
  return {
    id,
    wcagId: '1.4.12',
    impact: 'serious',
    description: 'Inline text spacing must not be !important',
    helpUrl: '',
    nodes: [{ html: '<p style="line-height: 2 !important">x</p>', target: ['p'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('stripSpacingImportant', () => {
  it('relaxes !important on line-height', () => {
    expect(stripSpacingImportant('<p style="line-height: 2 !important">x</p>')).toBe(
      '<p style="line-height: 2">x</p>',
    );
  });

  it('relaxes !important on letter-spacing and word-spacing', () => {
    expect(stripSpacingImportant('<p style="letter-spacing: 1px !important">x</p>')).toBe(
      '<p style="letter-spacing: 1px">x</p>',
    );
    expect(stripSpacingImportant('<p style="word-spacing:3px!important">x</p>')).toBe(
      '<p style="word-spacing:3px">x</p>',
    );
  });

  it('preserves the declared value and other declarations', () => {
    expect(
      stripSpacingImportant('<p style="color: red !important; line-height: 2 !important">x</p>'),
    ).toBe('<p style="color: red !important; line-height: 2">x</p>');
  });

  it('handles single-quoted style attributes', () => {
    expect(stripSpacingImportant("<p style='line-height: 2 !important'>x</p>")).toBe(
      "<p style='line-height: 2'>x</p>",
    );
  });

  it('returns null when no spacing property is !important', () => {
    expect(stripSpacingImportant('<p style="line-height: 2; color: red !important">x</p>')).toBeNull();
    expect(stripSpacingImportant('<p>x</p>')).toBeNull();
  });
});

describe('AvoidInlineSpacingFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'inline-spacing-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AvoidInlineSpacingFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'color-contrast'))).toBe(false);
  });

  it('relaxes !important on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<p style="line-height: 2 !important">x</p>\n</main>');
    const result = await new AvoidInlineSpacingFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<p style="line-height: 2">x</p>');
    expect(contents).not.toContain('!important');
  });

  it('human-flags when there is no !important spacing to relax', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<p style="line-height: 2">x</p>');
    const result = await new AvoidInlineSpacingFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
