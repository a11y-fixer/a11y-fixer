import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Normalizes a `tabindex` value for axe `tabindex` (WCAG 2.4.3). A positive
 * value forces an element ahead of the natural DOM focus order; rewriting it to
 * `0` keeps the element focusable without hijacking the order.
 *
 * Returns `'0'` when the value is a positive integer, or `null` when it is
 * already compliant (`0`, negative, or non-numeric) and there is nothing to do.
 */
export function normalizeTabindex(value: string): string | null {
  const num = Number.parseInt(value.trim(), 10);
  if (Number.isInteger(num) && num > 0) return '0';
  return null;
}

/**
 * Fixes axe `tabindex` (WCAG 2.4.3) by rewriting a positive `tabindex` value to
 * `0` on the recorded source line. Deterministic, so it lives in the rule-based
 * bucket alongside {@link MetaViewportFixer}.
 *
 * Claims only the axe id; a jsx-a11y equivalent, if any, stays with EslintFixer.
 */
export class TabindexFixer implements Fixer {
  readonly wcagId = '2.4.3';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'tabindex';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the element back to a component; flag it.
      return this.humanFlag(violation, 'No source location to fix the tabindex');
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

    // Match the tabindex attribute (single- or double-quoted) on the line.
    const tabindexRe = /tabindex\s*=\s*(["'])([^"']*)\1/i;
    const match = original.match(tabindexRe);
    if (!match) {
      return this.humanFlag(violation, 'No tabindex attribute on the recorded line');
    }

    const normalized = normalizeTabindex(match[2]);
    if (normalized === null) {
      return this.humanFlag(violation, 'tabindex is already in natural order');
    }

    const quote = match[1];
    const updated = original.replace(tabindexRe, `tabindex=${quote}${normalized}${quote}`);
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
      description: 'Rewrote positive tabindex to 0 to restore natural focus order',
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
