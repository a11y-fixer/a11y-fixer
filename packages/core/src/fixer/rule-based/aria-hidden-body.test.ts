import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaHiddenBodyFixer, removeAriaHidden } from './aria-hidden-body.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'aria-hidden-body'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'critical',
    description: 'aria-hidden="true" must not be present on the document body',
    helpUrl: '',
    nodes: [{
      html: '<body aria-hidden="true">',
      target: ['body'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('removeAriaHidden', () => {
  it('removes aria-hidden="true" while preserving other attributes', () => {
    expect(removeAriaHidden('<body aria-hidden="true" class="app">'))
      .toBe('<body class="app">');
  });

  it('removes a valueless aria-hidden', () => {
    expect(removeAriaHidden('<body aria-hidden>')).toBe('<body>');
  });

  it('removes aria-hidden with single quotes', () => {
    expect(removeAriaHidden("<body aria-hidden='true'>")).toBe('<body>');
  });

  it('returns null when there is no aria-hidden', () => {
    expect(removeAriaHidden('<body class="app">')).toBeNull();
  });

  it('returns null when there is no body tag', () => {
    expect(removeAriaHidden('<div aria-hidden="true">x</div>')).toBeNull();
  });
});

describe('AriaHiddenBodyFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-hidden-body-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not other ids', () => {
    const fixer = new AriaHiddenBodyFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-hidden-focus'))).toBe(false);
  });

  it('removes aria-hidden on the recorded line, leaving other lines untouched', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<html>\n<body aria-hidden="true" class="app">\n</body>\n</html>');
    const fixer = new AriaHiddenBodyFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<body class="app">');
    expect(contents).not.toContain('aria-hidden');
    expect(contents).toContain('<html>'); // other lines untouched
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new AriaHiddenBodyFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<body aria-hidden="true">');
    const fixer = new AriaHiddenBodyFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the <body> has no aria-hidden', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<body class="app">');
    const fixer = new AriaHiddenBodyFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
