import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { TabindexFixer, normalizeTabindex } from './tabindex.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'tabindex'): A11yViolation {
  return {
    id,
    wcagId: '2.4.3',
    impact: 'serious',
    description: 'Elements should not have tabindex greater than zero',
    helpUrl: '',
    nodes: [{
      html: '<button tabindex="3">Save</button>',
      target: ['button'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('normalizeTabindex', () => {
  it('rewrites positive values to 0', () => {
    expect(normalizeTabindex('3')).toBe('0');
    expect(normalizeTabindex('1')).toBe('0');
  });

  it('is tolerant of surrounding whitespace', () => {
    expect(normalizeTabindex(' 2 ')).toBe('0');
  });

  it('returns null when already compliant', () => {
    expect(normalizeTabindex('0')).toBeNull();
    expect(normalizeTabindex('-1')).toBeNull();
  });

  it('returns null for empty or non-numeric values', () => {
    expect(normalizeTabindex('')).toBeNull();
    expect(normalizeTabindex('abc')).toBeNull();
  });
});

describe('TabindexFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'tabindex-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe tabindex, not other ids', () => {
    const fixer = new TabindexFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'meta-viewport'))).toBe(false);
  });

  it('rewrites a positive tabindex on the recorded line (double-quoted)', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div>\n<button tabindex="3">Save</button>\n</div>');
    const fixer = new TabindexFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<button tabindex="0">Save</button>');
    expect(contents).toContain('<div>'); // other lines untouched
  });

  it('handles single-quoted tabindex attributes', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, "<button tabindex='5'>Go</button>");
    const fixer = new TabindexFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toBe("<button tabindex='0'>Go</button>");
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new TabindexFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no tabindex attribute', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<button>Save</button>');
    const fixer = new TabindexFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the tabindex is already compliant', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<button tabindex="0">Save</button>');
    const fixer = new TabindexFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
  });
});
