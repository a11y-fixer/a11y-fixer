import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HtmlLangValidFixer, normalizeLangTag } from './html-lang-valid.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'html-lang-valid'): A11yViolation {
  return {
    id,
    wcagId: '3.1.1',
    impact: 'serious',
    description: 'lang value must be a valid language',
    helpUrl: '',
    nodes: [{
      html: '<html lang="en_US">',
      target: ['html'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('normalizeLangTag', () => {
  it('converts underscores to hyphens and canonicalizes region casing', () => {
    expect(normalizeLangTag('en_US')).toBe('en-US');
    expect(normalizeLangTag('en-us')).toBe('en-US');
  });

  it('lowercases an all-caps primary subtag', () => {
    expect(normalizeLangTag('EN')).toBe('en');
  });

  it('returns null for an already-canonical tag (no-op)', () => {
    expect(normalizeLangTag('en')).toBeNull();
    expect(normalizeLangTag('en-US')).toBeNull();
  });

  it('returns null for empty or structurally invalid input', () => {
    expect(normalizeLangTag('')).toBeNull();
    expect(normalizeLangTag('   ')).toBeNull();
    expect(normalizeLangTag('english')).toBeNull();
    expect(normalizeLangTag('xx_yy_zz')).toBeNull();
  });
});

describe('HtmlLangValidFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'htmllangvalid-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe html-lang-valid, not other ids', () => {
    const fixer = new HtmlLangValidFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'html-has-lang'))).toBe(false);
  });

  it('canonicalizes an invalid lang value on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<!doctype html>\n<html lang="en_US">\n<head></head>');
    const fixer = new HtmlLangValidFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<html lang="en-US">');
    expect(contents).toContain('<!doctype html>'); // other lines untouched
  });

  it('handles single-quoted attributes', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, "<html lang='EN'>");
    const fixer = new HtmlLangValidFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toBe("<html lang='en'>");
  });

  it('human-flags a value it cannot canonicalize, leaving the file intact', async () => {
    const file = path.join(dir, 'index.html');
    const source = '<html lang="english">';
    await writeFile(file, source);
    const fixer = new HtmlLangValidFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
    expect(await readFile(file, 'utf8')).toBe(source);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new HtmlLangValidFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<html lang="en_US">');
    const fixer = new HtmlLangValidFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no <html lang>', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<head></head>');
    const fixer = new HtmlLangValidFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
