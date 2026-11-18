import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HeadingOrderFixer } from './heading-order.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(opts: {
  id?: string;
  html?: string;
  file?: string;
  line?: number;
}): A11yViolation {
  return {
    id: opts.id ?? 'heading-order',
    wcagId: '2.4.6',
    impact: 'moderate',
    description: 'Heading levels should only increase by one',
    helpUrl: '',
    nodes: [{
      html: opts.html ?? '<h4>Sub</h4>',
      target: ['h4'],
      failureSummary: '',
      sourceFile: opts.file,
      sourceLine: opts.line,
      sourceColumn: 1,
    }],
  };
}

describe('HeadingOrderFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'headingorder-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe heading-order, not the jsx-a11y path or other ids', () => {
    const fixer = new HeadingOrderFixer(dir);
    expect(fixer.canFix(violation({ id: 'heading-order' }))).toBe(true);
    expect(fixer.canFix(violation({ id: 'jsx-a11y/heading-has-content' }))).toBe(false);
    expect(fixer.canFix(violation({ id: 'button-name' }))).toBe(false);
  });

  it('demotes a level-skipping heading to previousLevel + 1', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<h1>Title</h1>\n<h2>Section</h2>\n<h4>Sub</h4>');
    const fixer = new HeadingOrderFixer(dir);

    const result = await fixer.fix(violation({ file, line: 3 }));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    expect(result.description).toContain('<h3>');
    const contents = await readFile(file, 'utf8');
    expect(contents).toBe('<h1>Title</h1>\n<h2>Section</h2>\n<h3>Sub</h3>');
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new HeadingOrderFixer(dir);
    const result = await fixer.fix(violation({}));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags the first heading on the page (nothing precedes it)', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<h3>Only heading</h3>');
    const fixer = new HeadingOrderFixer(dir);

    const result = await fixer.fix(violation({ file, line: 1, html: '<h3>Only heading</h3>' }));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when no heading sits on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<h1>Title</h1>\n<p>not a heading</p>');
    const fixer = new HeadingOrderFixer(dir);

    const result = await fixer.fix(violation({ file, line: 2 }));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
