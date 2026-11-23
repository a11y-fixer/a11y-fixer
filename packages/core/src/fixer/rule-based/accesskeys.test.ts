import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AccesskeysFixer, removeAccesskey } from './accesskeys.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'accesskeys'): A11yViolation {
  return {
    id,
    wcagId: '2.1.1',
    impact: 'serious',
    description: 'accesskey attribute value must be unique',
    helpUrl: '',
    nodes: [{ html: '<a accesskey="s" href="/">x</a>', target: ['a'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeAccesskey', () => {
  it('removes the accesskey attribute', () => {
    expect(removeAccesskey('<a accesskey="s" href="/">y</a>')).toBe('<a href="/">y</a>');
  });

  it('returns null when there is no accesskey', () => {
    expect(removeAccesskey('<a href="/">y</a>')).toBeNull();
  });
});

describe('AccesskeysFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'accesskeys-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AccesskeysFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'tabindex'))).toBe(false);
  });

  it('removes a duplicate accesskey on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<nav>\n<a accesskey="s" href="/">x</a>\n</nav>');
    const result = await new AccesskeysFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<a href="/">x</a>');
    expect(contents).not.toContain('accesskey');
  });

  it('human-flags when there is no accesskey to remove', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<a href="/">x</a>');
    const result = await new AccesskeysFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
