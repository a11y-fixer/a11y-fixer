import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeTimedMetaRefresh } from './meta-refresh.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Fixes axe `meta-refresh-no-exceptions` (WCAG 2.2.4) — the stricter sibling of
 * `meta-refresh` that flags *any* timed `<meta http-equiv="refresh">`, with no
 * allowance for long delays. The deterministic repair is the same: delete a pure
 * timed refresh (one with no `url=` redirect) so the page stops auto-reloading.
 *
 * A refresh carrying a `url=` redirect is human-flagged (removing it would
 * change navigation). This keys on its own axe id; {@link MetaRefreshFixer}
 * handles the 2.2.1 rule on the same markup, so whichever violation is processed
 * first applies the edit and the other finds nothing left and human-flags.
 */
export class MetaRefreshNoExceptionsFixer implements Fixer {
  readonly wcagId = '2.2.4';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'meta-refresh-no-exceptions';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeTimedMetaRefresh,
      'No pure timed meta refresh on the recorded line (a url= redirect needs a human)',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed time-based meta refresh',
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
