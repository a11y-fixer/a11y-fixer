import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeNamedAttrs } from '../shared/attrs.js';
import { offendingAriaAttrs } from './aria-allowed-attr.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Fixes axe `aria-valid-attr` (WCAG 4.1.2) — an element carrying a misspelled or
 * non-existent ARIA attribute name (e.g. `aria-labeledby`, `aria-checkd`). An
 * attribute name assistive tech doesn't recognize conveys nothing, so removing
 * it is the deterministic safe repair; inferring the intended valid attribute
 * is a guess left to a human.
 *
 * The attribute names come from the axe failure summary, which lists each
 * invalid name — so, unlike the all-`aria-*` fallback used by
 * {@link offendingAriaAttrs}, we pass an empty markup string and rely on the
 * summary alone, never stripping a *valid* `aria-*` attribute that happens to
 * sit on the same element. Claims only the axe id.
 */
export class AriaValidAttrFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-valid-attr';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    // Summary-only: the fallback to every aria-* on the element would wrongly
    // strip the valid attributes too, so pass '' as the markup.
    const names = offendingAriaAttrs(node.failureSummary, '');
    if (names.length === 0) {
      return this.humanFlag(violation, 'Could not determine which invalid ARIA attribute to remove');
    }

    let removed: string[] = [];
    const result = await editRecordedLine(
      node,
      line => {
        const out = removeNamedAttrs(line, names);
        removed = out.removed;
        return out.removed.length > 0 ? out.line : null;
      },
      `No invalid ARIA attribute (${names.join(', ')}) found on the source line`,
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Removed invalid ARIA attribute${removed.length > 1 ? 's' : ''}: ${removed.join(', ')}`,
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
