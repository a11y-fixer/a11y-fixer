import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes a broken `headers` attribute from a `<td>`/`<th>` opening tag on
 * `line`. Returns `null` when the line isn't a table-cell start tag or has no
 * `headers` to remove.
 */
export function removeBrokenHeaders(line: string): string | null {
  if (!/<t[dh]\b/i.test(line)) return null;
  return removeAttribute(line, 'headers');
}

/**
 * Fixes axe `td-headers-attr` (WCAG 1.3.1) — a table cell whose `headers`
 * attribute points at ids that don't resolve to cells in the same table, so the
 * explicit header association is broken and assistive tech gets no useful
 * grouping. The deterministic safe repair is to drop the broken `headers` so the
 * cell falls back to implicit row/column association; rebuilding a *correct* set
 * of header ids is an authoring decision left to a human. Claims only the axe id.
 */
export class TdHeadersAttrFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'td-headers-attr';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeBrokenHeaders,
      'Recorded line has no table-cell headers attribute to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed a broken headers attribute so the cell uses implicit header association',
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
