import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaAllowedRoleFixer, removeAllowedRole } from './aria-allowed-role.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'aria-allowed-role'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'ARIA role not allowed on element',
    helpUrl: '',
    nodes: [{ html: '<a href="/x" role="button">x</a>', target: ['a'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeAllowedRole', () => {
  it('removes the role attribute', () => {
    expect(removeAllowedRole('<a href="/x" role="button">y</a>')).toBe('<a href="/x">y</a>');
  });
  it('returns null when there is no role', () => {
    expect(removeAllowedRole('<a href="/x">y</a>')).toBeNull();
  });
});

describe('AriaAllowedRoleFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-allowed-role-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaAllowedRoleFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-roles'))).toBe(false);
  });

  it('removes a disallowed role on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<nav>\n<a href="/x" role="button">x</a>\n</nav>');
    const result = await new AriaAllowedRoleFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<a href="/x">x</a>');
  });

  it('human-flags when there is no role to remove', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<a href="/x">x</a>');
    const result = await new AriaAllowedRoleFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
