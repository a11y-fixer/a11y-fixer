import { readFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { collectMarkdownHeadings } from '../../scanner/markdown.js';
import { rewriteLine } from '../markdown-source.js';

/** An ATX heading line: optional ≤3 leading spaces, 1–6 `#`, then a space. */
const ATX_HEADING = /^(\s{0,3})(#{1,6})(\s+)/;

/**
 * Fixes `md-heading-order` violations (WCAG 2.4.6): a Markdown heading whose
 * level skips past its predecessor — e.g. an `##` followed by `####`. The
 * deterministic remediation (no AI) is to demote the offending heading to
 * `previousHeadingLevel + 1` by reducing its `#` count. Only ATX headings are
 * auto-fixed; Setext (underline) headings and anything ambiguous are flagged for
 * manual review rather than mis-edited.
 */
export class MarkdownHeadingOrderFixer implements Fixer {
  readonly wcagId = '2.4.6';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'md-heading-order';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node?.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to reorder the heading');
    }

    const content = await readFile(node.sourceFile, 'utf8').catch(() => null);
    if (content === null) {
      return this.humanFlag(violation, 'Could not read source file');
    }

    const headings = collectMarkdownHeadings(content);
    const idx = headings.findIndex(h => h.line === node.sourceLine);
    if (idx <= 0) {
      return this.humanFlag(violation, 'Could not determine the correct heading level');
    }

    const current = headings[idx];
    const targetLevel = headings[idx - 1].level + 1;
    if (current.level <= targetLevel) {
      return this.humanFlag(violation, 'Heading order needs a manual review');
    }

    let before = '';
    const after = await rewriteLine(node.sourceFile, node.sourceLine, (raw) => {
      const m = raw.match(ATX_HEADING);
      if (!m) return null; // Setext or non-ATX heading — don't guess.
      before = raw;
      return raw.replace(ATX_HEADING, `$1${'#'.repeat(targetLevel)}$3`);
    });
    if (after === null) {
      return this.humanFlag(violation, 'Heading is not an ATX heading — manual review needed');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Demoted h${current.level} to h${targetLevel} to fix Markdown heading order`,
      before,
      after,
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
