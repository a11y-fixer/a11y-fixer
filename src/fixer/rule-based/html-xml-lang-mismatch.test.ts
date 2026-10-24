import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HtmlXmlLangMismatchFixer, primarySubtag } from './html-xml-lang-mismatch.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'html-xml-lang-mismatch'): A11yViolation {
  return {
    id,
    wcagId: '3.1.1',
    impact: 'serious',
    description: 'lang and xml:lang must match',
    helpUrl: '',
    nodes: [{
      html: '<html lang="en" xml:lang="fr">',
      target: ['html'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('primarySubtag', () => {
  it('extracts the lower-cased primary subtag', () => {
    expect(primarySubtag('en-US')).toBe('en');
    expect(primarySubtag('FR')).toBe('fr');
    expect(primarySubtag('zh-Hant-TW')).toBe('zh');
  });

  it('returns empty string for empty input', () => {
    expect(primarySubtag('')).toBe('');
    expect(primarySubtag('   ')).toBe('');
  });
});

describe('HtmlXmlLangMismatchFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'htmlxmllang-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe html-xml-lang-mismatch, not other ids', () => {
    const fixer = new HtmlXmlLangMismatchFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'html-has-lang'))).toBe(false);
  });

  it('aligns a mismatched xml:lang to lang on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<!doctype html>\n<html lang="en" xml:lang="fr">\n<head></head>');
    const fixer = new HtmlXmlLangMismatchFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<html lang="en" xml:lang="en">');
    expect(contents).toContain('<!doctype html>'); // other lines untouched
  });

  it('handles single-quoted attributes, preserving the quote char', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, "<html lang='en' xml:lang='fr'>");
    const fixer = new HtmlXmlLangMismatchFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toBe("<html lang='en' xml:lang='en'>");
  });

  it('preserves region when aligning (copies the full lang value)', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<html lang="en-US" xml:lang="de">');
    const fixer = new HtmlXmlLangMismatchFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toBe('<html lang="en-US" xml:lang="en-US">');
  });

  it('human-flags when primary subtags already agree, leaving the file intact', async () => {
    const file = path.join(dir, 'index.html');
    const source = '<html lang="en" xml:lang="en-GB">';
    await writeFile(file, source);
    const fixer = new HtmlXmlLangMismatchFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
    expect(await readFile(file, 'utf8')).toBe(source);
  });

  it('human-flags when xml:lang is absent on the line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<html lang="en">');
    const fixer = new HtmlXmlLangMismatchFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when lang is absent on the line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<html xml:lang="fr">');
    const fixer = new HtmlXmlLangMismatchFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new HtmlXmlLangMismatchFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<html lang="en" xml:lang="fr">');
    const fixer = new HtmlXmlLangMismatchFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no <html> element', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<head></head>');
    const fixer = new HtmlXmlLangMismatchFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
