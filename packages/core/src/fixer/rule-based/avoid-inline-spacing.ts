import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { editRecordedLine } from '../shared/line-edit.js';

/** Inline CSS properties whose `!important` blocks a user's text-spacing override. */
const SPACING_PROPS = ['letter-spacing', 'word-spacing', 'line-height'];

/**
 * Removes the `!important` flag from any `letter-spacing` / `word-spacing` /
 * `line-height` declaration inside the line's inline `style` attribute, while
 * leaving the declared value (and every other declaration) untouched. Returns
 * the rewritten line, or `null` when there is no such `!important` to relax so
 * callers can human-flag rather than report a no-op fix.
 *
 * Relaxing only the `!important` — rather than deleting the property — preserves
 * the author's intended spacing while letting WCAG 1.4.12 text-spacing overrides
 * take effect.
 */
export function stripSpacingImportant(line: string): string | null {
  const styleRe = /(\bstyle\s*=\s*)(["'])([\s\S]*?)\2/i;
  const m = line.match(styleRe);
  if (!m) return null;

  const [, prefix, quote, value] = m;
  let changed = false;
  const rewritten = value
    .split(';')
    .map((decl) => {
      const colon = decl.indexOf(':');
      if (colon === -1) return decl;
      const prop = decl.slice(0, colon).trim().toLowerCase();
      if (!SPACING_PROPS.includes(prop)) return decl;
      const relaxed = decl.replace(/\s*!\s*important/i, '');
      if (relaxed !== decl) changed = true;
      return relaxed;
    })
    .join(';');

  if (!changed) return null;
  return line.replace(styleRe, `${prefix}${quote}${rewritten}${quote}`);
}

/**
 * Fixes axe `avoid-inline-spacing` (WCAG 1.4.12) by dropping the `!important`
 * flag from inline text-spacing declarations so user stylesheets can override
 * them.
 */
export class AvoidInlineSpacingFixer implements Fixer {
  readonly wcagId = '1.4.12';
  readonly bucket = 'rule-based' as const;
  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'avoid-inline-spacing';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');
    const result = await editRecordedLine(
      node,
      stripSpacingImportant,
      'Recorded line has no !important text-spacing to relax',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);
    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description:
        'Removed !important from inline text-spacing so user stylesheets can override it',
      before: node.html,
      after: result.updated.trim(),
      sourceLocation: {
        file: node.sourceFile!,
        line: node.sourceLine!,
        column: node.sourceColumn ?? 1,
      },
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
