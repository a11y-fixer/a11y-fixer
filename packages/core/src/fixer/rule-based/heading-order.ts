import { readFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { collectHeadings, renameHeadingTag } from './rename-heading-tag.js';

/**
 * Fixes axe `heading-order` violations (WCAG 2.4.6): a heading that skips past a
 * level — e.g. an `<h2>` followed by an `<h4>`. The deterministic remediation is
 * to demote the offending heading to `previousHeadingLevel + 1`, which this
 * fixer applies by renaming its tag — no AI needed, so it lives in the
 * rule-based bucket.
 *
 * Only the clear skip-down case is auto-fixed. It claims the axe id
 * (`heading-order`); the ESLint path's 2.4.6 rule is `heading-has-content`, a
 * different problem left to EslintFixer. URL→JSX scans whose heading can't be
 * located in HTML source fall through to a human flag rather than mis-edit.
 */
export class HeadingOrderFixer implements Fixer {
  readonly wcagId = '2.4.6';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'heading-order';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to reorder the heading');
    }

    const content = await readFile(node.sourceFile, 'utf8').catch(() => null);
    if (content === null) {
      return this.humanFlag(violation, 'Could not read source file');
    }

    const headings = collectHeadings(content);
    const idx = headings.findIndex(h => h.line === node.sourceLine);
    if (idx <= 0) {
      // Not found, or it's the first heading (nothing precedes it to anchor to).
      return this.humanFlag(violation, 'Could not determine the correct heading level');
    }

    const current = headings[idx];
    const targetLevel = headings[idx - 1].level + 1;
    if (current.level <= targetLevel) {
      // Already consecutive (or shallower) — not the skip-down case we demote.
      return this.humanFlag(violation, 'Heading order needs a manual review');
    }

    const after = await renameHeadingTag(node.sourceFile, node.sourceLine, targetLevel);
    if (after === null) {
      return this.humanFlag(violation, 'Could not rewrite the heading tag in source');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Demoted <h${current.level}> to <h${targetLevel}> to fix heading order`,
      before: node.html,
      after,
      sourceLocation: {
        file: node.sourceFile,
        line: node.sourceLine,
        column: node.sourceColumn ?? 1,
      },
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
