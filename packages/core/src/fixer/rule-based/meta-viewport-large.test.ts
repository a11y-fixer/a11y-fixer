import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MetaViewportLargeFixer } from './meta-viewport-large.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'meta-viewport-large'): A11yViolation {
  return {
    id,
    wcagId: '1.4.4',
    impact: 'minor',
    description: 'Users should be able to zoom and scale the text up to 500%',
    helpUrl: '',
    nodes: [{
      html: '<meta name="viewport" content="width=device-width, maximum-scale=1">',
      target: ['meta[name="viewport"]'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('MetaViewportLargeFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'metaviewportlarge-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe meta-viewport-large, not meta-viewport or other ids', () => {
    const fixer = new MetaViewportLargeFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'meta-viewport'))).toBe(false);
    expect(fixer.canFix(violation('x.html', 1, 'html-has-lang'))).toBe(false);
  });

  it('strips maximum-scale below 5 on the recorded line (double-quoted)', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(
      file,
      '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">\n</head>',
    );
    const fixer = new MetaViewportLargeFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('content="width=device-width, initial-scale=1"');
    expect(contents).not.toContain('maximum-scale');
    expect(contents).toContain('<head>'); // other lines untouched
  });

  it('handles single-quoted content attributes and user-scalable=no', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, "<meta name='viewport' content='width=device-width, user-scalable=no'>");
    const fixer = new MetaViewportLargeFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toBe("<meta name='viewport' content='width=device-width'>");
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new MetaViewportLargeFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no content attribute', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<meta name="viewport">');
    const fixer = new MetaViewportLargeFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the content already allows large zoom', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<meta name="viewport" content="width=device-width, initial-scale=1">');
    const fixer = new MetaViewportLargeFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
  });
});
