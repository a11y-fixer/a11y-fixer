import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes the `role` attribute from the first opening tag on `line`, returning
 * the rewritten line (or `null` when there's no `role` to remove).
 */
export function removeAllowedRole(line: string): string | null {
  return removeAttribute(line, 'role');
}

/**
 * Fixes axe `aria-allowed-role` (WCAG 4.1.2) — an element carrying an ARIA
 * `role` that is not appropriate for that element (e.g. `role="button"` on an
 * `<a href>`). The deterministic safe repair is to drop the inappropriate role
 * so the element keeps its implicit, correct semantics; choosing a *different*
 * valid role is an authoring decision left to a human. Claims only the axe id.
 */
export class AriaAllowedRoleFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-allowed-role';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeAllowedRole,
      'Recorded line has no role attribute to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed an ARIA role not allowed on this element so it keeps its implicit role',
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
