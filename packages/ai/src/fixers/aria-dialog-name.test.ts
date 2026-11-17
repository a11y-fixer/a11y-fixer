import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaDialogNameFixer } from './aria-dialog-name.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn().mockResolvedValue('Delete account confirmation'),
    ...overrides,
  };
}

function violation(file?: string, line?: number, html = '<div role="dialog"></div>'): A11yViolation {
  return {
    id: 'aria-dialog-name',
    wcagId: 'aria-dialog-name',
    impact: 'serious',
    description: 'ARIA dialog and alertdialog nodes should have an accessible name',
    helpUrl: '',
    nodes: [{
      html,
      target: ['div'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('AriaDialogNameFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'dialog-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe aria-dialog-name, not aria-tooltip-name', () => {
    const fixer = new AriaDialogNameFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.tsx', 1))).toBe(true);
    expect(fixer.canFix({ ...violation('x.tsx', 1), id: 'aria-tooltip-name' })).toBe(false);
  });

  it('reports WCAG 4.1.2', () => {
    expect(new AriaDialogNameFixer(makeProvider(), dir).wcagId).toBe('4.1.2');
  });

  it('adds an aria-label to a role="dialog" <div>', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, 'const x = 1;\n<div role="dialog"></div>');
    const provider = makeProvider();
    const result = await new AriaDialogNameFixer(provider, dir).fix(violation(file, 2));

    expect(provider.suggestAccessibleName).toHaveBeenCalled();
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<div aria-label="Delete account confirmation" role="dialog"');
  });

  it('works for role="alertdialog" too', async () => {
    const file = path.join(dir, 'Alert.tsx');
    await writeFile(file, '<div role="alertdialog"></div>');
    const provider = makeProvider();
    const result = await new AriaDialogNameFixer(provider, dir).fix(
      violation(file, 1, '<div role="alertdialog"></div>'),
    );
    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('aria-label="Delete account confirmation"');
    expect(contents).toContain('role="alertdialog"');
  });

  it('human-flags when there is no source location', async () => {
    const provider = makeProvider();
    const result = await new AriaDialogNameFixer(provider, dir).fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });

  it('human-flags when the provider is unavailable', async () => {
    const result = await new AriaDialogNameFixer(makeProvider({ available: () => false }), dir).fix(violation('x.tsx', 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('ANTHROPIC_API_KEY not set');
  });

  it('human-flags when the AI provider throws', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, '<div role="dialog"></div>');
    const provider = makeProvider({ suggestAccessibleName: vi.fn().mockRejectedValue(new Error('rate limited')) });
    const result = await new AriaDialogNameFixer(provider, dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('rate limited');
  });
});
