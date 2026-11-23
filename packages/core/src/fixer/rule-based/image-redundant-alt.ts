import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Empties the `<img>`'s `alt` attribute on `line` (making the image decorative),
 * returning the rewritten line.
 *
 * axe `image-redundant-alt` (WCAG 1.1.1) fires when an image's alt text repeats
 * adjacent visible text (e.g. the link/figcaption next to it), so screen readers
 * announce it twice. The deterministic repair is to give the image an empty alt
 * so the already-present text carries the meaning once.
 *
 * Returns `null` when there's no `<img>` on the line, it has no `alt` attribute,
 * or the `alt` is already empty (nothing to do).
 */
export function emptyRedundantAlt(line: string): string | null {
  if (!/<img\b[^>]*>/i.test(line)) return null;
  const alt = readAttr(line, 'alt');
  if (alt === null || alt.length === 0) return null;
  return line.replace(/(\balt\s*=\s*)(["'])[\s\S]*?\2/i, '$1$2$2');
}

/**
 * Fixes axe `image-redundant-alt` (WCAG 1.1.1) by emptying the `alt` of an image
 * whose alt duplicates adjacent text, on the recorded source line. Deterministic,
 * so it lives in the rule-based bucket. Claims only the axe id.
 */
export class ImageRedundantAltFixer implements Fixer {
  readonly wcagId = '1.1.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'image-redundant-alt';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      emptyRedundantAlt,
      'Recorded line has no <img> with a non-empty alt to empty',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Emptied redundant alt so adjacent text is not announced twice',
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
