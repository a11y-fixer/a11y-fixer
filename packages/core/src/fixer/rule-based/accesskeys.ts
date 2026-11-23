import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/** Removes the `accesskey` attribute from a tag's source line, or null if absent. */
export function removeAccesskey(line: string): string | null {
  return removeAttribute(line, 'accesskey');
}

/**
 * Fixes axe `accesskeys` (duplicate access keys) by dropping the `accesskey`
 * attribute from the flagged element. An access key is a non-essential keyboard
 * convenience, so removing it never reduces accessibility — and dropping it from
 * each flagged node resolves the duplication without having to pick a winner.
 */
export class AccesskeysFixer implements Fixer {
  readonly wcagId = '2.1.1';
  readonly bucket = 'rule-based' as const;
  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'accesskeys';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');
    const result = await editRecordedLine(
      node,
      removeAccesskey,
      'Recorded line has no accesskey attribute to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);
    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed a duplicate accesskey so no access key is bound to more than one element',
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
