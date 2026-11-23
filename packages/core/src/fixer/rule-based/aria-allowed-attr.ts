import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { removeAttribute } from '../shared/attrs.js';

/**
 * Extracts the offending ARIA attribute names from an axe `aria-allowed-attr` /
 * `aria-prohibited-attr` failure summary, which names each disallowed attribute,
 * e.g. "ARIA attribute is not allowed: aria-expanded="true"". Falls back to every
 * `aria-*` attribute present on the element markup when the summary is empty.
 * Returns a de-duplicated, lower-cased list.
 */
export function offendingAriaAttrs(failureSummary: string, html: string): string[] {
  const source = failureSummary.trim().length > 0 ? failureSummary : html;
  const names = new Set<string>();
  for (const m of source.matchAll(/\baria-[a-z-]+/gi)) {
    names.add(m[0].toLowerCase());
  }
  return [...names];
}

/**
 * Fixes axe `aria-allowed-attr` and `aria-prohibited-attr` (both WCAG 4.1.2) by
 * removing the ARIA attribute(s) the rule reports as not permitted on the element
 * or its role. Stripping an unsupported/prohibited attribute is the deterministic
 * repair axe itself recommends, so this lives in the rule-based bucket. Anything
 * it can't locate on the recorded source line is human-flagged, never guessed.
 */
export class AriaAllowedAttrFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-allowed-attr' || violation.id === 'aria-prohibited-attr';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to remove the ARIA attribute');
    }

    const attrs = offendingAriaAttrs(node.failureSummary, node.html);
    if (attrs.length === 0) {
      return this.humanFlag(violation, 'Could not determine which ARIA attribute to remove');
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

    let updated = original;
    const removed: string[] = [];
    for (const name of attrs) {
      const next = removeAttribute(updated, name);
      if (next !== null) {
        updated = next;
        removed.push(name);
      }
    }

    if (removed.length === 0) {
      return this.humanFlag(
        violation,
        `No disallowed ARIA attribute (${attrs.join(', ')}) found on the source line`,
      );
    }

    lines[idx] = updated;
    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the cleaned-up element');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Removed disallowed ARIA attribute${removed.length > 1 ? 's' : ''}: ${removed.join(', ')}`,
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
