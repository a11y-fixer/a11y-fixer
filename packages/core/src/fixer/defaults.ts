import { FixerRegistry } from './registry.js';
import { EslintFixer } from './rule-based/eslint-fixer.js';
import { HtmlLangFixer } from './rule-based/html-lang.js';
import { HtmlLangValidFixer } from './rule-based/html-lang-valid.js';
import { HtmlXmlLangMismatchFixer } from './rule-based/html-xml-lang-mismatch.js';
import { HeadingOrderFixer } from './rule-based/heading-order.js';
import { MarkdownHeadingOrderFixer } from './rule-based/markdown-heading-order.js';
import { MarkdownTableHeaderFixer } from './rule-based/markdown-table-header.js';
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
import { DefinitionListFixer } from './rule-based/definition-list.js';
import { AriaAllowedAttrFixer } from './rule-based/aria-allowed-attr.js';
import { LinkInTextBlockFixer } from './rule-based/link-in-text-block.js';
import { LabelFixer } from './rule-based/label.js';
import { InputImageAltFixer } from './rule-based/input-image-alt.js';
import { ImageAltFixer } from './rule-based/image-alt.js';
import { ValidLangFixer } from './rule-based/valid-lang.js';
import { AutoplayAudioFixer } from './rule-based/no-autoplay-audio.js';
import { ServerSideImageMapFixer } from './rule-based/server-side-image-map.js';
import { AriaRolesFixer } from './rule-based/aria-roles.js';
import { PresentationRoleConflictFixer } from './rule-based/presentation-role-conflict.js';
import { ScopeAttrValidFixer } from './rule-based/scope-attr-valid.js';
import { AriaDeprecatedRoleFixer } from './rule-based/aria-deprecated-role.js';
import { ImageRedundantAltFixer } from './rule-based/image-redundant-alt.js';

/** WCAG ids whose ESLint rules eslint-plugin-jsx-a11y can auto-fix with --fix. */
const ESLINT_FIXABLE_WCAG_IDS = ['3.1.1', '4.1.2', '1.3.1', '2.4.6', '2.4.4'];

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
/** Options that tune individual core fixers. */
export interface CoreFixerOptions {
  /** Explicit BCP-47 language tag stamped on `<html>` when `lang` is missing. */
  lang?: string;
}

export function registerCoreFixers(
  registry: FixerRegistry,
  rootDir: string,
  options: CoreFixerOptions = {},
): FixerRegistry {
  registry.register(new HtmlLangFixer(rootDir, options.lang));
  registry.register(new HtmlLangValidFixer(rootDir));
  registry.register(new HtmlXmlLangMismatchFixer(rootDir));
  registry.register(new HeadingOrderFixer(rootDir));
  // Markdown rule-based fixers — id-keyed (`md-*`), no collision with HTML fixers.
  registry.register(new MarkdownHeadingOrderFixer(rootDir));
  registry.register(new MarkdownTableHeaderFixer(rootDir));
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
  registry.register(new DefinitionListFixer(rootDir));
  registry.register(new AriaAllowedAttrFixer(rootDir));
  registry.register(new LinkInTextBlockFixer(rootDir));
  registry.register(new LabelFixer(rootDir));
  registry.register(new InputImageAltFixer(rootDir));
  registry.register(new ImageAltFixer(rootDir));
  // All id-keyed on a unique axe rule id, so position among the core fixers is
  // free — none shares a broad wcagId-keyed collider with another core fixer.
  registry.register(new ValidLangFixer(rootDir));
  registry.register(new AutoplayAudioFixer(rootDir));
  registry.register(new ServerSideImageMapFixer(rootDir));
  registry.register(new AriaRolesFixer(rootDir));
  registry.register(new PresentationRoleConflictFixer(rootDir));
  registry.register(new ScopeAttrValidFixer(rootDir));
  registry.register(new AriaDeprecatedRoleFixer(rootDir));
  registry.register(new ImageRedundantAltFixer(rootDir));

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
export function buildCoreRegistry(
  rootDir: string,
  options: CoreFixerOptions = {},
): FixerRegistry {
  return registerCoreFixers(new FixerRegistry(), rootDir, options);
}
