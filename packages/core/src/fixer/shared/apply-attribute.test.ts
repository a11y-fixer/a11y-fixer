import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { addAttributeToElement } from './apply-attribute.js';

describe('addAttributeToElement', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'applyattr-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('inserts the attribute right after the tag name', async () => {
    const file = path.join(dir, 'a.tsx');
    await writeFile(file, '<button onClick={x}>hi</button>');
    const out = await addAttributeToElement(file, 1, /<button(\s|>)/g, 'aria-label', 'Go');

    expect(out).toBe('<button aria-label="Go" onClick={x}>hi</button>');
    expect(await readFile(file, 'utf8')).toContain('aria-label="Go"');
  });

  it('handles a tagname-adjacent closing bracket', async () => {
    const file = path.join(dir, 'a.tsx');
    await writeFile(file, '<button>x</button>');
    const out = await addAttributeToElement(file, 1, /<button(\s|>)/g, 'aria-label', 'Go');
    expect(out).toBe('<button aria-label="Go">x</button>');
  });

  it('escapes quotes and ampersands in the value', async () => {
    const file = path.join(dir, 'a.tsx');
    await writeFile(file, '<img src="x" />');
    await addAttributeToElement(file, 1, /<img(\s)/g, 'alt', 'Tom & "Jerry"');
    expect(await readFile(file, 'utf8')).toContain('alt="Tom &amp; &quot;Jerry&quot;"');
  });

  it('returns null when the pattern does not match the line', async () => {
    const file = path.join(dir, 'a.tsx');
    await writeFile(file, 'const x = 1;');
    const out = await addAttributeToElement(file, 1, /<button(\s|>)/g, 'aria-label', 'Go');
    expect(out).toBeNull();
    expect(await readFile(file, 'utf8')).toBe('const x = 1;');
  });

  it('returns null for an out-of-range line', async () => {
    const file = path.join(dir, 'a.tsx');
    await writeFile(file, '<button>x</button>');
    expect(await addAttributeToElement(file, 5, /<button(\s|>)/g, 'aria-label', 'Go')).toBeNull();
  });

  it('returns null for a missing file', async () => {
    expect(await addAttributeToElement(path.join(dir, 'nope.tsx'), 1, /<button(\s|>)/g, 'aria-label', 'Go')).toBeNull();
  });
});
