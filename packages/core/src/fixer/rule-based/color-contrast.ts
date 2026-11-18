import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { adjustForeground, parseHex, toHex } from './contrast-math.js';

export interface ContrastFailure {
  fg: string;
  bg: string;
  requiredRatio: number;
}

/**
 * Parses axe's `color-contrast` `failureSummary`, which reads like:
 *   "Element has insufficient color contrast of 2.5 (foreground color: #ffffff,
 *    background color: #cccccc, font size: 12.0pt (16px), font weight: normal).
 *    Expected contrast ratio of 4.5:1"
 *
 * Returns the foreground/background hex colors and the required ratio (derived
 * from the "Expected contrast ratio" when present, otherwise from font metrics:
 * large text — ≥18pt, or ≥14pt bold — needs 3:1, everything else 4.5:1).
 * Returns null when the fg/bg colors can't be found or aren't hex.
 */
export function parseContrastFailure(failureSummary: string): ContrastFailure | null {
  const fgMatch = failureSummary.match(/foreground color:\s*(#[0-9a-fA-F]{3,6})/i);
  const bgMatch = failureSummary.match(/background color:\s*(#[0-9a-fA-F]{3,6})/i);
  if (!fgMatch || !bgMatch) return null;
  const fg = fgMatch[1]!;
  const bg = bgMatch[1]!;
  if (!parseHex(fg) || !parseHex(bg)) return null;

  const expected = failureSummary.match(/Expected contrast ratio of\s*([\d.]+):1/i);
  let requiredRatio = expected ? Number.parseFloat(expected[1]!) : NaN;
  if (!Number.isFinite(requiredRatio)) {
    requiredRatio = requiredRatioFromFont(failureSummary);
  }

  return { fg, bg, requiredRatio };
}

function requiredRatioFromFont(summary: string): number {
  const sizeMatch = summary.match(/font size:\s*([\d.]+)pt/i);
  const weightMatch = summary.match(/font weight:\s*(\w+)/i);
  const sizePt = sizeMatch ? Number.parseFloat(sizeMatch[1]!) : NaN;
  const bold = weightMatch ? weightMatch[1]!.toLowerCase() === 'bold' : false;
  const large = Number.isFinite(sizePt) && (sizePt >= 18 || (sizePt >= 14 && bold));
  return large ? 3.0 : 4.5;
}

/**
 * Fixes axe `color-contrast` (WCAG 1.4.3) by computing a WCAG-compliant
 * foreground color via deterministic luminance math and rewriting it in place —
 * but only when the offending color is an inline style value on the element's
 * source line. Colors defined via CSS classes, Tailwind utilities, variables or
 * external stylesheets can't be located from the JSX/HTML line, so those are
 * human-flagged with the concrete computed target color.
 *
 * Deterministic, so it lives in the rule-based bucket alongside
 * {@link MetaViewportFixer}.
 */
export class ColorContrastFixer implements Fixer {
  readonly wcagId = '1.4.3';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'color-contrast';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to fix the color contrast');
    }

    const failure = parseContrastFailure(node.failureSummary);
    if (!failure) {
      return this.humanFlag(violation, 'Could not parse contrast data from the violation');
    }

    const newColor = adjustForeground(failure.fg, failure.bg, failure.requiredRatio);
    if (newColor === null) {
      return this.humanFlag(violation, 'Foreground already meets the required contrast');
    }

    const suggestion = `Change the foreground color to ${newColor} to reach ${failure.requiredRatio}:1`;

    let content: string;
    try {
      content = await readFile(node.sourceFile, 'utf8');
    } catch {
      return this.humanFlag(violation, `Could not read source file. ${suggestion}`);
    }

    const lines = content.split('\n');
    const idx = node.sourceLine - 1;
    const original = lines[idx];
    if (original === undefined) {
      return this.humanFlag(violation, `Recorded line is out of range. ${suggestion}`);
    }

    const updated = replaceColorOnLine(original, failure.fg, newColor);
    if (updated === null) {
      // The color isn't an inline style value we can see on this line (CSS class,
      // Tailwind, variable, external stylesheet, …) — hand off with the fix.
      return this.humanFlag(violation, `Foreground color not found inline on the source line. ${suggestion}`);
    }

    lines[idx] = updated;
    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, `Could not write the fixed color. ${suggestion}`);
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Adjusted foreground color ${failure.fg} → ${newColor} to meet ${failure.requiredRatio}:1 contrast`,
      before: node.html,
      after: updated.trim(),
      sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
    };
  }

  private humanFlag(violation: A11yViolation, note: string): FixResult {
    return {
      wcagId: this.wcagId,
      bucket: 'human-flagged',
      applied: false,
      description: note,
      before: violation.nodes[0]?.html ?? '',
      humanNote: note,
    };
  }
}

/**
 * Replaces the first literal occurrence of the foreground hex on `line` with
 * `newColor`, matching `#rgb` and `#rrggbb` spellings of the same color
 * (case-insensitive). Returns the updated line, or null if the color isn't
 * present as a literal hex on the line.
 */
function replaceColorOnLine(line: string, fgHex: string, newColor: string): string | null {
  const target = parseHex(fgHex);
  if (!target) return null;
  const targetNorm = toHex(target);

  const hexRe = /#[0-9a-fA-F]{3}\b|#[0-9a-fA-F]{6}\b/g;
  let match: RegExpExecArray | null;
  while ((match = hexRe.exec(line)) !== null) {
    const found = parseHex(match[0]);
    if (found && toHex(found) === targetNorm) {
      return line.slice(0, match.index) + newColor + line.slice(match.index + match[0].length);
    }
  }
  return null;
}
