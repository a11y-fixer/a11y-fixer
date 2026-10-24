import { FixerRegistry } from './registry.js';
import { EslintFixer } from './rule-based/eslint-fixer.js';
import { HtmlLangFixer } from './rule-based/html-lang.js';
import { HeadingOrderFixer } from './rule-based/heading-order.js';
import { MetaViewportFixer } from './rule-based/meta-viewport.js';
import { ColorContrastFixer } from './rule-based/color-contrast.js';
import { AltTextFixer, type ScreenshotProvider } from './ai-assisted/alt-text.js';
import { LinkTextFixer } from './ai-assisted/link-text.js';
import { ButtonNameFixer } from './ai-assisted/button-name.js';
import { FormLabelFixer } from './ai-assisted/form-label.js';
import type { AIProvider } from '../ai-provider/index.js';

/** WCAG ids whose ESLint rules eslint-plugin-jsx-a11y can auto-fix with --fix. */
const ESLINT_FIXABLE_WCAG_IDS = ['3.1.1', '4.1.2', '1.3.1', '2.4.6'];

/**
 * Builds the registry used by both the CLI and the GitHub Action, so the two
 * wire-up sites stay in sync. AI-assisted fixers are registered first: with
 * canFix-based dispatch they claim the axe rules (button-name, label, …) that
 * share a WCAG id with an ESLint rule, before the generic EslintFixer — whose
 * canFix only matches jsx-a11y/ ids anyway.
 */
export function buildDefaultRegistry(
  aiProvider: AIProvider,
  rootDir: string,
  screenshots?: ScreenshotProvider,
): FixerRegistry {
  const registry = new FixerRegistry();

  registry.register(new AltTextFixer(aiProvider, rootDir, screenshots));
  registry.register(new LinkTextFixer(aiProvider, rootDir));
  registry.register(new ButtonNameFixer(aiProvider, rootDir));
  registry.register(new FormLabelFixer(aiProvider, rootDir));
  registry.register(new HtmlLangFixer(rootDir));
  registry.register(new HeadingOrderFixer(rootDir));
  registry.register(new MetaViewportFixer(rootDir));
  registry.register(new ColorContrastFixer(rootDir));

  for (const wcagId of ESLINT_FIXABLE_WCAG_IDS) {
    registry.register(new EslintFixer(wcagId, rootDir));
  }

  return registry;
}
