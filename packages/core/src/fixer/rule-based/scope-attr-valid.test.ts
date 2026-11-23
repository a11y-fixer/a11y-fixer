import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ScopeAttrValidFixer, normalizeScope, fixScopeOnLine } from './scope-attr-valid.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'scope-attr-valid'): A11yViolation {
  return {
    id,
    wcagId: '1.3.1',
    impact: 'moderate',
    description: 'scope attribute must be valid',
    helpUrl: '',
    nodes: [{ html: '<th scope="column">x</th>', target: ['th'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('normalizeScope', () => {
  it('maps column → col and rows → row', () => {
    expect(normalizeScope('column')).toBe('col');
    expect(normalizeScope('rows')).toBe('row');
    expect(normalizeScope('COLUMNS')).toBe('col');
  });

  it('returns null for an already-valid value', () => {
    expect(normalizeScope('col')).toBeNull();
    expect(normalizeScope('rowgroup')).toBeNull();
  });

  it('returns null for an unmappable value', () => {
    expect(normalizeScope('banana')).toBeNull();
  });
});

describe('fixScopeOnLine', () => {
  it('rewrites an invalid scope value', () => {
    expect(fixScopeOnLine('<th scope="column">x</th>')).toBe('<th scope="col">x</th>');
  });

  it('returns null when there is no scope attribute', () => {
    expect(fixScopeOnLine('<th>x</th>')).toBeNull();
  });
});

describe('ScopeAttrValidFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'scope-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new ScopeAttrValidFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'label'))).toBe(false);
  });

  it('corrects the scope value on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<tr>\n<th scope="column">x</th>\n</tr>');
    const result = await new ScopeAttrValidFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<th scope="col">x</th>');
  });

  it('human-flags an unmappable scope value', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<th scope="banana">x</th>');
    const result = await new ScopeAttrValidFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
