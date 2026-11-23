import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { FrameTitleUniqueFixer, setIframeTitleOnLine } from './frame-title-unique.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn().mockResolvedValue('Q1 revenue report'),
    ...overrides,
  };
}

function violation(file?: string, line?: number, html = '<iframe src="r.html" title="Report"></iframe>'): A11yViolation {
  return {
    id: 'frame-title-unique',
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'iframes must have a unique title',
    helpUrl: '',
    nodes: [{ html, target: ['iframe'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('setIframeTitleOnLine', () => {
  it('replaces an existing title value', () => {
    expect(setIframeTitleOnLine('<iframe src="r.html" title="Report"></iframe>', 'Q1 report'))
      .toBe('<iframe src="r.html" title="Q1 report"></iframe>');
  });

  it('adds a title when none exists', () => {
    expect(setIframeTitleOnLine('<iframe src="r.html"></iframe>', 'Q1 report'))
      .toBe('<iframe title="Q1 report" src="r.html"></iframe>');
  });

  it('escapes the title value', () => {
    expect(setIframeTitleOnLine('<iframe src="r.html"></iframe>', 'Tom & "Jerry"'))
      .toBe('<iframe title="Tom &amp; &quot;Jerry&quot;" src="r.html"></iframe>');
  });

  it('returns null when there is no iframe on the line', () => {
    expect(setIframeTitleOnLine('<div title="x"></div>', 'y')).toBeNull();
  });
});

describe('FrameTitleUniqueFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'frame-unique-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches frame-title-unique, not frame-title', () => {
    const fixer = new FrameTitleUniqueFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix({ ...violation('x.html', 1), id: 'frame-title' })).toBe(false);
  });

  it('replaces the duplicate title on the recorded line with AI text', async () => {
    const file = path.join(dir, 'page.html');
    await writeFile(file, '<main>\n<iframe src="r.html" title="Report"></iframe>\n</main>');
    const provider = makeProvider();
    const result = await new FrameTitleUniqueFixer(provider, dir).fix(violation(file, 2));
    expect(provider.suggestAccessibleName).toHaveBeenCalled();
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    expect(await readFile(file, 'utf8')).toContain('title="Q1 revenue report"');
  });

  it('human-flags when the provider is unavailable', async () => {
    const fixer = new FrameTitleUniqueFixer(makeProvider({ available: () => false }), dir);
    const result = await fixer.fix(violation('x.html', 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('ANTHROPIC_API_KEY not set');
  });

  it('human-flags when there is no source location', async () => {
    const provider = makeProvider();
    const result = await new FrameTitleUniqueFixer(provider, dir).fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });
});
