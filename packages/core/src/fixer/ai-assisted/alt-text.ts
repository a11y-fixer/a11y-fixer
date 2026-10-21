import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation, A11yNode } from '../../detector/index.js';
import type { AIProvider } from '../../ai-provider/index.js';
import { readFile, writeFile } from 'node:fs/promises';
import { readSourceLine } from './source-line.js';

/** Supplies a screenshot buffer for an element, enabling vision-based alt text. */
export interface ScreenshotProvider {
  screenshotElement(target: string[]): Promise<Buffer | null>;
}

export class AltTextFixer implements Fixer {
  readonly wcagId = '1.1.1';
  readonly bucket = 'ai-assisted' as const;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
    private readonly screenshots?: ScreenshotProvider,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.wcagId === '1.1.1' && this.aiProvider.available();
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot generate alt text');
    }

    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    // On the ESLint path node.html is "file:line:col", so read the real source
    // line for the <img> markup and src.
    const source = node.sourceFile && node.sourceLine
      ? await readSourceLine(node.sourceFile, node.sourceLine)
      : null;
    const markup = source?.line ?? node.html;
    const srcMatch = markup.match(/src=["']([^"']+)["']/);
    const imageSrc = srcMatch?.[1] ?? '';
    const context = source?.context
      ? `Image element: ${source.line}\nSurrounding code:\n${source.context}`
      : `Image element: ${node.html}`;

    let altText: string;
    try {
      altText = await this.generateAltText(node, imageSrc, context);
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (node.sourceFile && node.sourceLine) {
      const before = markup;
      const after = await this.applyAltToSource(node.sourceFile, node.sourceLine, altText);
      return {
        wcagId: this.wcagId,
        bucket: 'ai-assisted',
        applied: after !== null,
        description: `Added AI-generated alt text: "${altText}"`,
        before,
        after: after ?? undefined,
        sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
      };
    }

    return this.humanFlag(violation, `Suggested alt text: "${altText}" — no source location to apply`);
  }

  /** Vision when a screenshot is available, otherwise a context-only description. */
  private async generateAltText(node: A11yNode, imageSrc: string, context: string): Promise<string> {
    if (this.screenshots) {
      const buffer = await this.screenshots.screenshotElement(node.target);
      if (buffer && buffer.length > 0) {
        return this.aiProvider.describeImage(buffer, context);
      }
    }
    return this.aiProvider.suggestAltText(
      imageSrc ? `${context}\nImage src: ${imageSrc}` : context,
    );
  }

  private async applyAltToSource(file: string, line: number, altText: string): Promise<string | null> {
    try {
      const content = await readFile(file, 'utf8');
      const lines = content.split('\n');
      const lineIdx = line - 1;
      const original = lines[lineIdx];

      if (!original) return null;

      // Add alt prop to <img> tag if missing
      const updated = original.replace(/<img(\s)/g, `<img alt="${altText}"$1`);
      if (updated === original) return null; // already has alt or pattern didn't match

      lines[lineIdx] = updated;
      await writeFile(file, lines.join('\n'), 'utf8');
      return updated;
    } catch {
      return null;
    }
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
