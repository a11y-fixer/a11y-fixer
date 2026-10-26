import { FixerRegistry } from './registry.js';
import { EslintFixer } from './rule-based/eslint-fixer.js';
import { HtmlLangFixer } from './rule-based/html-lang.js';
import { HtmlLangValidFixer } from './rule-based/html-lang-valid.js';
import { HtmlXmlLangMismatchFixer } from './rule-based/html-xml-lang-mismatch.js';
import { HeadingOrderFixer } from './rule-based/heading-order.js';
import { MetaViewportFixer } from './rule-based/meta-viewport.js';
import { MetaViewportLargeFixer } from './rule-based/meta-viewport-large.js';
import { ColorContrastFixer } from './rule-based/color-contrast.js';
import { TabindexFixer } from './rule-based/tabindex.js';
import { MetaRefreshFixer } from './rule-based/meta-refresh.js';
import { ScrollableRegionFocusableFixer } from './rule-based/scrollable-region-focusable.js';
import { AriaHiddenBodyFixer } from './rule-based/aria-hidden-body.js';
import { DocumentTitleFixer } from './rule-based/document-title.js';
import { BlinkMarqueeFixer } from './rule-based/blink-marquee.js';
import { AriaHiddenFocusFixer } from './rule-based/aria-hidden-focus.js';
import { FrameTitleFixer } from './rule-based/frame-title.js';
import { ListFixer } from './rule-based/list.js';

/** WCAG ids whose ESLint rules eslint-plugin-jsx-a11y can auto-fix with --fix. */
const ESLINT_FIXABLE_WCAG_IDS = ['3.1.1', '4.1.2', '1.3.1', '2.4.6'];

/**
 * Registers the deterministic (rule-based) fixers into an existing registry.
 *
 * Kept as a mutating helper so the paid `@a11y-fixer/ai` package can register
 * its AI-assisted fixers *first* and then call this to append the rule-based
 * ones: with canFix-based dispatch, an AI fixer claims the axe rules
 * (button-name, label, …) that share a WCAG id with an ESLint rule before the
 * generic EslintFixer — whose canFix only matches jsx-a11y/ ids anyway. Keeping
 * the registration order (AI fixers, then these) preserves that routing.
 */
export function registerCoreFixers(registry: FixerRegistry, rootDir: string): FixerRegistry {
  registry.register(new HtmlLangFixer(rootDir));
  registry.register(new HtmlLangValidFixer(rootDir));
  registry.register(new HtmlXmlLangMismatchFixer(rootDir));
  registry.register(new HeadingOrderFixer(rootDir));
  registry.register(new MetaViewportFixer(rootDir));
  registry.register(new MetaViewportLargeFixer(rootDir));
  registry.register(new ColorContrastFixer(rootDir));
  registry.register(new TabindexFixer(rootDir));
  registry.register(new MetaRefreshFixer(rootDir));
  registry.register(new ScrollableRegionFocusableFixer(rootDir));
  registry.register(new AriaHiddenBodyFixer(rootDir));
  registry.register(new DocumentTitleFixer(rootDir));
  registry.register(new BlinkMarqueeFixer(rootDir));
  registry.register(new AriaHiddenFocusFixer(rootDir));
  registry.register(new FrameTitleFixer(rootDir));
  registry.register(new ListFixer(rootDir));

  for (const wcagId of ESLINT_FIXABLE_WCAG_IDS) {
    registry.register(new EslintFixer(wcagId, rootDir));
  }

  return registry;
}

/**
 * Builds a registry with only the free, deterministic fixers — used by the
 * open-source CLI. AI-assisted fixing lives in the paid `@a11y-fixer/ai`
 * package, which composes on top of {@link registerCoreFixers}.
 */
export function buildCoreRegistry(rootDir: string): FixerRegistry {
  return registerCoreFixers(new FixerRegistry(), rootDir);
}
