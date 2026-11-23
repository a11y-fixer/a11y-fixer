import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaRolesFixer, removeRole } from './aria-roles.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'aria-roles'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'ARIA role must be valid',
    helpUrl: '',
    nodes: [{ html: '<div role="buton">x</div>', target: ['div'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeRole', () => {
  it('removes the role attribute', () => {
    expect(removeRole('<div role="buton" class="x">y</div>')).toBe('<div class="x">y</div>');
  });

  it('returns null when there is no role', () => {
    expect(removeRole('<div class="x">y</div>')).toBeNull();
  });
});

describe('AriaRolesFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-roles-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AriaRolesFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-allowed-attr'))).toBe(false);
  });

  it('removes an invalid role on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<section>\n<div role="buton">x</div>\n</section>');
    const result = await new AriaRolesFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<div>x</div>');
    expect(contents).not.toContain('role');
  });

  it('human-flags when there is no role to remove', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div>x</div>');
    const result = await new AriaRolesFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
