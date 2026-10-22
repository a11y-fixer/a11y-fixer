import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { FormLabelFixer } from './form-label.js';
import type { AIProvider } from '../../ai-provider/index.js';
import type { A11yViolation } from '../../detector/index.js';

function makeProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn().mockResolvedValue('Email address'),
    ...overrides,
  };
}

function violation(file?: string, line?: number): A11yViolation {
  return {
    id: 'label',
    wcagId: '1.3.1',
    impact: 'serious',
    description: 'Form elements must have labels',
    helpUrl: '',
    nodes: [{
      html: '<input type="email" />',
      target: ['input'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('FormLabelFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'formlabel-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe label, not other rules sharing WCAG 1.3.1', () => {
    const fixer = new FormLabelFixer(makeProvider(), dir);
    expect(fixer.canFix(violation('x.tsx', 1))).toBe(true);

    // label-has-associated-control (same WCAG 1.3.1) must not be claimed here.
    const eslintSourced = { ...violation('x.tsx', 1), id: 'jsx-a11y/label-has-associated-control' };
    expect(fixer.canFix(eslintSourced)).toBe(false);
  });

  it('adds an aria-label to a self-closing input', async () => {
    const file = path.join(dir, 'Form.tsx');
    await writeFile(file, '<input type="email" name="email" />');
    const provider = makeProvider();
    const fixer = new FormLabelFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('ai-assisted');
    expect(await readFile(file, 'utf8')).toContain('<input aria-label="Email address" type="email"');
  });

  it('labels select and textarea elements too', async () => {
    const file = path.join(dir, 'Form.tsx');
    await writeFile(file, '<select name="country"></select>\n<textarea name="bio"></textarea>');
    const provider = makeProvider({ suggestAccessibleName: vi.fn().mockResolvedValue('Country') });
    const fixer = new FormLabelFixer(provider, dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<select aria-label="Country" name="country">');
  });

  it('human-flags when there is no source location', async () => {
    const provider = makeProvider();
    const fixer = new FormLabelFixer(provider, dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(provider.suggestAccessibleName).not.toHaveBeenCalled();
  });
});
