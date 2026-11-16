import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DocumentTitleFixer } from './document-title.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn().mockResolvedValue('Quarterly Pricing'),
    ...overrides,
  };
}

function violation(file?: string, line?: number): A11yViolation {
  return {
    id: 'document-title',
    wcagId: '2.4.2',
    impact: 'serious',
    description: 'Documents must have <title> element to aid in navigation',
    helpUrl: '',
    nodes: [{
      html: '<html>',
      target: ['html'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('DocumentTitleFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'doctitle-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe document-title, not other rules', () => {
    const fixer = new DocumentTitleFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);

    const other = { ...violation('x.html', 1), id: 'link-name' };
    expect(fixer.canFix(other)).toBe(false);
  });

  it('fills an empty <title></title>', async () => {
    const file = path.join(dir, 'page.html');
    await writeFile(file, '<html><head><title></title></head><body><h1>Pricing</h1></body></html>');
    const provider = makeProvider();
    const fixer = new DocumentTitleFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1));

    expect(provider.suggestAccessibleName).toHaveBeenCalled();
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<title>Quarterly Pricing</title>');
  });

  it('inserts a <title> after <head> when none exists', async () => {
    const file = path.join(dir, 'page.html');
    await writeFile(file, '<html><head><meta charset="utf-8"></head><body><h1>Pricing</h1></body></html>');
    const provider = makeProvider();
    const fixer = new DocumentTitleFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<head>\n    <title>Quarterly Pricing</title><meta charset="utf-8"></head>');
  });

  it('human-flags when there is no <head>', async () => {
    const file = path.join(dir, 'frag.html');
    await writeFile(file, '<div><h1>Pricing</h1></div>');
    const provider = makeProvider();
    const fixer = new DocumentTitleFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('No <head>');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });

  it('human-flags when there is no source location', async () => {
    const provider = makeProvider();
    const fixer = new DocumentTitleFixer(provider, dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });

  it('human-flags when the provider is unavailable', async () => {
    const provider = makeProvider({ available: () => false });
    const fixer = new DocumentTitleFixer(provider, dir);
    const result = await fixer.fix(violation('x.html', 1));

    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('ANTHROPIC_API_KEY not set');
  });

  it('human-flags when the AI provider throws', async () => {
    const file = path.join(dir, 'page.html');
    await writeFile(file, '<html><head></head><body><h1>Pricing</h1></body></html>');
    const provider = makeProvider({
      suggestAccessibleName: vi.fn().mockRejectedValue(new Error('rate limited')),
    });
    const fixer = new DocumentTitleFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('rate limited');
  });

  it('escapes HTML special characters in the generated title', async () => {
    const file = path.join(dir, 'page.html');
    await writeFile(file, '<html><head><title></title></head><body></body></html>');
    const provider = makeProvider({
      suggestAccessibleName: vi.fn().mockResolvedValue('Tips & Tricks <2026>'),
    });
    const fixer = new DocumentTitleFixer(provider, dir);

    await fixer.fix(violation(file, 1));
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<title>Tips &amp; Tricks &lt;2026&gt;</title>');
  });
});
