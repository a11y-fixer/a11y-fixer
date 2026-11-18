import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Unwraps a `<blink>`/`<marquee>` element on a source line, replacing the
 * element with its inner content and dropping the auto-moving wrapper, and
 * returns the rewritten line.
 *
 * Returns `null` when there is nothing deterministic to do: the line has no
 * `<blink>`/`<marquee>` element, or the element's opening/closing tags are not
 * both present on the one recorded line (a multi-line element can't be unwrapped
 * from a single line without touching others).
 */
export function unwrapBlinkMarquee(line: string): string | null {
  // Matches a whole <blink>…</blink> or <marquee …>…</marquee> on one line,
  // capturing the inner content. Non-greedy so adjacent elements don't merge.
  const re = /<(blink|marquee)\b[^>]*>([\s\S]*?)<\/\1\s*>/i;
  if (!re.test(line)) return null;

  return line.replace(re, (_match, _tag, inner) => inner);
}

/**
 * Fixes axe `blink` and `marquee` (WCAG 2.2.2) by unwrapping the deprecated
 * auto-moving element on the recorded source line, keeping its content. Both
 * elements animate without a user-controllable stop, failing Pause, Stop, Hide;
 * removing the wrapper while preserving the text is deterministic, so this lives
 * in the rule-based bucket.
 */
export class BlinkMarqueeFixer implements Fixer {
  readonly wcagId = '2.2.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'blink' || violation.id === 'marquee';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the element back to a component; flag it.
      return this.humanFlag(violation, 'No source location to unwrap blink/marquee');
    }

    let content: string;
    try {
      content = await readFile(node.sourceFile, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not read source file');
    }

    const lines = content.split('\n');
    const idx = node.sourceLine - 1;
    const original = lines[idx];
    if (original === undefined) {
      return this.humanFlag(violation, 'Recorded line is out of range');
    }

    const updated = unwrapBlinkMarquee(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'Recorded line has no single-line <blink>/<marquee> to unwrap',
      );
    }
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the unwrapped content');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Unwrapped <blink>/<marquee> so content no longer auto-moves',
      before: node.html,
      after: updated.trim(),
      sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
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
