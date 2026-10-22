import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ReactJSXMapper } from './react-jsx.js';
import type { A11yNode } from '../detector/index.js';

function node(html: string): A11yNode {
  return { html, target: [], failureSummary: '' };
}

describe('ReactJSXMapper', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'mapper-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  describe('data-__source parsing', () => {
    it('parses file, line and column from the source attribute', async () => {
      const mapper = new ReactJSXMapper(dir);
      const loc = await mapper.locate(node('<img data-__source="src/App.tsx:12:5" />'));
      expect(loc).toEqual({ file: 'src/App.tsx', line: 12, column: 5 });
    });

    it('keeps colons that belong to the filename (e.g. Windows paths)', async () => {
      const mapper = new ReactJSXMapper(dir);
      const loc = await mapper.locate(node('<img data-__source="C:/proj/App.tsx:3:1" />'));
      expect(loc).toEqual({ file: 'C:/proj/App.tsx', line: 3, column: 1 });
    });

    it('does not parse a two-segment value lacking an explicit column', async () => {
      // The parser treats the value as file:line:col; with only file:line the
      // "line" segment resolves to the filename (NaN), so it falls through to
      // the fingerprint search, which finds nothing in an empty dir.
      const mapper = new ReactJSXMapper(dir);
      const loc = await mapper.locate(node('<img data-__source="App.tsx:7" />'));
      expect(loc).toBeNull();
    });

    it('ignores a source attribute with a non-numeric line (empty dir → null)', async () => {
      const mapper = new ReactJSXMapper(dir);
      // Invalid line → source-attr parse returns null; fingerprint search over an
      // empty dir then finds nothing.
      const loc = await mapper.locate(node('<img data-__source="App.tsx:abc" />'));
      expect(loc).toBeNull();
    });
  });

  describe('fingerprint fallback', () => {
    it('matches a tag + inner text when no source attribute is present', async () => {
      await writeFile(path.join(dir, 'App.tsx'), 'const x = 1;\n<button>Click me</button>\n');
      const mapper = new ReactJSXMapper(dir);
      const loc = await mapper.locate(node('<button>Click me</button>'));
      expect(loc).toEqual({ file: path.join(dir, 'App.tsx'), line: 2, column: 1 });
    });

    it('matches a capitalized component against a lowercase DOM tag', async () => {
      await writeFile(path.join(dir, 'App.tsx'), '<Button>Learn more here</Button>\n');
      const mapper = new ReactJSXMapper(dir);
      const loc = await mapper.locate(node('<button>Learn more here</button>'));
      expect(loc?.file).toBe(path.join(dir, 'App.tsx'));
      expect(loc?.line).toBe(1);
    });

    it('skips node_modules, dist and dotfiles and only reads .tsx/.jsx', async () => {
      const marker = '<button>Shared label</button>';
      await mkdir(path.join(dir, 'node_modules'));
      await writeFile(path.join(dir, 'node_modules', 'Bad.tsx'), marker);
      await mkdir(path.join(dir, 'dist'));
      await writeFile(path.join(dir, 'dist', 'Bad.tsx'), marker);
      await writeFile(path.join(dir, 'ignored.ts'), marker); // not tsx/jsx
      await mkdir(path.join(dir, 'src'));
      await writeFile(path.join(dir, 'src', 'Good.tsx'), marker);

      const mapper = new ReactJSXMapper(dir);
      const loc = await mapper.locate(node(marker));
      expect(loc?.file).toBe(path.join(dir, 'src', 'Good.tsx'));
    });

    it('returns null when the html has no tag', async () => {
      await writeFile(path.join(dir, 'App.tsx'), '<button>Click me</button>');
      const mapper = new ReactJSXMapper(dir);
      expect(await mapper.locate(node('plain text, no tag'))).toBeNull();
    });

    it('returns null when nothing in the tree matches', async () => {
      await writeFile(path.join(dir, 'App.tsx'), '<div>something else</div>');
      const mapper = new ReactJSXMapper(dir);
      expect(await mapper.locate(node('<button>Unfindable text</button>'))).toBeNull();
    });
  });
});
