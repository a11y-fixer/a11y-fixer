import type { Fixer, FixResult } from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';
import { sanitizeAccessibleName } from './sanitize-name.js';
import { addAttributeToElement } from '@a11y-fixer/core';

/**
 * Buttons with no accessible name — most often icon-only buttons — fixed by
 * adding an AI-generated `aria-label`. Adding aria-label is a safe single-line
 * edit; it never restructures JSX.
 *
 * Claims both detection paths for the same defect (WCAG 4.1.2):
 * - the HTML/axe path's `button-name`, and
 * - the JSX static path's `a11y-custom/button-must-have-label` (the inline rule
 *   in core's EslintRunner). Without the JSX id, these fell through to the
 *   deterministic EslintFixer, which can only human-flag them.
 */
const BUTTON_RULE_IDS = new Set(['button-name', 'a11y-custom/button-must-have-label']);

export class ButtonNameFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'ai-assisted' as const;
  // Each button is an independent aria-label insert, so fix every occurrence.
  readonly perNode = true;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    // Responsibility only — fix() reports the missing-API-key case.
    return BUTTON_RULE_IDS.has(violation.id);
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot generate button label');
    }

    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to apply an aria-label');
    }

    const source = await readSourceLine(node.sourceFile, node.sourceLine);
    const markup = source?.line ?? node.html;
    const context = source?.context
      ? `Button element: ${source.line}\nSurrounding code:\n${source.context}`
      : `Button element: ${node.html}`;

    let rawName: string;
    try {
      rawName = await this.aiProvider.suggestAccessibleName(markup, context);
    } catch (err) {
      return this.humanFlag(violation, `AI provider error: ${err instanceof Error ? err.message : String(err)}`);
    }

    const name = sanitizeAccessibleName(rawName);
    if (name === null) {
      return this.humanFlag(
        violation,
        'AI could not produce a usable button label from the available context — needs human review',
      );
    }

    // Tolerate `<button` alone at end of line (multi-line JSX): the tail may be
    // whitespace, `/`, `>`, or end-of-line.
    const after = await addAttributeToElement(
      node.sourceFile,
      node.sourceLine,
      /<button(\s|\/|>|$)/g,
      'aria-label',
      name,
    );

    if (after === null) {
      return this.humanFlag(violation, `Suggested aria-label "${name}" — could not apply to source`);
    }

    return {
      wcagId: this.wcagId,
      bucket: 'ai-assisted',
      applied: true,
      description: `Added AI-generated button aria-label: "${name}"`,
      before: markup,
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
