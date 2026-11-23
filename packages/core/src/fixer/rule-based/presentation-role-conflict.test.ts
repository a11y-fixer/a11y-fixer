import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PresentationRoleConflictFixer, removePresentationRole } from './presentation-role-conflict.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'presentation-role-conflict'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'minor',
    description: 'presentational role conflict',
    helpUrl: '',
    nodes: [{ html: '<a href="/x" role="presentation">x</a>', target: ['a'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removePresentationRole', () => {
  it('removes role="presentation"', () => {
    expect(removePresentationRole('<a href="/x" role="presentation">x</a>')).toBe('<a href="/x">x</a>');
  });

  it('removes role="none"', () => {
    expect(removePresentationRole('<td role="none">x</td>')).toBe('<td>x</td>');
  });

  it('returns null for a non-presentational role', () => {
    expect(removePresentationRole('<div role="button">x</div>')).toBeNull();
  });

  it('returns null when there is no role', () => {
    expect(removePresentationRole('<a href="/x">x</a>')).toBeNull();
  });
});

describe('PresentationRoleConflictFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'prc-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new PresentationRoleConflictFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-roles'))).toBe(false);
  });

  it('removes the conflicting role on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<nav>\n<a href="/x" role="presentation">x</a>\n</nav>');
    const result = await new PresentationRoleConflictFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<a href="/x">x</a>');
  });

  it('human-flags a non-presentational role', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div role="button">x</div>');
    const result = await new PresentationRoleConflictFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
