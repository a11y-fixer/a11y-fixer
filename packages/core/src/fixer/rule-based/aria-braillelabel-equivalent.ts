import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr, removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes a dangling `aria-braillelabel` from the first opening tag on `line`.
 *
 * `aria-braillelabel` only has effect alongside a non-empty `aria-label`; axe
 * flags it when the element has no accessible name to translate into braille.
 * Returns `null` when there's no `aria-braillelabel`, or when the element *does*
 * carry a non-empty `aria-label` (then the conflict is elsewhere — leave it).
 */
export function removeDanglingBrailleLabel(line: string): string | null {
  if (readAttr(line, 'aria-braillelabel') === null) return null;
  const label = readAttr(line, 'aria-label');
  if (label !== null && label.trim().length > 0) return null;
  return removeAttribute(line, 'aria-braillelabel');
}

/**
 * Fixes axe `aria-braillelabel-equivalent` (WCAG 4.1.2) — an
 * `aria-braillelabel` with no accessible name (`aria-label`) to pair with, which
 * braille displays cannot use and which signals broken markup. The deterministic
 * repair is to drop the orphaned braille label; supplying a real `aria-label` is
 * an authoring decision left to a human. Claims only the axe id.
 */
export class AriaBrailleLabelEquivalentFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-braillelabel-equivalent';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeDanglingBrailleLabel,
      'Recorded line has no orphaned aria-braillelabel to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed an aria-braillelabel that had no accessible name to pair with',
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
