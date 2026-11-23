import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes the `role` attribute from the first opening tag on `line`, returning
 * the rewritten line (or `null` when there's no `role` to remove).
 */
export function removeRole(line: string): string | null {
  return removeAttribute(line, 'role');
}

/**
 * Fixes axe `aria-roles` (WCAG 4.1.2) — an element carrying an invalid, abstract
 * or misspelled ARIA `role` — by removing the `role` attribute on the recorded
 * source line, so the element falls back to its implicit role. An invalid role
 * conveys nothing to assistive tech, so dropping it is the deterministic safe
 * repair; re-adding a *correct* role is a semantic decision left to the author.
 * Claims only the axe id.
 */
export class AriaRolesFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-roles';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeRole,
      'Recorded line has no role attribute to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed an invalid ARIA role so the element uses its implicit role',
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
