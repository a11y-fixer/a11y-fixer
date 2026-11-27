import type { Fixer, FixResult, A11yViolation } from '@a11y-fixer/core';
import { locateAtColumn, writeReplacement, sanitizeInlineLabel } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';

/** Candidate Markdown/HTML image syntaxes, each anchored at the located column. */
interface ImageCandidate {
  anchored: RegExp;
  /** The image's `src`/`ref` for AI context. */
  ref(match: RegExpMatchArray): string;
  /** Builds the replacement text for the whole matched construct. */
  build(match: RegExpMatchArray, alt: string): string;
}

const CANDIDATES: ImageCandidate[] = [
  // Inline image: ![](src)
  {
    anchored: /^!\[\s*\]\(([^)]+)\)/,
    ref: (m) => m[1] ?? '',
    build: (m, alt) => `![${alt}](${m[1]})`,
  },
  // Reference-style image: ![][ref] or ![][]
  {
    anchored: /^!\[\s*\]\[([^\]]*)\]/,
    ref: (m) => m[1] ?? '',
    build: (m, alt) => `![${alt}][${m[1]}]`,
  },
  // Raw inline HTML image: <img ...>
  {
    anchored: /^<img\b[^>]*>/i,
    ref: (m) => m[0].match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i)?.[1]?.replace(/^['"]|['"]$/g, '') ?? '',
    build: (m, alt) => insertImgAlt(m[0], alt),
  },
];

/**
 * Fixes Markdown images with empty/missing alt text — inline `![](img.png)`,
 * reference-style `![][ref]`, and raw inline `<img>` — by generating alt via the
 * AI provider and rewriting the construct in place. Keyed on the `md-image-alt`
 * and `md-html-img-alt` ids the Markdown scanner emits, so it's registered
 * before the broad (HTML `<img>`-only) {@link AltTextFixer}, which also claims
 * WCAG 1.1.1.
 */
export class MarkdownAltTextFixer implements Fixer {
  readonly wcagId = '1.1.1';
  readonly bucket = 'ai-assisted' as const;
  // Independent per-element edit — fix every occurrence, not just nodes[0].
  readonly perNode = true;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'md-image-alt' || violation.id === 'md-html-img-alt';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'No AI provider configured — cannot generate alt text');
    }

    const node = violation.nodes[0];
    if (!node?.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to apply');
    }
    const column = node.sourceColumn ?? 1;

    let matched: { candidate: ImageCandidate; located: Awaited<ReturnType<typeof locateAtColumn>> } | null = null;
    for (const candidate of CANDIDATES) {
      const located = await locateAtColumn(node.sourceFile, node.sourceLine, column, candidate.anchored);
      if (located) {
        matched = { candidate, located };
        break;
      }
    }
    if (!matched || !matched.located) {
      return this.humanFlag(violation, 'Image with missing alt not found at the recorded location');
    }
    const { candidate, located } = matched;
    const src = candidate.ref(located.match);

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
    const replacement = candidate.build(located.match, altText);
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

/** Escapes a string for use inside a double-quoted HTML attribute value. */
function sanitizeHtmlAttr(text: string): string {
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}

/** Sets `alt` on a raw `<img>` tag: replaces an existing empty alt, else inserts one. */
function insertImgAlt(tag: string, alt: string): string {
  const safe = sanitizeHtmlAttr(alt);
  if (/\balt\s*=\s*("[^"]*"|'[^']*')/i.test(tag)) {
    return tag.replace(/\balt\s*=\s*("[^"]*"|'[^']*')/i, `alt="${safe}"`);
  }
  return tag.replace(/^<img\b/i, `<img alt="${safe}"`);
}
