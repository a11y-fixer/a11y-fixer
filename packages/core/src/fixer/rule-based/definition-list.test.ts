import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DefinitionListFixer, fixDefinitionList, fixDlItem } from './definition-list.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'definition-list'): A11yViolation {
  return {
    id,
    wcagId: '1.3.1',
    impact: 'serious',
    description: 'dl structure must be valid',
    helpUrl: '',
    nodes: [{
      html: '<dl>',
      target: ['dl'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('fixDefinitionList', () => {
  it('renames a plain span wrapper of dt/dd to div', () => {
    const src = '<dl>\n<span><dt>Term</dt><dd>Def</dd></span>\n</dl>';
    const out = fixDefinitionList(src, 1);
    expect(out).toContain('<div><dt>Term</dt><dd>Def</dd></div>');
    expect(out).not.toContain('<span>');
  });

  it('returns null when a stray child is not a safe term wrapper', () => {
    const src = '<dl>\n<p>loose text</p>\n</dl>';
    expect(fixDefinitionList(src, 1)).toBeNull();
  });

  it('returns null when there is no offending child', () => {
    const src = '<dl>\n<dt>Term</dt><dd>Def</dd>\n</dl>';
    expect(fixDefinitionList(src, 1)).toBeNull();
  });
});

describe('fixDlItem', () => {
  it('renames a plain div wrapper of orphan dt/dd to dl', () => {
    const src = '<div><dt>Term</dt><dd>Def</dd></div>';
    expect(fixDlItem(src, 1)).toBe('<dl><dt>Term</dt><dd>Def</dd></dl>');
  });

  it('returns null when the parent has a role', () => {
    const src = '<div role="list"><dt>Term</dt><dd>Def</dd></div>';
    expect(fixDlItem(src, 1)).toBeNull();
  });

  it('returns null when siblings are mixed', () => {
    const src = '<div><dt>Term</dt><p>nope</p></div>';
    expect(fixDlItem(src, 1)).toBeNull();
  });
});

describe('DefinitionListFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'deflist-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches both ids, not other 1.3.1 rules', () => {
    const fixer = new DefinitionListFixer(dir);
    expect(fixer.canFix(violation('x.html', 1, 'definition-list'))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'dlitem'))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'list'))).toBe(false);
  });

  it('repairs an orphan dt/dd wrapper (dlitem) on the recorded line', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<div><dt>Term</dt><dd>Def</dd></div>');
    const fixer = new DefinitionListFixer(dir);

    const result = await fixer.fix(violation(file, 1, 'dlitem'));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    expect(await readFile(file, 'utf8')).toBe('<dl><dt>Term</dt><dd>Def</dd></dl>');
  });

  it('human-flags when the structure is ambiguous', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<dl>\n<p>loose</p>\n</dl>');
    const fixer = new DefinitionListFixer(dir);
    const result = await fixer.fix(violation(file, 1, 'definition-list'));
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new DefinitionListFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
  });
});
