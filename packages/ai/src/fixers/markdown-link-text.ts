import type { Fixer, FixResult, A11yViolation } from '@a11y-fixer/core';
import { GENERIC_LINK_PATTERNS, locateAtColumn, writeReplacement, sanitizeInlineLabel } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';

/** Candidate Markdown link syntaxes, each anchored at the located column. */
interface LinkCandidate {
  anchored: RegExp;
  text(match: RegExpMatchArray): string;
  /** The link target for AI context: an href (inline) or `[ref]` identifier. */
  target(match: RegExpMatchArray): string;
  build(match: RegExpMatchArray, newText: string): string;
}

const CANDIDATES: LinkCandidate[] = [
  // Inline link: [text](href)
  {
    anchored: /^\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/,
    text: (m) => (m[1] ?? '').trim(),
    target: (m) => (m[2] ?? '').trim(),
    build: (m, t) => `[${t}](${m[2]})`,
  },
  // Reference-style link: [text][ref]
  {
    anchored: /^\[([^\]]*)\]\[([^\]]*)\]/,
    text: (m) => (m[1] ?? '').trim(),
    target: (m) => `reference "${(m[2] ?? '').trim()}"`,
    build: (m, t) => `[${t}][${m[2]}]`,
  },
];

/**
 * Fixes Markdown links with non-descriptive text — `[here](url)`, `[](url)`, a
 * bare URL used as its own text, or reference-style `[here][ref]` — by rewriting
 * the visible text via the AI provider. Keyed on the `md-link-text` id the
 * Markdown scanner emits, so it's registered before the broad (HTML-anchor)
 * {@link LinkTextFixer}, which also claims WCAG 2.4.4.
 */
export class MarkdownLinkTextFixer implements Fixer {
  readonly wcagId = '2.4.4';
  readonly bucket = 'ai-assisted' as const;
  // Independent per-element edit — fix every occurrence, not just nodes[0].
  readonly perNode = true;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'md-link-text';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'No AI provider configured — cannot rewrite link text');
    }

    const node = violation.nodes[0];
    if (!node?.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to apply');
    }
    const column = node.sourceColumn ?? 1;

    let matched: { candidate: LinkCandidate; located: Awaited<ReturnType<typeof locateAtColumn>> } | null = null;
    for (const candidate of CANDIDATES) {
      const located = await locateAtColumn(node.sourceFile, node.sourceLine, column, candidate.anchored);
      if (located) {
        matched = { candidate, located };
        break;
      }
    }
    if (!matched || !matched.located) {
      return this.humanFlag(violation, 'Markdown link not found at the recorded location');
    }
    const { candidate, located } = matched;
    const currentText = candidate.text(located.match);
    const target = candidate.target(located.match);

    // Belt-and-suspenders: only rewrite empty, generic, or bare-URL text — never
    // invent a replacement for text that might be meaningful.
    const bareUrl = currentText === target && /^(https?:\/\/|www\.)/i.test(currentText);
    if (currentText !== '' && !GENERIC_LINK_PATTERNS.test(currentText) && !bareUrl) {
      return this.humanFlag(violation, `Link text "${currentText}" may not be generic — flagging for manual review`);
    }

    const window = await readSourceLine(node.sourceFile, node.sourceLine);
    const context = `Markdown link to: ${target}. Surrounding content: ${window?.context ?? located.match[0]}`;

    let newText: string;
    try {
      newText = sanitizeInlineLabel(await this.aiProvider.rewriteLinkText(currentText, context));
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }

    const before = located.match[0];
    const replacement = candidate.build(located.match, newText);
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
