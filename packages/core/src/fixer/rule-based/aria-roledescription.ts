import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes the `aria-roledescription` attribute from the first opening tag on
 * `line`, returning the rewritten line (or `null` when it isn't present).
 */
export function removeRoledescription(line: string): string | null {
  return removeAttribute(line, 'aria-roledescription');
}

/**
 * Fixes axe `aria-roledescription` (WCAG 4.1.2) — `aria-roledescription` set on
 * an element whose (implicit or explicit) role is not one that supports it, so
 * assistive tech ignores the human-readable description and the markup is
 * misleading. The deterministic repair is to drop the unsupported attribute; a
 * *correct* role to carry the description is an authoring decision left to a
 * human. Claims only the axe id.
 */
export class AriaRoledescriptionFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-roledescription';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeRoledescription,
      'Recorded line has no aria-roledescription to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed an aria-roledescription unsupported by the element role',
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
