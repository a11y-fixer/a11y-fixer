import type { Fixer, FixResult } from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readFile, writeFile } from 'node:fs/promises';

/**
 * Fixes HTML documents with no accessible title (axe `document-title`, WCAG
 * 2.4.2) by generating a `<title>` from the page's content.
 *
 * Unlike the accessible-name fixers, this one does not add an attribute to a
 * tagged element: the violation targets the document root, so `node.sourceLine`
 * is unreliable. Instead the fixer parses the file content to find its edit
 * point — filling an empty `<title></title>` or inserting a new `<title>` into
 * `<head>` — and writes the file directly (as {@link LinkTextFixer} does).
 *
 * Scope is the HTML scan path. `document-title` does not fire the same way on
 * JSX/React component files (where the title comes from `next/head` or
 * react-helmet), so a missing `<head>` is human-flagged rather than guessed at.
 */
export class DocumentTitleFixer implements Fixer {
  readonly wcagId = '2.4.2';
  readonly bucket = 'ai-assisted' as const;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'document-title';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot generate page title');
    }

    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');
    if (!node.sourceFile) {
      return this.humanFlag(violation, 'No source location to apply a title');
    }

    let content: string;
    try {
      content = await readFile(node.sourceFile, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not read source file to apply a title');
    }

    const emptyTitle = /<title\b[^>]*>\s*<\/title>/i;
    const headOpen = /<head\b[^>]*>/i;
    const hasEmptyTitle = emptyTitle.test(content);
    const headMatch = headOpen.exec(content);

    // Nothing to edit safely: no empty <title> and no <head> to insert into.
    if (!hasEmptyTitle && !headMatch) {
      return this.humanFlag(violation, 'No <head> to insert a title into');
    }

    const context = this.buildContext(content);

    let name: string;
    try {
      name = await this.aiProvider.suggestAccessibleName('<title></title>', context);
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }

    const escaped = this.escape(name);
    let after: string;
    if (hasEmptyTitle) {
      after = content.replace(emptyTitle, `<title>${escaped}</title>`);
    } else {
      const open = headMatch![0];
      after = content.replace(open, `${open}\n    <title>${escaped}</title>`);
    }

    try {
      await writeFile(node.sourceFile, after, 'utf8');
    } catch {
      return this.humanFlag(violation, `Suggested title "${name}" — could not apply to source`);
    }

    return {
      wcagId: this.wcagId,
      bucket: 'ai-assisted',
      applied: true,
      description: `Added AI-generated page title: "${name}"`,
      before: node.html,
      after: `<title>${escaped}</title>`,
      sourceLocation: { file: node.sourceFile, line: node.sourceLine ?? 1, column: node.sourceColumn ?? 1 },
    };
  }

  /**
   * Builds an AI prompt context from the page's content: the first `<h1>`, the
   * meta description, and a slice of the visible body text, so the generated
   * title reflects what the page is actually about.
   */
  private buildContext(content: string): string {
    const parts: string[] = [];

    const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(content);
    const h1Text = h1 ? this.stripTags(h1[1]) : '';
    if (h1Text) parts.push(`Main heading: ${h1Text}`);

    const desc = /<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["']/i.exec(content);
    if (desc?.[1]?.trim()) parts.push(`Meta description: ${desc[1].trim()}`);

    const body = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(content);
    const bodyText = this.stripTags(body ? body[1] : content).slice(0, 500);
    if (bodyText) parts.push(`Page text: ${bodyText}`);

    const context = parts.join('\n');
    return context
      ? `Generate a concise, descriptive HTML page title (document <title>) for this page.\n${context}`
      : 'Generate a concise, descriptive HTML page title (document <title>) for this page.';
  }

  private stripTags(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
