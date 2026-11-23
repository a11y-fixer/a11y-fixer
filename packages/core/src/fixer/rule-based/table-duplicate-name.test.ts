import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { TableDuplicateNameFixer, removeDuplicateTableSummary } from './table-duplicate-name.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'table-duplicate-name'): A11yViolation {
  return {
    id,
    wcagId: '1.3.1',
    impact: 'minor',
    description: 'table summary duplicates caption',
    helpUrl: '',
    nodes: [{ html: '<table summary="Sales">', target: ['table'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeDuplicateTableSummary', () => {
  it('removes summary from a table tag', () => {
    expect(removeDuplicateTableSummary('<table summary="Sales" class="x">')).toBe('<table class="x">');
  });
  it('returns null on a non-table line', () => {
    expect(removeDuplicateTableSummary('<div summary="x">')).toBeNull();
  });
  it('returns null when there is no summary', () => {
    expect(removeDuplicateTableSummary('<table class="x">')).toBeNull();
  });
});

describe('TableDuplicateNameFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'table-dup-name-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new TableDuplicateNameFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'empty-table-header'))).toBe(false);
  });

  it('removes the redundant summary', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div>\n<table summary="Sales"><caption>Sales</caption></table>\n</div>');
    const result = await new TableDuplicateNameFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).not.toContain('summary=');
  });

  it('human-flags when there is no summary', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<table><caption>Sales</caption></table>');
    const result = await new TableDuplicateNameFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
