import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Inserts `tabindex="0"` into the first opening tag on a source line so axe
 * `scrollable-region-focusable` (WCAG 2.1.1) can reach the region by keyboard.
 *
 * Returns the rewritten line, or `null` when there is nothing deterministic to
 * do: the line already carries a `tabindex` attribute, or it has no opening tag.
 */
export function addTabindexZero(line: string): string | null {
  if (/\btabindex\s*=/i.test(line)) return null;

  // Match the first opening tag: <name[ attrs][/]>
  const tagRe = /<([a-zA-Z][\w-]*)((?:\s[^<>]*)?)(\/?)>/;
  const match = line.match(tagRe);
  if (!match) return null;

  const [full, name, attrs, selfClose] = match;
  const replacement = `<${name} tabindex="0"${attrs}${selfClose}>`;
  return line.replace(full, replacement);
}

/**
 * Fixes axe `scrollable-region-focusable` (WCAG 2.1.1) by adding
 * `tabindex="0"` to the flagged element on the recorded source line, making the
 * scrollable region reachable by keyboard. Deterministic, so it lives in the
 * rule-based bucket alongside {@link TabindexFixer}.
 *
 * Claims only the axe id; a jsx-a11y equivalent, if any, stays with EslintFixer.
 */
export class ScrollableRegionFocusableFixer implements Fixer {
  readonly wcagId = '2.1.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'scrollable-region-focusable';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the element back to a component; flag it.
      return this.humanFlag(violation, 'No source location to add the tabindex');
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

    const updated = addTabindexZero(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'Recorded line already has a tabindex or no opening tag to make focusable',
      );
    }
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the fixed tabindex');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Added tabindex="0" so keyboard users can focus the scrollable region',
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
