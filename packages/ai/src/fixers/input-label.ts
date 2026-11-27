import type { Fixer, FixResult } from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';
import { sanitizeAccessibleName } from './sanitize-name.js';
import { addAttributeToElement } from '@a11y-fixer/core';

/**
 * Inputs with no accessible label (WCAG 1.3.1), fixed by adding an AI-generated
 * `aria-label`. Claims the JSX static path's `a11y-custom/input-must-have-label`
 * rule (the inline rule in core's EslintRunner, which fires on a labelable
 * `<input>` that carries no `aria-label` / `aria-labelledby` / `title` / `id`).
 *
 * This is the input counterpart to {@link ButtonNameFixer}: both convert a
 * JSX-path accessible-name finding into a safe single-line `aria-label` insert
 * on the recorded source line, rather than restructuring JSX or inventing a
 * `<label htmlFor>` association (which needs a human to place correctly).
 *
 * The HTML/axe path's `label` rule is handled separately by
 * {@link FormLabelFixer}; this fixer does not claim it.
 */
export class InputLabelFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'ai-assisted' as const;
  // Each input is an independent aria-label insert, so fix every occurrence.
  readonly perNode = true;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    // Responsibility only — fix() reports the missing-API-key case.
    return violation.id === 'a11y-custom/input-must-have-label';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    if (!this.aiProvider.available()) {
      return this.humanFlag(violation, 'ANTHROPIC_API_KEY not set — cannot generate input label');
    }

    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to apply an aria-label');
    }

    const source = await readSourceLine(node.sourceFile, node.sourceLine);
    const markup = source?.line ?? node.html;
    const context = source?.context
      ? `Input element: ${source.line}\nSurrounding code:\n${source.context}`
      : `Input element: ${node.html}`;

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
        'AI could not produce a usable input label from the available context — needs human review',
      );
    }

    // `<input>` is void/self-closing: the tail after the tag name may be
    // whitespace, a `/` (self-close), `>`, or end-of-line (multi-line JSX).
    const after = await addAttributeToElement(
      node.sourceFile,
      node.sourceLine,
      /<input(\s|\/|>|$)/g,
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
      description: `Added AI-generated input aria-label: "${name}"`,
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
