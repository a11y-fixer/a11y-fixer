import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { EmptyTableHeaderFixer } from './empty-table-header.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn().mockResolvedValue('Price'),
    ...overrides,
  };
}

function violation(file?: string, line?: number, html = '<th></th>'): A11yViolation {
  return {
    id: 'empty-table-header',
    wcagId: '1.3.1',
    impact: 'serious',
    description: 'Table header cells must not be empty',
    helpUrl: '',
    nodes: [{ html, target: ['th'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('EmptyTableHeaderFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'empty-th-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches empty-table-header, not empty-heading', () => {
    const fixer = new EmptyTableHeaderFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix({ ...violation('x.html', 1), id: 'empty-heading' })).toBe(false);
  });

  it('fills the empty th on the recorded line with AI text', async () => {
    const file = path.join(dir, 'table.html');
    await writeFile(file, '<table><tr>\n<th></th>\n<th>Qty</th></tr></table>');
    const provider = makeProvider();
    const result = await new EmptyTableHeaderFixer(provider, dir).fix(violation(file, 2));
    expect(provider.suggestAccessibleName).toHaveBeenCalled();
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    expect(await readFile(file, 'utf8')).toContain('<th>Price</th>');
  });

  it('human-flags when the provider is unavailable', async () => {
    const fixer = new EmptyTableHeaderFixer(makeProvider({ available: () => false }), dir);
    const result = await fixer.fix(violation('x.html', 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('ANTHROPIC_API_KEY not set');
  });

  it('human-flags when there is no source location', async () => {
    const provider = makeProvider();
    const result = await new EmptyTableHeaderFixer(provider, dir).fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });

  it('human-flags when the th already has child markup', async () => {
    const file = path.join(dir, 'table.html');
    await writeFile(file, '<th><span>x</span></th>');
    const result = await new EmptyTableHeaderFixer(makeProvider(), dir).fix(violation(file, 1, '<th><span>x</span></th>'));
    expect(result.bucket).toBe('human-flagged');
  });
});
