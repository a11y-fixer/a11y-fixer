import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import { setElementText } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';

const TH_TAGS = new Set(['th']);

/**
 * Fixes table header cells with no accessible text (axe `empty-table-header`,
 * WCAG 1.3.1) by filling the `<th>` with an AI-generated label inferred from the
 * surrounding table markup. Only plain empty `<th>` on the recorded source line
 * are auto-filled; a header that already has element children, has no source
 * location, or isn't on the recorded line is human-flagged.
 */
export class EmptyTableHeaderFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'ai-assisted' as const;
  // Independent per-element edit — fix every occurrence, not just nodes[0].
  readonly perNode = true;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'empty-table-header';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot generate table header text');
    }

    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to fill the table header');
    }

    const source = await readSourceLine(node.sourceFile, node.sourceLine, 4);
    const markup = source?.line ?? node.html;
    const context = source?.context
      ? `Empty table header cell: ${source.line}\nSurrounding table markup:\n${source.context}`
      : `Empty table header cell: ${node.html}`;

    let text: string;
    try {
      text = (await this.aiProvider.suggestAccessibleName(markup, context)).trim();
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (text.length === 0) {
      return this.humanFlag(violation, 'AI returned an empty table header label');
    }

    let content: string;
    try {
      content = await readFile(node.sourceFile, 'utf8');
    } catch {
      return this.humanFlag(violation, `Suggested header "${text}" — could not read source file`);
    }

    const updated = setElementText(content, node.sourceLine, TH_TAGS, text);
    if (updated === null) {
      return this.humanFlag(violation, `Suggested header "${text}" — could not apply to source`);
    }

    try {
      await writeFile(node.sourceFile, updated, 'utf8');
    } catch {
      return this.humanFlag(violation, `Suggested header "${text}" — could not write the file`);
    }

    return {
      wcagId: this.wcagId,
      bucket: 'ai-assisted',
      applied: true,
      description: `Filled empty table header with AI-generated text: "${text}"`,
      before: markup,
      after: updated.split('\n')[node.sourceLine - 1]?.trim(),
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
