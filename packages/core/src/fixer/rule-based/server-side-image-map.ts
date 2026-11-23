import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes the `ismap` attribute from the `<img>` opening tag on `line`, returning
 * the rewritten line (or `null` when there's no `<img>` tag or no `ismap`).
 */
export function removeIsMap(line: string): string | null {
  if (!/<img\b[^>]*>/i.test(line)) return null;
  return removeAttribute(line, 'ismap');
}

/**
 * Fixes axe `server-side-image-map` (WCAG 2.1.1) by removing the `ismap`
 * attribute from an `<img>` element on the recorded source line. A server-side
 * image map can't be operated by keyboard; dropping `ismap` turns it into an
 * ordinary image (the link still works), which is the deterministic safe repair.
 * Claims only the axe id.
 */
export class ServerSideImageMapFixer implements Fixer {
  readonly wcagId = '2.1.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'server-side-image-map';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeIsMap,
      'Recorded line has no <img ismap> to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed ismap so the image is not a keyboard-inaccessible server-side map',
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
