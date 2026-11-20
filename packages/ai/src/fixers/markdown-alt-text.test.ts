import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MarkdownAltTextFixer } from './markdown-alt-text.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn().mockResolvedValue('Company logo'),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn(),
    ...overrides,
  };
}

function violation(file: string, line: number, column: number): A11yViolation {
  return {
    id: 'md-image-alt',
    wcagId: '1.1.1',
    impact: 'serious',
    description: 'Markdown image has no alt text',
    helpUrl: '',
    nodes: [{ html: `${file}:${line}:${column}`, target: [file], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: column }],
  };
}

describe('MarkdownAltTextFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'md-alt-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches only the md-image-alt id', () => {
    const fixer = new MarkdownAltTextFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.md', 1, 1))).toBe(true);
    expect(fixer.canFix({ ...violation('x.md', 1, 1), id: 'image-alt' })).toBe(false);
  });

  it('human-flags when the provider is unavailable (no API key)', async () => {
    const provider = makeProvider({ available: () => false });
    const fixer = new MarkdownAltTextFixer(provider, dir);
    const result = await fixer.fix(violation('x.md', 1, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('No AI provider configured');
    expect(provider.suggestAltText).not.toHaveBeenCalled();
  });

  it('writes AI-generated alt into the Markdown image on disk', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, 'Welcome ![](logo.png) here');
    const provider = makeProvider();
    const fixer = new MarkdownAltTextFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1, 9));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    expect(await readFile(file, 'utf8')).toBe('Welcome ![Company logo](logo.png) here');
  });

  it('edits the image at the recorded column when two are on one line', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, '![](a.png) ![](b.png)');
    // Second image starts at column 12.
    const provider = makeProvider({ suggestAltText: vi.fn().mockResolvedValue('Second') });
    const fixer = new MarkdownAltTextFixer(provider, dir);

    await fixer.fix(violation(file, 1, 12));
    expect(await readFile(file, 'utf8')).toBe('![](a.png) ![Second](b.png)');
  });

  it('escapes brackets and collapses newlines in AI alt text before splicing', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, '![](logo.png)');
    // A stray `]`/`[` would close the alt early; a newline would inject a line.
    const provider = makeProvider({ suggestAltText: vi.fn().mockResolvedValue('Chart [Q3]\nrevenue') });
    const fixer = new MarkdownAltTextFixer(provider, dir);

    await fixer.fix(violation(file, 1, 1));
    expect(await readFile(file, 'utf8')).toBe('![Chart \\[Q3\\] revenue](logo.png)');
  });

  it('human-flags when the construct is gone from the recorded location', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, 'No image here');
    const fixer = new MarkdownAltTextFixer(makeProvider(), dir);
    const result = await fixer.fix(violation(file, 1, 1));
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when the AI provider throws', async () => {
    const file = path.join(dir, 'doc.md');
    await writeFile(file, '![](logo.png)');
    const provider = makeProvider({ suggestAltText: vi.fn().mockRejectedValue(new Error('rate limited')) });
    const fixer = new MarkdownAltTextFixer(provider, dir);
    const result = await fixer.fix(violation(file, 1, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('rate limited');
  });
});
