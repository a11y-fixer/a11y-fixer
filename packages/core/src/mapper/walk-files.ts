import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Recursively collects files under `dir` whose name matches `test`, skipping
 * node_modules, dist, and dotfiles. Shared by the source mappers so JSX and HTML
 * traversal stay identical.
 */
export async function collectFiles(dir: string, test: RegExp): Promise<string[]> {
  const out: string[] = [];
  await walk(dir, test, out);
  return out;
}

async function walk(dir: string, test: RegExp, out: string[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    const s = await stat(full).catch(() => null);
    if (!s) continue;
    if (s.isDirectory()) {
      await walk(full, test, out);
    } else if (test.test(entry)) {
      out.push(full);
    }
  }
}
