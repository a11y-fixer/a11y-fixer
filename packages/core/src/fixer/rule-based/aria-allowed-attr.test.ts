import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaAllowedAttrFixer, offendingAriaAttrs } from './aria-allowed-attr.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(opts: {
  file?: string;
  line?: number;
  id?: string;
  html?: string;
  failureSummary?: string;
}): A11yViolation {
  return {
    id: opts.id ?? 'aria-allowed-attr',
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'Elements must only use permitted ARIA attributes',
    helpUrl: '',
    nodes: [{
      html: opts.html ?? '<div role="button" aria-expanded="true">x</div>',
      target: ['div'],
      failureSummary: opts.failureSummary ?? 'ARIA attribute is not allowed: aria-expanded="true"',
      sourceFile: opts.file,
      sourceLine: opts.line,
      sourceColumn: 1,
    }],
  };
}

describe('offendingAriaAttrs', () => {
  it('extracts attribute names from the failure summary', () => {
    expect(offendingAriaAttrs('ARIA attribute is not allowed: aria-expanded="true"', ''))
      .toEqual(['aria-expanded']);
  });

  it('collects and de-dupes multiple attributes', () => {
    const summary = 'not allowed: aria-expanded="true", aria-pressed="false", aria-expanded="true"';
    expect(offendingAriaAttrs(summary, '').sort()).toEqual(['aria-expanded', 'aria-pressed']);
  });

  it('falls back to aria attributes in the markup when the summary is empty', () => {
    expect(offendingAriaAttrs('', '<li aria-selected="true">x</li>')).toEqual(['aria-selected']);
  });
});

describe('AriaAllowedAttrFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-allowed-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches both axe ids, not unrelated 4.1.2 rules', () => {
    const fixer = new AriaAllowedAttrFixer(dir);
    expect(fixer.canFix(violation({ id: 'aria-allowed-attr' }))).toBe(true);
    expect(fixer.canFix(violation({ id: 'aria-prohibited-attr' }))).toBe(true);
    expect(fixer.canFix(violation({ id: 'aria-hidden-body' }))).toBe(false);
  });

  it('removes the disallowed ARIA attribute on the recorded line', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<p>keep</p>\n<div role="button" aria-expanded="true" class="x">Go</div>');
    const fixer = new AriaAllowedAttrFixer(dir);

    const result = await fixer.fix(violation({ file, line: 2 }));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<p>keep</p>'); // line 1 untouched
    expect(contents).toContain('<div role="button" class="x">Go</div>');
    expect(contents).not.toContain('aria-expanded');
  });

  it('removes a prohibited aria-label (aria-prohibited-attr)', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<p aria-label="hi">text</p>');
    const fixer = new AriaAllowedAttrFixer(dir);

    const result = await fixer.fix(violation({
      file,
      line: 1,
      id: 'aria-prohibited-attr',
      html: '<p aria-label="hi">text</p>',
      failureSummary: 'ARIA attribute is not allowed: aria-label="hi"',
    }));

    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toBe('<p>text</p>');
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new AriaAllowedAttrFixer(dir);
    const result = await fixer.fix(violation({ file: undefined, line: undefined }));
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when the attribute is not on the recorded line', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<div class="x">no aria here</div>');
    const fixer = new AriaAllowedAttrFixer(dir);
    const result = await fixer.fix(violation({ file, line: 1 }));
    expect(result.bucket).toBe('human-flagged');
  });
});
