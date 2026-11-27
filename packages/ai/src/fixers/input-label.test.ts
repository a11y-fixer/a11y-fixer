import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { InputLabelFixer } from './input-label.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn().mockResolvedValue('Search documents'),
    ...overrides,
  };
}

function violation(file?: string, line?: number): A11yViolation {
  return {
    id: 'a11y-custom/input-must-have-label',
    wcagId: '1.3.1',
    impact: 'serious',
    description: 'Input element must have an accessible label',
    helpUrl: '',
    nodes: [{
      html: '<input type="text" />',
      target: ['input'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('InputLabelFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'inputlabel-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the JSX input rule, not other 1.3.1 rules', () => {
    const fixer = new InputLabelFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.tsx', 1))).toBe(true);
    // The HTML/axe `label` rule belongs to FormLabelFixer, not this fixer.
    expect(fixer.canFix({ ...violation('x.tsx', 1), id: 'label' })).toBe(false);
    // The orphan-<label> association rule is not an aria-label target.
    expect(
      fixer.canFix({ ...violation('x.tsx', 1), id: 'jsx-a11y/label-has-associated-control' }),
    ).toBe(false);
  });

  it('adds an aria-label to the input on the recorded line', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, 'const x = 1;\n<input type="search" onChange={onChange} />');
    const provider = makeProvider();
    const fixer = new InputLabelFixer(provider, dir);

    const result = await fixer.fix(violation(file, 2));

    expect(provider.suggestAccessibleName).toHaveBeenCalled();
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('const x = 1;'); // line 1 untouched
    expect(contents).toContain('<input aria-label="Search documents" type="search"');
  });

  it('adds an aria-label when <input opens alone on its line (multi-line JSX)', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, 'const x = 1;\n<input\n  type="search"\n  onChange={onChange}\n/>');
    const provider = makeProvider();
    const fixer = new InputLabelFixer(provider, dir);

    // The custom rule reports the `<input` line (line 2), which has no char after
    // the tag name — the end-of-line tolerance must still apply the aria-label.
    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<input aria-label="Search documents"');
  });

  it('human-flags when there is no source location', async () => {
    const provider = makeProvider();
    const fixer = new InputLabelFixer(provider, dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });

  it('human-flags when the provider is unavailable', async () => {
    const provider = makeProvider({ available: () => false });
    const fixer = new InputLabelFixer(provider, dir);
    const result = await fixer.fix(violation('x.tsx', 1));

    expect(result.bucket).toBe('human-flagged');
    expect(result.description).toContain('ANTHROPIC_API_KEY not set');
  });

  it('human-flags (does not insert) when the AI output is an unusable non-answer', async () => {
    const file = path.join(dir, 'App.tsx');
    await writeFile(file, '<input type="text" />');
    const provider = makeProvider({
      suggestAccessibleName: vi.fn().mockResolvedValue('I need more context to label this input'),
    });
    const fixer = new InputLabelFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.bucket).toBe('human-flagged');
    const contents = await readFile(file, 'utf8');
    expect(contents).not.toContain('aria-label'); // garbage never written
  });
});
