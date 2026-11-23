import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeNamedAttrs } from '../shared/attrs.js';
import { offendingAriaAttrs } from './aria-allowed-attr.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Fixes axe `aria-conditional-attr` (WCAG 4.1.2) — an ARIA state attribute used
 * where the host element already determines that state, so the author-supplied
 * value can disagree with the real one (e.g. `aria-checked` on a native
 * `<input type="checkbox">`, or `aria-selected` where it isn't permitted). The
 * deterministic safe repair is to remove the conflicting attribute and let the
 * element expose the correct state itself.
 *
 * The offending attribute names come from the axe failure summary; we pass empty
 * markup so the {@link offendingAriaAttrs} all-`aria-*` fallback never strips an
 * unrelated valid attribute. Claims only the axe id.
 */
export class AriaConditionalAttrFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-conditional-attr';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const names = offendingAriaAttrs(node.failureSummary, '');
    if (names.length === 0) {
      return this.humanFlag(violation, 'Could not determine which conditional ARIA attribute to remove');
    }

    let removed: string[] = [];
    const result = await editRecordedLine(
      node,
      line => {
        const out = removeNamedAttrs(line, names);
        removed = out.removed;
        return out.removed.length > 0 ? out.line : null;
      },
      `No conditional ARIA attribute (${names.join(', ')}) found on the source line`,
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Removed conflicting conditional ARIA attribute${removed.length > 1 ? 's' : ''}: ${removed.join(', ')}`,
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
