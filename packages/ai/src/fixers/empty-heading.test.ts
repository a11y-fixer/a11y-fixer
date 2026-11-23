import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { EmptyHeadingFixer } from './empty-heading.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn().mockResolvedValue('Pricing plans'),
    ...overrides,
  };
}

function violation(file?: string, line?: number, html = '<h2></h2>'): A11yViolation {
  return {
    id: 'empty-heading',
    wcagId: '1.3.1',
    impact: 'moderate',
    description: 'Headings must not be empty',
    helpUrl: '',
    nodes: [{ html, target: ['h2'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('EmptyHeadingFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'empty-heading-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches empty-heading, not other 1.3.1 rules', () => {
    const fixer = new EmptyHeadingFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix({ ...violation('x.html', 1), id: 'label' })).toBe(false);
  });

  it('fills the empty heading on the recorded line with AI text', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<header>top</header>\n<h2></h2>\n<p>$9/mo</p>');
    const provider = makeProvider();
    const fixer = new EmptyHeadingFixer(provider, dir);

    const result = await fixer.fix(violation(file, 2));

    expect(provider.suggestAccessibleName).toHaveBeenCalled();
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<header>top</header>');
    expect(contents).toContain('<h2>Pricing plans</h2>');
  });

  it('human-flags when the provider is unavailable', async () => {
    const fixer = new EmptyHeadingFixer(makeProvider({ available: () => false }), dir);
    const result = await fixer.fix(violation('x.html', 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('ANTHROPIC_API_KEY not set');
  });

  it('human-flags when there is no source location', async () => {
    const provider = makeProvider();
    const fixer = new EmptyHeadingFixer(provider, dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });

  it('human-flags when the heading already has child markup', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<h2><img src="x.png" alt=""></h2>');
    const provider = makeProvider();
    const fixer = new EmptyHeadingFixer(provider, dir);
    const result = await fixer.fix(violation(file, 1, '<h2><img src="x.png" alt=""></h2>'));
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when the AI provider throws', async () => {
    const file = path.join(dir, 'App.html');
    await writeFile(file, '<h2></h2>');
    const provider = makeProvider({ suggestAccessibleName: vi.fn().mockRejectedValue(new Error('rate limited')) });
    const fixer = new EmptyHeadingFixer(provider, dir);
    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('rate limited');
  });
});
