import { describe, it, expect, afterEach } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HtmlMapper } from './html.js';
import type { A11yNode } from '../detector/index.js';

const tmpDirs: string[] = [];
afterEach(async () => {
  await Promise.all(tmpDirs.splice(0).map(d => rm(d, { recursive: true, force: true })));
});

async function withHtml(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'html-mapper-'));
  tmpDirs.push(root);
  for (const [name, content] of Object.entries(files)) {
    await writeFile(path.join(root, name), content);
  }
  return root;
}

function node(html: string): A11yNode {
  return { html, target: [], failureSummary: '' };
}

describe('HtmlMapper', () => {
  it('locates an element in the .html source and returns its file + line', async () => {
    const root = await withHtml({
      'page.html': '<!doctype html>\n<html>\n<body>\n  <img src="logo.png">\n</body>\n</html>\n',
    });
    const loc = await new HtmlMapper(root).locate(node('<img src="logo.png">'));
    expect(loc?.file).toBe(path.join(root, 'page.html'));
    expect(loc?.line).toBe(4);
  });

  it('searches across multiple files until a match is found', async () => {
    const root = await withHtml({
      'a.html': '<html><body><p>nothing here</p></body></html>',
      'b.html': '<html><body>\n  <input type="text" placeholder="Email">\n</body></html>',
    });
    const loc = await new HtmlMapper(root).locate(
      node('<input type="text" placeholder="Email">'),
    );
    expect(loc?.file).toBe(path.join(root, 'b.html'));
  });

  it('returns null when no file contains the element', async () => {
    const root = await withHtml({ 'a.html': '<html><body><p>hi</p></body></html>' });
    const loc = await new HtmlMapper(root).locate(node('<img src="missing.png">'));
    expect(loc).toBeNull();
  });

  it('returns null when the directory has no HTML files', async () => {
    const root = await withHtml({ 'notes.txt': '<img src="logo.png">' });
    const loc = await new HtmlMapper(root).locate(node('<img src="logo.png">'));
    expect(loc).toBeNull();
  });
});
