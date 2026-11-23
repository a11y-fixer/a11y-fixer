import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr, removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes a `role="presentation"`/`role="none"` attribute from the first opening
 * tag on `line`, returning the rewritten line.
 *
 * Returns `null` when the line has no `role` attribute, or its value isn't
 * `presentation`/`none` — in which case the conflict is elsewhere and the
 * author must resolve it by hand.
 */
export function removePresentationRole(line: string): string | null {
  const role = readAttr(line, 'role');
  if (role === null) return null;
  const value = role.trim().toLowerCase();
  if (value !== 'presentation' && value !== 'none') return null;
  return removeAttribute(line, 'role');
}

/**
 * Fixes axe `presentation-role-conflict` (WCAG 4.1.2): an element with
 * `role="presentation"`/`role="none"` that is still exposed to assistive tech
 * because it is focusable or carries a global ARIA attribute. The deterministic
 * repair is to drop the ignored presentational role so the element's real
 * semantics are honored. Claims only the axe id.
 */
export class PresentationRoleConflictFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'presentation-role-conflict';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removePresentationRole,
      'Recorded line has no role="presentation"/"none" to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed a conflicting presentational role so the element keeps its semantics',
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
