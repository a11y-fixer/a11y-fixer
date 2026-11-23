import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LinkInTextBlockFixer, addUnderlineToLink } from './link-in-text-block.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'link-in-text-block'): A11yViolation {
  return {
    id,
    wcagId: '1.4.1',
    impact: 'serious',
    description: 'Links must be distinguishable without relying on color',
    helpUrl: '',
    nodes: [{
      html: '<a href="/x">here</a>',
      target: ['a'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('addUnderlineToLink', () => {
  it('adds a style attribute to a link that has none', () => {
    expect(addUnderlineToLink('<a href="/x">here</a>'))
      .toBe('<a style="text-decoration: underline" href="/x">here</a>');
  });

  it('merges into an existing style attribute', () => {
    expect(addUnderlineToLink('<a href="/x" style="color: blue">here</a>'))
      .toBe('<a href="/x" style="color: blue; text-decoration: underline">here</a>');
  });

  it('replaces text-decoration: none', () => {
    expect(addUnderlineToLink('<a style="text-decoration: none">x</a>'))
      .toBe('<a style="text-decoration: underline">x</a>');
  });

  it('returns null when the link already underlines inline', () => {
    expect(addUnderlineToLink('<a style="text-decoration: underline">x</a>')).toBeNull();
  });

  it('returns null when there is no anchor on the line', () => {
    expect(addUnderlineToLink('<span>no link</span>')).toBeNull();
  });
});

describe('LinkInTextBlockFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'link-text-block-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not other ids', () => {
    const fixer = new LinkInTextBlockFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'link-name'))).toBe(false);
  });

  it('underlines the link on the recorded line, leaving others untouched', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<p>intro</p>\n<p>read <a href="/x">here</a> now</p>');
    const fixer = new LinkInTextBlockFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<p>intro</p>');
    expect(contents).toContain('<a style="text-decoration: underline" href="/x">here</a>');
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new LinkInTextBlockFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags a link already underlined inline (styling is elsewhere)', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<a style="text-decoration: underline" href="/x">here</a>');
    const fixer = new LinkInTextBlockFixer(dir);
    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
