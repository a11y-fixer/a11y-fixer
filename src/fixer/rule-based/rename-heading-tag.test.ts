import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectHeadings, renameHeadingTag } from './rename-heading-tag.js';

describe('collectHeadings', () => {
  it('lists headings in document order with their 1-indexed lines', () => {
    const html = '<h1>A</h1>\n<p>x</p>\n<h2>B</h2>\n<h4>C</h4>';
    expect(collectHeadings(html)).toEqual([
      { level: 1, line: 1 },
      { level: 2, line: 3 },
      { level: 4, line: 4 },
    ]);
  });

  it('returns an empty list when there are no headings', () => {
    expect(collectHeadings('<p>no headings</p>')).toEqual([]);
  });
});

describe('renameHeadingTag', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'rename-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('renames both the opening and closing tag on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<h1>Title</h1>\n<h4>Sub</h4>');

    const after = await renameHeadingTag(file, 2, 2);

    expect(after).toBe('<h2>Sub</h2>');
    const contents = await readFile(file, 'utf8');
    expect(contents).toBe('<h1>Title</h1>\n<h2>Sub</h2>');
  });

  it('handles a heading whose open and close tags span multiple lines', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<h2>One</h2>\n<h4>\n  Multi\n</h4>');

    const after = await renameHeadingTag(file, 2, 3);

    expect(after).toBe('<h3>');
    const contents = await readFile(file, 'utf8');
    expect(contents).toBe('<h2>One</h2>\n<h3>\n  Multi\n</h3>');
  });

  it('returns null when no heading opens on that line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<h1>Title</h1>\n<p>not a heading</p>');

    expect(await renameHeadingTag(file, 2, 2)).toBeNull();
  });

  it('returns null when the file cannot be read', async () => {
    expect(await renameHeadingTag(path.join(dir, 'missing.html'), 1, 2)).toBeNull();
  });
});
