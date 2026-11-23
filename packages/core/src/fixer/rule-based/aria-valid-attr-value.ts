import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * ARIA state attributes whose value is a plain boolean (`true`/`false`). These
 * are the only attributes this fixer normalizes, because their valid value set
 * is unambiguous — attributes with token values (`aria-current`,
 * `aria-haspopup`, `aria-live`, …) or tristate (`aria-checked`/`aria-pressed`
 * also allow `mixed`) are deliberately excluded so we never coerce a value whose
 * intent we can't be sure of.
 */
const BOOLEAN_STATE_ATTRS = new Set([
  'aria-atomic',
  'aria-busy',
  'aria-disabled',
  'aria-expanded',
  'aria-hidden',
  'aria-modal',
  'aria-multiline',
  'aria-multiselectable',
  'aria-readonly',
  'aria-required',
  'aria-selected',
]);

/**
 * Obvious near-miss spellings of a boolean value → the canonical token. Only
 * unambiguous typos are mapped; anything else is left for a human.
 */
const BOOLEAN_VALUE_FIXES: Record<string, string> = {
  true: 'true',
  false: 'false',
  yes: 'true',
  no: 'false',
  '1': 'true',
  '0': 'false',
  on: 'true',
  off: 'false',
};

/**
 * Normalizes one invalid boolean ARIA value on `line`, using the
 * `attr="value"` pair named in the axe failure summary. Returns the rewritten
 * line, or `null` when the flagged attribute isn't a boolean state attribute,
 * its value isn't a recognized near-miss, or the pair isn't present on the line.
 */
export function normalizeAriaValueOnLine(line: string, failureSummary: string): string | null {
  const pair = failureSummary.match(/\b(aria-[a-z-]+)\s*=\s*(["'])([^"']*)\2/i);
  if (!pair) return null;

  const name = pair[1].toLowerCase();
  if (!BOOLEAN_STATE_ATTRS.has(name)) return null;

  const fixed = BOOLEAN_VALUE_FIXES[pair[3].trim().toLowerCase()];
  if (fixed === undefined) return null;

  const onLine = new RegExp(`(\\b${name}\\s*=\\s*)(["'])[^"']*\\2`, 'i');
  if (!onLine.test(line)) return null;
  return line.replace(onLine, `$1$2${fixed}$2`);
}

/**
 * Fixes axe `aria-valid-attr-value` (WCAG 4.1.2) for the safe, unambiguous case:
 * a boolean ARIA state attribute carrying an obvious near-miss value
 * (`aria-expanded="yes"`, `aria-hidden="1"`, …). It rewrites the value to the
 * canonical `true`/`false`. Token-valued, tristate, or otherwise ambiguous
 * invalid values are human-flagged rather than guessed. Claims only the axe id.
 */
export class AriaValidAttrValueFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-valid-attr-value';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      line => normalizeAriaValueOnLine(line, node.failureSummary),
      'No fixable boolean ARIA value on the recorded line — needs a human',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Normalized an invalid boolean ARIA attribute value to true/false',
      before: node.html,
      after: result.updated.trim(),
      sourceLocation: { file: node.sourceFile!, line: node.sourceLine!, column: node.sourceColumn ?? 1 },
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
