import type { Fixer, FixResult, A11yViolation } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';
import { GENERIC_LINK_PATTERNS } from './link-text.js';
import { locateAtColumn, writeReplacement } from './markdown-source.js';

/** Anchored at the located column: a Markdown inline link `[text](href)`. */
const INLINE_LINK = /^\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;

/**
 * Fixes Markdown links with non-descriptive text — `[here](url)`, `[](url)`, or
 * a bare URL used as its own text — by rewriting the visible text via the AI
 * provider: `[descriptive text](url)`. Keyed on the `md-link-text` id the
 * Markdown scanner emits, so it's registered before the broad (HTML-anchor)
 * {@link LinkTextFixer}, which also claims WCAG 2.4.4.
 */
export class MarkdownLinkTextFixer implements Fixer {
  readonly wcagId = '2.4.4';
  readonly bucket = 'ai-assisted' as const;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'md-link-text';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot rewrite link text');
    }

    const node = violation.nodes[0];
    if (!node?.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to apply');
    }
    const column = node.sourceColumn ?? 1;

    const located = await locateAtColumn(node.sourceFile, node.sourceLine, column, INLINE_LINK);
    if (!located) {
      return this.humanFlag(violation, 'Markdown link not found at the recorded location');
    }
    const currentText = (located.match[1] ?? '').trim();
    const href = (located.match[2] ?? '').trim();

    // Belt-and-suspenders: only rewrite empty, generic, or bare-URL text. The
    // scanner already filters to these, but never invent a replacement for text
    // that might be meaningful.
    const bareUrl = currentText === href && /^(https?:\/\/|www\.)/i.test(currentText);
    if (currentText !== '' && !GENERIC_LINK_PATTERNS.test(currentText) && !bareUrl) {
      return this.humanFlag(violation, `Link text "${currentText}" may not be generic — flagging for manual review`);
    }

    const window = await readSourceLine(node.sourceFile, node.sourceLine);
    const context = `Markdown link to: ${href}. Surrounding content: ${window?.context ?? located.match[0]}`;

    let newText: string;
    try {
      newText = await this.aiProvider.rewriteLinkText(currentText, context);
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }

    const before = located.match[0];
    const replacement = `[${newText}](${href})`;
    const after = await writeReplacement(node.sourceFile, located, replacement);

    return {
      wcagId: this.wcagId,
      bucket: 'ai-assisted',
      applied: true,
      description: `Rewrote Markdown link text: "${currentText}" → "${newText}"`,
      before,
      after,
      sourceLocation: { file: node.sourceFile, line: node.sourceLine, column },
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
