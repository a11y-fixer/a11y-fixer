import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  AutocompleteValidFixer,
  suggestAutocompleteToken,
  replaceAutocompleteOnLine,
} from './autocomplete-valid.js';
import type { AIProvider } from '../provider/index.js';
import type { A11yViolation } from '@a11y-fixer/core';

function makeProvider(): AIProvider {
  return {
    available: () => true,
    describeImage: vi.fn(),
    suggestAltText: vi.fn(),
    rewriteLinkText: vi.fn(),
    suggestAccessibleName: vi.fn(),
  };
}

function violation(opts: { file?: string; line?: number; html?: string }): A11yViolation {
  return {
    id: 'autocomplete-valid',
    wcagId: '1.3.5',
    impact: 'serious',
    description: 'autocomplete attribute must be valid',
    helpUrl: '',
    nodes: [{
      html: opts.html ?? '<input name="email" autocomplete="e-mail">',
      target: ['input'],
      failureSummary: '',
      sourceFile: opts.file,
      sourceLine: opts.line,
      sourceColumn: 1,
    }],
  };
}

describe('suggestAutocompleteToken', () => {
  it('maps an email field to email', () => {
    expect(suggestAutocompleteToken('<input name="email" autocomplete="e-mail">', 'e-mail')).toBe('email');
  });

  it('maps a first-name field to given-name', () => {
    expect(suggestAutocompleteToken('<input id="firstName" autocomplete="fname">', 'fname')).toBe('given-name');
  });

  it('uses type=tel when name is unhelpful', () => {
    expect(suggestAutocompleteToken('<input type="tel" autocomplete="xx">', 'xx')).toBe('tel');
  });

  it('returns null when the purpose cannot be inferred', () => {
    expect(suggestAutocompleteToken('<input autocomplete="zzz">', 'zzz')).toBeNull();
  });
});

describe('replaceAutocompleteOnLine', () => {
  it('replaces the attribute value in place', () => {
    expect(replaceAutocompleteOnLine('<input name="email" autocomplete="e-mail">', 'email'))
      .toBe('<input name="email" autocomplete="email">');
  });

  it('returns null when autocomplete is not inline', () => {
    expect(replaceAutocompleteOnLine('<input name="email">', 'email')).toBeNull();
  });
});

describe('AutocompleteValidFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'autocomplete-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches autocomplete-valid only', () => {
    const fixer = new AutocompleteValidFixer(makeProvider(), dir);
    expect(fixer.canFix(violation({ file: 'x.html', line: 1 }))).toBe(true);
    expect(fixer.canFix({ ...violation({ file: 'x.html', line: 1 }), id: 'label' })).toBe(false);
  });

  it('corrects an invalid token on the recorded line', async () => {
    const file = path.join(dir, 'form.html');
    await writeFile(file, '<form>\n<input name="email" autocomplete="e-mail">\n</form>');
    const fixer = new AutocompleteValidFixer(makeProvider(), dir);

    const result = await fixer.fix(violation({ file, line: 2 }));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    expect(await readFile(file, 'utf8')).toContain('autocomplete="email"');
  });

  it('human-flags when the field purpose cannot be inferred', async () => {
    const file = path.join(dir, 'form.html');
    await writeFile(file, '<input autocomplete="zzz">');
    const fixer = new AutocompleteValidFixer(makeProvider(), dir);
    const result = await fixer.fix(violation({ file, line: 1, html: '<input autocomplete="zzz">' }));
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new AutocompleteValidFixer(makeProvider(), dir);
    const result = await fixer.fix(violation({ file: undefined, line: undefined }));
    expect(result.bucket).toBe('human-flagged');
  });
});
