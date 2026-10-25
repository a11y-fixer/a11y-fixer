import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ListFixer, fixList, fixListItem } from './list.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'list'): A11yViolation {
  return {
    id,
    wcagId: '1.3.1',
    impact: 'moderate',
    description: 'Lists must be structured correctly',
    helpUrl: '',
    nodes: [{
      html: '<ul><div>item</div></ul>',
      target: ['ul'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('fixList', () => {
  it('renames a stray grouping child to <li>', () => {
    expect(fixList('<ul>\n<div>a</div>\n</ul>', 1))
      .toBe('<ul>\n<li>a</li>\n</ul>');
  });

  it('renames every stray child, preserving attributes', () => {
    expect(fixList('<ul>\n<div class="x">a</div>\n<p>b</p>\n</ul>', 1))
      .toBe('<ul>\n<li class="x">a</li>\n<li>b</li>\n</ul>');
  });

  it('works on <ol> too', () => {
    expect(fixList('<ol>\n<span>a</span>\n</ol>', 1))
      .toBe('<ol>\n<li>a</li>\n</ol>');
  });

  it('returns null when every direct child is already an <li>', () => {
    expect(fixList('<ul>\n<li>a</li>\n</ul>', 1)).toBeNull();
  });

  it('returns null when a stray child is interactive', () => {
    expect(fixList('<ul>\n<a href="/x">a</a>\n</ul>', 1)).toBeNull();
  });

  it('returns null when a stray grouping child carries a role', () => {
    expect(fixList('<ul>\n<div role="presentation">a</div>\n</ul>', 1)).toBeNull();
  });

  it('returns null when there is no list opening on the line', () => {
    expect(fixList('<div>\n<ul><li>a</li></ul>\n</div>', 1)).toBeNull();
  });
});

describe('fixListItem', () => {
  it('renames a plain wrapper of only <li>s to <ul>', () => {
    expect(fixListItem('<div>\n<li>a</li>\n<li>b</li>\n</div>', 2))
      .toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>');
  });

  it('renames a <span> wrapper too', () => {
    expect(fixListItem('<span>\n<li>a</li>\n</span>', 2))
      .toBe('<ul>\n<li>a</li>\n</ul>');
  });

  it('returns null when the wrapper carries a role', () => {
    expect(fixListItem('<div role="menu">\n<li>a</li>\n</div>', 2)).toBeNull();
  });

  it('returns null when the wrapper has non-<li> siblings', () => {
    expect(fixListItem('<div>\n<li>a</li>\n<p>b</p>\n</div>', 2)).toBeNull();
  });

  it('returns null when the parent is not a plain grouping element', () => {
    expect(fixListItem('<section>\n<li>a</li>\n</section>', 2)).toBeNull();
  });

  it('returns null when there is no <li> opening on the line', () => {
    expect(fixListItem('<div>\n<p>a</p>\n</div>', 2)).toBeNull();
  });
});

describe('ListFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'list-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the list axe ids, not another id', () => {
    const fixer = new ListFixer(dir);
    expect(fixer.canFix(violation('x.html', 1, 'list'))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'listitem'))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'image-alt'))).toBe(false);
  });

  it('repairs a list, leaving other lines untouched', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<ul>\n<div>a</div>\n</ul>\n</main>');
    const fixer = new ListFixer(dir);

    const result = await fixer.fix(violation(file, 2, 'list'));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<li>a</li>');
    expect(contents).toContain('<main>'); // other lines untouched
  });

  it('repairs orphan list items by wrapping them in a <ul>', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div>\n<li>a</li>\n<li>b</li>\n</div>');
    const fixer = new ListFixer(dir);

    const result = await fixer.fix(violation(file, 2, 'listitem'));

    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>');
  });

  it('human-flags when there is no node data', async () => {
    const fixer = new ListFixer(dir);
    const bare = violation(undefined, undefined);
    bare.nodes = [];
    const result = await fixer.fix(bare);
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new ListFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the source file cannot be read', async () => {
    const fixer = new ListFixer(dir);
    const result = await fixer.fix(violation(path.join(dir, 'missing.html'), 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<ul>\n<div>a</div>\n</ul>');
    const fixer = new ListFixer(dir);

    const result = await fixer.fix(violation(file, 99, 'list'));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the structure is not deterministically fixable', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<ul>\n<a href="/x">a</a>\n</ul>');
    const fixer = new ListFixer(dir);

    const result = await fixer.fix(violation(file, 1, 'list'));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
