import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaDeprecatedRoleFixer, replacementRole, fixDeprecatedRoleOnLine } from './aria-deprecated-role.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'aria-deprecated-role'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'minor',
    description: 'deprecated ARIA role',
    helpUrl: '',
    nodes: [{ html: '<nav role="directory">x</nav>', target: ['nav'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('replacementRole', () => {
  it('maps directory → list', () => {
    expect(replacementRole('directory')).toBe('list');
    expect(replacementRole('DIRECTORY')).toBe('list');
  });

  it('returns null for a non-deprecated role', () => {
    expect(replacementRole('list')).toBeNull();
  });
});

describe('fixDeprecatedRoleOnLine', () => {
  it('replaces the deprecated role value', () => {
    expect(fixDeprecatedRoleOnLine('<nav role="directory">x</nav>')).toBe('<nav role="list">x</nav>');
  });

  it('returns null when the role is not deprecated', () => {
    expect(fixDeprecatedRoleOnLine('<nav role="navigation">x</nav>')).toBeNull();
  });
});

describe('AriaDeprecatedRoleFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'dep-role-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaDeprecatedRoleFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-roles'))).toBe(false);
  });

  it('replaces the deprecated role on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<nav role="directory">x</nav>\n</main>');
    const result = await new AriaDeprecatedRoleFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<nav role="list">x</nav>');
  });

  it('human-flags when there is no known deprecated role', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<nav role="navigation">x</nav>');
    const result = await new AriaDeprecatedRoleFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
