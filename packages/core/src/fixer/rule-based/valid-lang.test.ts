import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ValidLangFixer, canonicalizeLangOnLine } from './valid-lang.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'valid-lang'): A11yViolation {
  return {
    id,
    wcagId: '3.1.2',
    impact: 'serious',
    description: 'lang attribute must have a valid value',
    helpUrl: '',
    nodes: [{ html: '<span lang="en_us">hi</span>', target: ['span'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('canonicalizeLangOnLine', () => {
  it('canonicalizes a lang value', () => {
    expect(canonicalizeLangOnLine('<span lang="en_us">x</span>')).toBe('<span lang="en-US">x</span>');
  });

  it('canonicalizes xml:lang too', () => {
    expect(canonicalizeLangOnLine('<p xml:lang="FR">x</p>')).toBe('<p xml:lang="fr">x</p>');
  });

  it('returns null when already canonical', () => {
    expect(canonicalizeLangOnLine('<span lang="en-US">x</span>')).toBeNull();
  });

  it('returns null for an uncanonicalizable value', () => {
    expect(canonicalizeLangOnLine('<span lang="english">x</span>')).toBeNull();
  });

  it('returns null when there is no lang attribute', () => {
    expect(canonicalizeLangOnLine('<span class="x">y</span>')).toBeNull();
  });
});

describe('ValidLangFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'valid-lang-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches valid-lang, not html-lang-valid', () => {
    const fixer = new ValidLangFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'html-lang-valid'))).toBe(false);
  });

  it('canonicalizes the lang on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<p>a</p>\n<span lang="en_us">hi</span>\n<p>b</p>');
    const result = await new ValidLangFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    expect(await readFile(file, 'utf8')).toContain('<span lang="en-US">hi</span>');
  });

  it('human-flags an uncanonicalizable value', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<span lang="english">hi</span>');
    const result = await new ValidLangFixer(dir).fix(violation(file, 1));
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when there is no source location', async () => {
    const result = await new ValidLangFixer(dir).fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
  });
});
