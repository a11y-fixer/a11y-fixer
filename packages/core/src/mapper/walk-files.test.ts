import { describe, it, expect, afterEach } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectFiles } from './walk-files.js';

const tmpDirs: string[] = [];
afterEach(async () => {
  await Promise.all(tmpDirs.splice(0).map(d => rm(d, { recursive: true, force: true })));
});

async function scaffold(tree: Record<string, string>): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'walk-files-'));
  tmpDirs.push(root);
  for (const [rel, content] of Object.entries(tree)) {
    const full = path.join(root, rel);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, content);
  }
  return root;
}

describe('collectFiles', () => {
  it('collects matching files recursively', async () => {
    const root = await scaffold({
      'a.html': '', 'nested/b.html': '', 'nested/deep/c.html': '', 'd.txt': '',
    });
    const found = await collectFiles(root, /\.html?$/i);
    expect(found.map(f => path.relative(root, f)).sort()).toEqual(
      [path.join('nested', 'b.html'), path.join('nested', 'deep', 'c.html'), 'a.html'].sort(),
    );
  });

  it('applies the extension filter (skips non-matching files)', async () => {
    const root = await scaffold({ 'keep.tsx': '', 'skip.ts': '', 'skip.js': '' });
    const found = await collectFiles(root, /\.tsx$/);
    expect(found.map(f => path.basename(f))).toEqual(['keep.tsx']);
  });

  it('skips node_modules, dist, and dotfiles/dirs', async () => {
    const root = await scaffold({
      'src.html': '',
      'node_modules/pkg.html': '',
      'dist/out.html': '',
      '.hidden/secret.html': '',
      '.dotfile.html': '',
    });
    const found = await collectFiles(root, /\.html?$/i);
    expect(found.map(f => path.basename(f))).toEqual(['src.html']);
  });

  it('returns an empty array for a missing directory', async () => {
    const found = await collectFiles(path.join(tmpdir(), 'does-not-exist-xyz'), /\.html?$/i);
    expect(found).toEqual([]);
  });
});
