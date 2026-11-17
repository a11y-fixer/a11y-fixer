import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { RoleImgAltFixer } from './role-img-alt.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn().mockResolvedValue('Party popper'),
    ...overrides,
  };
}

function violation(file?: string, line?: number, html = '<span role="img">🎉</span>'): A11yViolation {
  return {
    id: 'role-img-alt',
    wcagId: 'role-img-alt',
    impact: 'serious',
    description: 'Element with role img must have an accessible name',
    helpUrl: '',
    nodes: [{
      html,
      target: ['span'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('RoleImgAltFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'role-img-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe role-img-alt, not svg-img-alt', () => {
    const fixer = new RoleImgAltFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.tsx', 1))).toBe(true);
    expect(fixer.canFix({ ...violation('x.tsx', 1), id: 'svg-img-alt' })).toBe(false);
  });

  it('reports WCAG 1.1.1', () => {
    expect(new RoleImgAltFixer(makeProvider(), dir).wcagId).toBe('1.1.1');
  });

  it('adds an aria-label to a role-bearing <span>', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, 'const x = 1;\n<span role="img">🎉</span>');
    const provider = makeProvider();
    const result = await new RoleImgAltFixer(provider, dir).fix(violation(file, 2));

    expect(provider.suggestAccessibleName).toHaveBeenCalled();
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<span aria-label="Party popper" role="img"');
  });

  it('human-flags when there is no source location', async () => {
    const provider = makeProvider();
    const result = await new RoleImgAltFixer(provider, dir).fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });

  it('human-flags when no opening tag can be resolved from the line', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, 'const emoji = 1;');
    const provider = makeProvider();
    const result = await new RoleImgAltFixer(provider, dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('opening tag');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });

  it('human-flags when the provider is unavailable', async () => {
    const result = await new RoleImgAltFixer(makeProvider({ available: () => false }), dir).fix(violation('x.tsx', 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('ANTHROPIC_API_KEY not set');
  });

  it('human-flags when the AI provider throws', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, '<div role="img"></div>');
    const provider = makeProvider({ suggestAccessibleName: vi.fn().mockRejectedValue(new Error('rate limited')) });
    const result = await new RoleImgAltFixer(provider, dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('rate limited');
  });

  it('flags when the file does not exist (edit cannot apply)', async () => {
    const provider = makeProvider();
    const result = await new RoleImgAltFixer(provider, dir).fix(violation(path.join(dir, 'nope.tsx'), 1));
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('could not apply');
    expect(result.description).toContain('Party popper');
  });
});
