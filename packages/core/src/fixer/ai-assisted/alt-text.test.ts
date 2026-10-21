import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AltTextFixer, type ScreenshotProvider } from './alt-text.js';
import { readSourceLine } from './source-line.js';
import type { AIProvider } from '../../ai-provider/index.js';
import type { A11yViolation } from '../../detector/index.js';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn().mockResolvedValue('from vision'),
    suggestAltText: vi.fn().mockResolvedValue('from context'),
    rewriteLinkText: vi.fn(),
    ...overrides,
  };
}

function violation(file: string, line: number): A11yViolation {
  return {
    id: 'alt-text',
    wcagId: '1.1.1',
    impact: 'serious',
    description: 'img missing alt',
    helpUrl: '',
    nodes: [{
      html: `${file}:${line}:1`,
      target: ['img'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('readSourceLine', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'srcline-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('returns the trimmed target line and a context window', async () => {
    const file = path.join(dir, 'a.tsx');
    await writeFile(file, 'line1\n  <img src="x.png" />\nline3');
    const res = await readSourceLine(file, 2, 1);
    expect(res?.line).toBe('<img src="x.png" />');
    expect(res?.context).toContain('line1');
    expect(res?.context).toContain('line3');
  });

  it('returns null for an out-of-range line', async () => {
    const file = path.join(dir, 'a.tsx');
    await writeFile(file, 'only');
    expect(await readSourceLine(file, 99)).toBeNull();
  });
});

describe('AltTextFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'alt-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('uses the context-only path and writes alt into the source line', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, 'const x = <img src="cat.png" />;');
    const provider = makeProvider();

    const fixer = new AltTextFixer(provider, dir);
    const result = await fixer.fix(violation(file, 1));

    expect(provider.suggestAltText).toHaveBeenCalled();
    expect(provider.describeImage).not.toHaveBeenCalled();
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('alt="from context"');
  });

  it('uses vision when a screenshot buffer is available', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, '<img src="cat.png" />');
    const provider = makeProvider();
    const screenshots: ScreenshotProvider = {
      screenshotElement: vi.fn().mockResolvedValue(Buffer.from([1, 2, 3])),
    };

    const fixer = new AltTextFixer(provider, dir, screenshots);
    const result = await fixer.fix(violation(file, 1));

    expect(provider.describeImage).toHaveBeenCalled();
    expect(provider.suggestAltText).not.toHaveBeenCalled();
    expect(result.description).toContain('from vision');
  });

  it('falls back to context when the screenshot is empty', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, '<img src="cat.png" />');
    const provider = makeProvider();
    const screenshots: ScreenshotProvider = {
      screenshotElement: vi.fn().mockResolvedValue(null),
    };

    const fixer = new AltTextFixer(provider, dir, screenshots);
    await fixer.fix(violation(file, 1));

    expect(provider.suggestAltText).toHaveBeenCalled();
    expect(provider.describeImage).not.toHaveBeenCalled();
  });
});
