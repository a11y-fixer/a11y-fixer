import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes a redundant `summary` attribute from a `<table>` opening tag on
 * `line`. Returns `null` when the line isn't a `<table>` start tag or has no
 * `summary` to remove.
 */
export function removeDuplicateTableSummary(line: string): string | null {
  if (!/<table\b/i.test(line)) return null;
  return removeAttribute(line, 'summary');
}

/**
 * Fixes axe `table-duplicate-name` (WCAG 1.3.1) — a `<table>` whose `summary`
 * attribute duplicates its visible `<caption>`, so screen readers announce the
 * same text twice. The deterministic repair is to drop the redundant `summary`
 * (the `<caption>` already names the table); the summary is deprecated in HTML5
 * anyway. Claims only the axe id.
 */
export class TableDuplicateNameFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'table-duplicate-name';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeDuplicateTableSummary,
      'Recorded line has no table summary attribute to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed a summary attribute that duplicated the table caption',
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
