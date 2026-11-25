import type { Fixer, FixResult } from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { readSourceLine } from './source-line.js';
import { openingTagRegex } from './element-tag.js';
import { addAttributeToElement } from '@a11y-fixer/core';

/**
 * Shared implementation for the ARIA widget accessible-name fixers whose role
 * can sit on any tag (`<div role="tooltip">`, `<span role="meter">`, …) and
 * whose fix is a safe single-line `aria-label` insert. Three fixers —
 * {@link AriaTooltipNameFixer}, {@link AriaMeterNameFixer},
 * {@link AriaProgressbarNameFixer} — are thin wrappers over this, mirroring the
 * standalone pattern of `aria-toggle-field-name.ts` without triplicating its
 * body.
 *
 * Like the other aria-name fixers, dispatch keys on the axe rule id
 * (`violation.id === ruleId`): these ids are absent from core's `AXE_WCAG_MAP`,
 * so `violation.wcagId` is the raw id, not the shared success criterion.
 */
export interface AriaNamedWidgetConfig {
  /** The axe rule id this fixer claims, e.g. `aria-tooltip-name`. */
  readonly ruleId: string;
  /** WCAG success criterion reported in the FixResult, e.g. `4.1.2`. */
  readonly wcagId: string;
  /** Human-readable role label used in the AI prompt and descriptions. */
  readonly label: string;
}

export async function fixAriaNamedWidget(
  config: AriaNamedWidgetConfig,
  aiProvider: AIProvider,
  violation: A11yViolation,
): Promise<FixResult> {
  const humanFlag = (note: string): FixResult => ({
    wcagId: config.wcagId,
    bucket: 'human-flagged',
    applied: false,
    description: note,
    before: violation.nodes[0]?.html ?? '',
    humanNote: note,
  });

  if (!aiProvider.available()) {
    return humanFlag('ANTHROPIC_API_KEY not set — cannot generate aria-label');
  }

  const node = violation.nodes[0];
  if (!node) return humanFlag('No node data');

  if (!node.sourceFile || !node.sourceLine) {
    return humanFlag('No source location to apply an aria-label');
  }

  const source = await readSourceLine(node.sourceFile, node.sourceLine);
  const markup = source?.line ?? node.html;
  const tagRegex = openingTagRegex(markup);
  if (!tagRegex) {
    return humanFlag('Could not locate the element opening tag to apply an aria-label');
  }

  const context = source?.context
    ? `${config.label}: ${source.line}\nSurrounding code:\n${source.context}`
    : `${config.label}: ${node.html}`;

  let name: string;
  try {
    name = await aiProvider.suggestAccessibleName(markup, context);
  } catch (err) {
    return humanFlag(`AI provider error: ${err instanceof Error ? err.message : String(err)}`);
  }

  const after = await addAttributeToElement(
    node.sourceFile,
    node.sourceLine,
    tagRegex,
    'aria-label',
    name,
  );

  if (after === null) {
    return humanFlag(`Suggested aria-label "${name}" — could not apply to source`);
  }

  return {
    wcagId: config.wcagId,
    bucket: 'ai-assisted',
    applied: true,
    description: `Added AI-generated ${config.label.toLowerCase()} aria-label: "${name}"`,
    before: markup,
    after,
    sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
  };
}

/** Base class wiring the shared config + body into the {@link Fixer} shape. */
export abstract class AriaNamedWidgetFixer implements Fixer {
  abstract readonly config: AriaNamedWidgetConfig;
  readonly bucket = 'ai-assisted' as const;
  // Independent per-element edit — fix every occurrence, not just nodes[0].
  readonly perNode = true;

  constructor(
    protected readonly aiProvider: AIProvider,
    protected readonly rootDir: string,
  ) {}

  get wcagId(): string {
    return this.config.wcagId;
  }

  canFix(violation: A11yViolation): boolean {
    return violation.id === this.config.ruleId;
  }

  fix(violation: A11yViolation): Promise<FixResult> {
    return fixAriaNamedWidget(this.config, this.aiProvider, violation);
  }
}
