import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MetaViewportFixer, sanitizeViewportContent } from './meta-viewport.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'meta-viewport'): A11yViolation {
  return {
    id,
    wcagId: '1.4.4',
    impact: 'serious',
    description: 'Zooming and scaling must not be disabled',
    helpUrl: '',
    nodes: [{
      html: '<meta name="viewport" content="width=device-width, user-scalable=no">',
      target: ['meta[name="viewport"]'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('sanitizeViewportContent', () => {
  it('strips user-scalable=no while keeping other directives in order', () => {
    expect(sanitizeViewportContent('width=device-width, initial-scale=1, user-scalable=no'))
      .toBe('width=device-width, initial-scale=1');
  });

  it('treats user-scalable=0 and =false as disabling too', () => {
    expect(sanitizeViewportContent('width=device-width, user-scalable=0')).toBe('width=device-width');
    expect(sanitizeViewportContent('width=device-width, user-scalable=false')).toBe('width=device-width');
  });

  it('strips maximum-scale below 5', () => {
    expect(sanitizeViewportContent('width=device-width, maximum-scale=1')).toBe('width=device-width');
  });

  it('keeps maximum-scale of 5 or more', () => {
    expect(sanitizeViewportContent('width=device-width, maximum-scale=5')).toBeNull();
  });

  it('returns null when already compliant', () => {
    expect(sanitizeViewportContent('width=device-width, initial-scale=1')).toBeNull();
  });

  it('is tolerant of odd spacing and casing', () => {
    expect(sanitizeViewportContent('width=device-width ,  User-Scalable = NO '))
      .toBe('width=device-width');
  });
});

describe('MetaViewportFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'metaviewport-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe meta-viewport, not other ids', () => {
    const fixer = new MetaViewportFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'html-has-lang'))).toBe(false);
  });

  it('rewrites the content attribute on the recorded line (double-quoted)', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(
      file,
      '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">\n</head>',
    );
    const fixer = new MetaViewportFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('content="width=device-width, initial-scale=1"');
    expect(contents).not.toContain('user-scalable');
    expect(contents).toContain('<head>'); // other lines untouched
  });

  it('handles single-quoted content attributes', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, "<meta name='viewport' content='width=device-width, maximum-scale=1'>");
    const fixer = new MetaViewportFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toBe("<meta name='viewport' content='width=device-width'>");
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new MetaViewportFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no content attribute', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<meta name="viewport">');
    const fixer = new MetaViewportFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the content is already compliant', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<meta name="viewport" content="width=device-width, initial-scale=1">');
    const fixer = new MetaViewportFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.applied).toBe(false);
  });
});
