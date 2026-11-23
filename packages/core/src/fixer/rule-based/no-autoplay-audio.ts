import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

/**
 * Removes a bare `autoplay` attribute from the `<audio>`/`<video>` opening tag on
 * `line`, returning the rewritten line (or `null` when there's no such tag or no
 * `autoplay` to remove).
 */
export function removeAutoplay(line: string): string | null {
  if (!/<(audio|video)\b[^>]*>/i.test(line)) return null;
  return removeAttribute(line, 'autoplay');
}

/**
 * Fixes axe `no-autoplay-audio` (WCAG 1.4.2) by removing the `autoplay` attribute
 * from an `<audio>`/`<video>` element on the recorded source line, so media no
 * longer plays sound on load. Deterministic, so it lives in the rule-based
 * bucket. Claims only the axe id.
 */
export class AutoplayAudioFixer implements Fixer {
  readonly wcagId = '1.4.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'no-autoplay-audio';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      removeAutoplay,
      'Recorded line has no <audio>/<video> autoplay to remove',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed autoplay so media does not play sound on load',
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
