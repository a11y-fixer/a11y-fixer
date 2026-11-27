import type { Fixer, FixResult } from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import { GENERIC_LINK_PATTERNS } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readFile, writeFile } from 'node:fs/promises';
import { readSourceLine } from './source-line.js';

// Re-exported for the Markdown link fixer and existing importers; the canonical
// definition now lives in @a11y-fixer/core alongside the Markdown scanner.
export { GENERIC_LINK_PATTERNS };

export class LinkTextFixer implements Fixer {
  readonly wcagId = '2.4.4';
  readonly bucket = 'ai-assisted' as const;
  // Independent per-element edit — fix every occurrence, not just nodes[0].
  readonly perNode = true;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    // Responsibility only — fix() reports the missing-API-key case.
    return violation.wcagId === '2.4.4';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot rewrite link text');
    }

    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    // On the ESLint path node.html is "file:line:col", so read the real source
    // line for the anchor markup, text and href.
    const source = node.sourceFile && node.sourceLine
      ? await readSourceLine(node.sourceFile, node.sourceLine)
      : null;
    const markup = source?.line ?? node.html;

    // Extract the text between the first `>` and the next `<` with indexOf rather
    // than a scanning regex: `/>([^<]+)</` backtracks quadratically (js/polynomial-redos)
    // on a line that has a `>` but no later `<`, and markup is untrusted file input.
    const gt = markup.indexOf('>');
    const lt = gt === -1 ? -1 : markup.indexOf('<', gt + 1);
    const currentText = gt !== -1 && lt > gt + 1 ? markup.slice(gt + 1, lt).trim() : '';

    if (!GENERIC_LINK_PATTERNS.test(currentText)) {
      return this.humanFlag(violation, `Link text "${currentText}" may not be generic — flagging for manual review`);
    }

    const hrefMatch = markup.match(/href=["']([^"']+)["']/);
    const context = `Link href: ${hrefMatch?.[1] ?? 'unknown'}. Surrounding code: ${source?.context ?? markup}`;

    let newText: string;
    try {
      newText = await this.aiProvider.rewriteLinkText(currentText, context);
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (node.sourceFile && node.sourceLine) {
      const before = markup;
      const after = await this.applyLinkTextToSource(node.sourceFile, node.sourceLine, currentText, newText);
      return {
        wcagId: this.wcagId,
        bucket: 'ai-assisted',
        applied: after !== null,
        description: `Rewrote link text: "${currentText}" → "${newText}"`,
        before,
        after: after ?? undefined,
        sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
      };
    }

    return this.humanFlag(violation, `Suggested: replace "${currentText}" with "${newText}"`);
  }

  private async applyLinkTextToSource(file: string, line: number, oldText: string, newText: string): Promise<string | null> {
    try {
      const content = await readFile(file, 'utf8');
      const lines = content.split('\n');
      const lineIdx = line - 1;
      const original = lines[lineIdx];

      if (!original?.includes(oldText)) return null;

      const updated = original.replace(oldText, newText);
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
