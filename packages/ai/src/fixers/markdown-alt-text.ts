import type { Fixer, FixResult, A11yViolation } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';
import { locateAtColumn, writeReplacement, sanitizeInlineLabel } from './markdown-source.js';

/** Anchored at the located column: an empty-alt Markdown image `![](src)`. */
const EMPTY_ALT_IMAGE = /^!\[\s*\]\(([^)]+)\)/;

/**
 * Fixes Markdown images with empty/missing alt text — `![](img.png)` — by
 * generating alt via the AI provider and rewriting the line to `![alt](img.png)`.
 * Keyed on the `md-image-alt` id the Markdown scanner emits, so it's registered
 * before the broad (HTML `<img>`-only) {@link AltTextFixer} which also claims
 * WCAG 1.1.1.
 */
export class MarkdownAltTextFixer implements Fixer {
  readonly wcagId = '1.1.1';
  readonly bucket = 'ai-assisted' as const;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'md-image-alt';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot generate alt text');
    }

    const node = violation.nodes[0];
    if (!node?.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to apply');
    }
    const column = node.sourceColumn ?? 1;

    const located = await locateAtColumn(node.sourceFile, node.sourceLine, column, EMPTY_ALT_IMAGE);
    if (!located) {
      return this.humanFlag(violation, 'Empty-alt Markdown image not found at the recorded location');
    }
    const src = located.match[1] ?? '';

    const window = await readSourceLine(node.sourceFile, node.sourceLine);
    const context = `Markdown image: ${located.match[0]}\nImage src: ${src}` +
      (window?.context ? `\nSurrounding content:\n${window.context}` : '');

    let altText: string;
    try {
      altText = sanitizeInlineLabel(await this.aiProvider.suggestAltText(context));
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }

    const before = located.match[0];
    const replacement = `![${altText}](${src})`;
    const after = await writeReplacement(node.sourceFile, located, replacement);

    return {
      wcagId: this.wcagId,
      bucket: 'ai-assisted',
      applied: true,
      description: `Added AI-generated Markdown alt text: "${altText}"`,
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
