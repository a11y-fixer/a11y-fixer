import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/** Deprecated ARIA roles mapped to their current replacement. */
const DEPRECATED_ROLES: Record<string, string> = {
  directory: 'list',
};

/** The replacement role for a deprecated one, or `null` if not a known deprecation. */
export function replacementRole(value: string): string | null {
  return DEPRECATED_ROLES[value.trim().toLowerCase()] ?? null;
}

/**
 * Rewrites a deprecated `role` value on `line` to its replacement, returning the
 * rewritten line (or `null` when there's no `role` or it isn't a known
 * deprecated role).
 */
export function fixDeprecatedRoleOnLine(line: string): string | null {
  const current = readAttr(line, 'role');
  if (current === null) return null;
  const replacement = replacementRole(current);
  if (replacement === null) return null;
  return line.replace(
    /(\brole\s*=\s*)(["'])[\s\S]*?\2/i,
    `$1$2${replacement}$2`,
  );
}

/**
 * Fixes axe `aria-deprecated-role` (WCAG 4.1.2) by replacing a deprecated ARIA
 * role with its current equivalent (e.g. `directory` → `list`) on the recorded
 * source line. Only roles with a well-defined one-to-one replacement are
 * auto-fixed; anything else is human-flagged. Claims only the axe id.
 */
export class AriaDeprecatedRoleFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-deprecated-role';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      fixDeprecatedRoleOnLine,
      'Recorded line has no deprecated role with a known replacement',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Replaced a deprecated ARIA role with its current equivalent',
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
