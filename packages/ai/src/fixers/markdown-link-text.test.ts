import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MarkdownLinkTextFixer } from './markdown-link-text.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn().mockResolvedValue('View pricing details'),
    suggestAccessibleName: vi.fn(),
    ...overrides,
  };
}

function violation(file: string, line: number, column: number): A11yViolation {
  return {
    id: 'md-link-text',
    wcagId: '2.4.4',
    impact: 'serious',
    description: 'Markdown link has non-descriptive text',
    helpUrl: '',
    nodes: [{ html: `${file}:${line}:${column}`, target: [file], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: column }],
  };
}

describe('MarkdownLinkTextFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'md-link-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches only the md-link-text id', () => {
    const fixer = new MarkdownLinkTextFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.md', 1, 1))).toBe(true);
    expect(fixer.canFix({ ...violation('x.md', 1, 1), id: 'anchor-has-content' })).toBe(false);
  });

  it('human-flags when the provider is unavailable', async () => {
    const provider = makeProvider({ available: () => false });
    const fixer = new MarkdownLinkTextFixer(provider, dir);
    const result = await fixer.fix(violation('x.md', 1, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('No AI provider configured');
    expect(provider.rewriteLinkText).not.toHaveBeenCalled();
  });

  it('rewrites generic link text into the Markdown link on disk', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, 'See [click here](/pricing) now');
    const provider = makeProvider();
    const fixer = new MarkdownLinkTextFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1, 5));

    expect(provider.rewriteLinkText).toHaveBeenCalledWith('click here', expect.stringContaining('/pricing'));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toBe('See [View pricing details](/pricing) now');
  });

  it('rewrites a bare-URL link text', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, '[https://ex.com/a](https://ex.com/a)');
    const provider = makeProvider({ rewriteLinkText: vi.fn().mockResolvedValue('Read the A guide') });
    const fixer = new MarkdownLinkTextFixer(provider, dir);

    await fixer.fix(violation(file, 1, 1));
    expect(await readFile(file, 'utf8')).toBe('[Read the A guide](https://ex.com/a)');
  });

  it('fills empty link text', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, 'A [](/page) link');
    const provider = makeProvider({ rewriteLinkText: vi.fn().mockResolvedValue('the page') });
    const fixer = new MarkdownLinkTextFixer(provider, dir);

    await fixer.fix(violation(file, 1, 3));
    expect(await readFile(file, 'utf8')).toBe('A [the page](/page) link');
  });

  it('human-flags text that is not generic (belt-and-suspenders)', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, '[our enterprise pricing](/pricing)');
    const provider = makeProvider();
    const fixer = new MarkdownLinkTextFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('may not be generic');
    expect(provider.rewriteLinkText).not.toHaveBeenCalled();
  });

  it('edits the link at the recorded column when two are on one line', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, '[here](/a) and [here](/b)');
    const provider = makeProvider({ rewriteLinkText: vi.fn().mockResolvedValue('second') });
    const fixer = new MarkdownLinkTextFixer(provider, dir);

    await fixer.fix(violation(file, 1, 16));
    expect(await readFile(file, 'utf8')).toBe('[here](/a) and [second](/b)');
  });
});
