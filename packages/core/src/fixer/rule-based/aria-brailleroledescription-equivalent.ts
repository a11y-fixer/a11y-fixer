import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr, removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes a dangling `aria-brailleroledescription` from the first opening tag on
 * `line`.
 *
 * `aria-brailleroledescription` only has effect alongside a non-empty
 * `aria-roledescription`; axe flags it otherwise. Returns `null` when there's no
 * `aria-brailleroledescription`, or when the element *does* carry a non-empty
 * `aria-roledescription` (then the conflict is elsewhere — leave it).
 */
export function removeDanglingBrailleRoledescription(line: string): string | null {
  if (readAttr(line, 'aria-brailleroledescription') === null) return null;
  const roledesc = readAttr(line, 'aria-roledescription');
  if (roledesc !== null && roledesc.trim().length > 0) return null;
  return removeAttribute(line, 'aria-brailleroledescription');
}

/**
 * Fixes axe `aria-brailleroledescription-equivalent` (WCAG 4.1.2) — an
 * `aria-brailleroledescription` with no `aria-roledescription` to pair with,
 * which braille displays cannot use. The deterministic repair is to drop the
 * orphaned braille role description; supplying a real `aria-roledescription` is
 * an authoring decision left to a human. Claims only the axe id.
 */
export class AriaBrailleRoledescriptionEquivalentFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-brailleroledescription-equivalent';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeDanglingBrailleRoledescription,
      'Recorded line has no orphaned aria-brailleroledescription to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed an aria-brailleroledescription that had no aria-roledescription to pair with',
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
