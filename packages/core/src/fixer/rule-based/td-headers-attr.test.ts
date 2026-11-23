import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { TdHeadersAttrFixer, removeBrokenHeaders } from './td-headers-attr.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'td-headers-attr'): A11yViolation {
  return {
    id,
    wcagId: '1.3.1',
    impact: 'serious',
    description: 'td headers must reference cells in the same table',
    helpUrl: '',
    nodes: [{ html: '<td headers="ghost">x</td>', target: ['td'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeBrokenHeaders', () => {
  it('removes headers from a td', () => {
    expect(removeBrokenHeaders('<td headers="ghost" class="x">y</td>')).toBe('<td class="x">y</td>');
  });
  it('removes headers from a th', () => {
    expect(removeBrokenHeaders('<th headers="ghost">y</th>')).toBe('<th>y</th>');
  });
  it('returns null on a non-cell line', () => {
    expect(removeBrokenHeaders('<div headers="x">y</div>')).toBeNull();
  });
  it('returns null when there is no headers attr', () => {
    expect(removeBrokenHeaders('<td class="x">y</td>')).toBeNull();
  });
});

describe('TdHeadersAttrFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'td-headers-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new TdHeadersAttrFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'scope-attr-valid'))).toBe(false);
  });

  it('removes the broken headers attribute', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<table><tr>\n<td headers="ghost">x</td>\n</tr></table>');
    const result = await new TdHeadersAttrFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<td>x</td>');
  });

  it('human-flags when there is no headers attr', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<td>x</td>');
    const result = await new TdHeadersAttrFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
