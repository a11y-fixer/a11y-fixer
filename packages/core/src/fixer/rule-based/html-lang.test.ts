import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HtmlLangFixer } from './html-lang.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'html-has-lang'): A11yViolation {
  return {
    id,
    wcagId: '3.1.1',
    impact: 'serious',
    description: '<html> element must have a lang attribute',
    helpUrl: '',
    nodes: [{
      html: '<html>',
      target: ['html'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('HtmlLangFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'htmllang-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe html-has-lang, not the jsx-a11y path or other ids', () => {
    const fixer = new HtmlLangFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'jsx-a11y/html-has-lang'))).toBe(false);
    expect(fixer.canFix(violation('x.html', 1, 'button-name'))).toBe(false);
  });

  it('adds lang="en" to <html> on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<!doctype html>\n<html>\n<head></head>\n</html>');
    const fixer = new HtmlLangFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<!doctype html>'); // line 1 untouched
    expect(contents).toContain('<html lang="en">');
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new HtmlLangFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the <html> tag is not on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<!doctype html>\n<body></body>');
    const fixer = new HtmlLangFixer(dir);

    const result = await fixer.fix(violation(file, 2));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
