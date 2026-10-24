import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ColorContrastFixer, parseContrastFailure } from './color-contrast.js';
import { parseHex, contrastRatio } from './contrast-math.js';
import type { A11yViolation } from '../../detector/index.js';

const SUMMARY_FG777_BG_WHITE =
  'Element has insufficient color contrast of 4.48 (foreground color: #777777, ' +
  'background color: #ffffff, font size: 12.0pt (16px), font weight: normal). ' +
  'Expected contrast ratio of 4.5:1';

function violation(
  opts: { file?: string; line?: number; id?: string; summary?: string; html?: string } = {},
): A11yViolation {
  return {
    id: opts.id ?? 'color-contrast',
    wcagId: '1.4.3',
    impact: 'serious',
    description: 'Elements must meet minimum color contrast ratio thresholds',
    helpUrl: '',
    nodes: [{
      html: opts.html ?? '<span style="color:#777777">Hi</span>',
      target: ['span'],
      failureSummary: opts.summary ?? SUMMARY_FG777_BG_WHITE,
      sourceFile: opts.file,
      sourceLine: opts.line,
      sourceColumn: 1,
    }],
  };
}

describe('parseContrastFailure', () => {
  it('extracts fg/bg and the expected ratio', () => {
    const result = parseContrastFailure(SUMMARY_FG777_BG_WHITE);
    expect(result).toEqual({ fg: '#777777', bg: '#ffffff', requiredRatio: 4.5 });
  });

  it('derives 3:1 for large text when no expected ratio is stated', () => {
    const summary =
      'insufficient color contrast (foreground color: #999999, background color: #ffffff, ' +
      'font size: 20.0pt (27px), font weight: normal).';
    expect(parseContrastFailure(summary)?.requiredRatio).toBe(3.0);
  });

  it('derives 3:1 for ≥14pt bold text', () => {
    const summary =
      '(foreground color: #999999, background color: #ffffff, ' +
      'font size: 14.0pt (19px), font weight: bold).';
    expect(parseContrastFailure(summary)?.requiredRatio).toBe(3.0);
  });

  it('defaults to 4.5 for normal-size text without an expected ratio', () => {
    const summary =
      '(foreground color: #999999, background color: #ffffff, ' +
      'font size: 11.0pt (15px), font weight: normal).';
    expect(parseContrastFailure(summary)?.requiredRatio).toBe(4.5);
  });

  it('returns null when colors are missing', () => {
    expect(parseContrastFailure('no colors here')).toBeNull();
  });
});

describe('ColorContrastFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'colorcontrast-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe color-contrast, not other ids', () => {
    const fixer = new ColorContrastFixer(dir);
    expect(fixer.canFix(violation({ file: 'x.tsx', line: 1 }))).toBe(true);
    expect(fixer.canFix(violation({ file: 'x.tsx', line: 1, id: 'meta-viewport' }))).toBe(false);
  });

  it('rewrites an inline JSX style color and clears the ratio (bg untouched)', async () => {
    const file = path.join(dir, 'Comp.tsx');
    await writeFile(
      file,
      "const x = 1;\n<span style={{ color: '#777777', background: '#ffffff' }}>Hi</span>\nconst y = 2;\n",
    );
    const fixer = new ColorContrastFixer(dir);

    const result = await fixer.fix(violation({ file, line: 2 }));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('const x = 1;'); // other lines untouched
    expect(contents).toContain('const y = 2;');
    expect(contents).toContain("background: '#ffffff'"); // bg unchanged
    expect(contents).not.toContain('#777777'); // fg replaced

    const newFg = contents.match(/color: '(#[0-9a-f]{6})'/)![1];
    expect(contrastRatio(parseHex(newFg)!, parseHex('#ffffff')!)).toBeGreaterThanOrEqual(4.5);
  });

  it('handles double-quoted HTML style attributes and #rgb shorthand in source', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<p style="color:#777">Hi</p>');
    const fixer = new ColorContrastFixer(dir);

    const result = await fixer.fix(violation({ file, line: 1 }));

    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).not.toContain('#777"');
    const newFg = contents.match(/color:(#[0-9a-f]{6})/)![1];
    expect(contrastRatio(parseHex(newFg)!, parseHex('#ffffff')!)).toBeGreaterThanOrEqual(4.5);
  });

  it('human-flags with the suggested color when the fg is not inline on the line', async () => {
    const file = path.join(dir, 'Comp.tsx');
    await writeFile(file, '<span className="muted">Hi</span>');
    const fixer = new ColorContrastFixer(dir);

    const result = await fixer.fix(violation({ file, line: 1 }));

    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
    expect(result.humanNote).toMatch(/Change the foreground color to #[0-9a-f]{6} to reach 4.5:1/);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new ColorContrastFixer(dir);
    const result = await fixer.fix(violation({}));
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when the failure summary cannot be parsed', async () => {
    const file = path.join(dir, 'Comp.tsx');
    await writeFile(file, "<span style={{ color: '#777777' }}>Hi</span>");
    const fixer = new ColorContrastFixer(dir);

    const result = await fixer.fix(violation({ file, line: 1, summary: 'no color data' }));
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
  });

  it('human-flags when the foreground already meets contrast', async () => {
    const file = path.join(dir, 'Comp.tsx');
    await writeFile(file, "<span style={{ color: '#000000' }}>Hi</span>");
    const fixer = new ColorContrastFixer(dir);
    const summary =
      '(foreground color: #000000, background color: #ffffff, font size: 12.0pt (16px), ' +
      'font weight: normal). Expected contrast ratio of 4.5:1';

    const result = await fixer.fix(violation({ file, line: 1, summary }));
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
  });
});
