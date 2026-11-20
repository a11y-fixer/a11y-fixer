import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sanitizeInlineLabel, rewriteLine, locateAtColumn, writeReplacement } from './markdown-source.js';

describe('sanitizeInlineLabel', () => {
  it('collapses newlines and escapes backslashes then brackets', () => {
    expect(sanitizeInlineLabel('a\nb')).toBe('a b');
    expect(sanitizeInlineLabel('a]b[c')).toBe('a\\]b\\[c');
    expect(sanitizeInlineLabel('a\\b')).toBe('a\\\\b');
  });
});

async function withFile(content: string, fn: (file: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(tmpdir(), 'md-src-'));
  const file = path.join(dir, 'doc.md');
  await writeFile(file, content);
  try {
    await fn(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe('rewriteLine', () => {
  it('rewrites one line and leaves the rest intact', async () => {
    await withFile('one\ntwo\nthree\n', async (file) => {
      const out = await rewriteLine(file, 2, (c) => c.toUpperCase());
      expect(out).toBe('TWO');
      expect(await readFile(file, 'utf8')).toBe('one\nTWO\nthree\n');
    });
  });
  it('aborts without writing when transform returns null', async () => {
    await withFile('one\ntwo\n', async (file) => {
      const out = await rewriteLine(file, 1, () => null);
      expect(out).toBeNull();
      expect(await readFile(file, 'utf8')).toBe('one\ntwo\n');
    });
  });
  it('returns null for a missing line', async () => {
    await withFile('one\n', async (file) => {
      expect(await rewriteLine(file, 99, (c) => c)).toBeNull();
    });
  });
});

describe('locateAtColumn + writeReplacement', () => {
  it('splices at the recorded column only', async () => {
    await withFile('a ![](x.png) b ![](y.png)\n', async (file) => {
      const located = await locateAtColumn(file, 1, 16, /^!\[\s*\]\(([^)]+)\)/);
      expect(located).not.toBeNull();
      await writeReplacement(file, located!, '![alt](y.png)');
      expect(await readFile(file, 'utf8')).toBe('a ![](x.png) b ![alt](y.png)\n');
    });
  });
});
