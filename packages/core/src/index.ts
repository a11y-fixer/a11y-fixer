export type { Detector, DetectorOptions, A11yViolation, A11yNode } from './detector/index.js';
export { AxeDetector } from './detector/axe.js';

export type { SourceMapper, SourceLocation } from './mapper/index.js';
export { ReactJSXMapper } from './mapper/react-jsx.js';
export { HtmlMapper } from './mapper/html.js';
export { locateElementInHtml } from './mapper/html-locate.js';
export type { HtmlPosition } from './mapper/html-locate.js';

export type { Fixer, FixResult, FixerBucket } from './fixer/index.js';
export { dedupeFixFiles } from './fixer/index.js';
export { FixerRegistry } from './fixer/registry.js';
export { registerCoreFixers, buildCoreRegistry } from './fixer/defaults.js';
export type { CoreFixerOptions } from './fixer/defaults.js';

export { addAttributeToElement } from './fixer/shared/apply-attribute.js';
export { canonicalizeLangTag } from './fixer/shared/lang-tag.js';
export { detectLangFromSource } from './fixer/shared/detect-lang.js';

export { EslintRunner } from './runners/eslint-runner.js';
export { HtmlFileRunner } from './runners/html-runner.js';
export { PuppeteerRunner } from './runners/puppeteer-runner.js';
export { scanSource } from './runners/scan-source.js';
export type { ScanSourceOptions } from './runners/scan-source.js';
export { WCAG_TO_ESLINT, ESLINT_TO_WCAG, AUTO_FIXABLE_RULES } from './runners/wcag-eslint-map.js';

export { EslintFixer } from './fixer/rule-based/eslint-fixer.js';
export { HtmlLangFixer } from './fixer/rule-based/html-lang.js';
export { ColorContrastFixer, parseContrastFailure } from './fixer/rule-based/color-contrast.js';
export { TabindexFixer, normalizeTabindex } from './fixer/rule-based/tabindex.js';
export { MetaRefreshFixer, isPureTimedRefresh } from './fixer/rule-based/meta-refresh.js';
export { HtmlXmlLangMismatchFixer, primarySubtag } from './fixer/rule-based/html-xml-lang-mismatch.js';
export { MarkdownHeadingOrderFixer } from './fixer/rule-based/markdown-heading-order.js';
export { MarkdownTableHeaderFixer } from './fixer/rule-based/markdown-table-header.js';

export { scanMarkdown, scanContent, collectMarkdownHeadings, GENERIC_LINK_PATTERNS } from './scanner/markdown.js';
export type { MarkdownHeading } from './scanner/markdown.js';
export {
  sanitizeInlineLabel,
  locateAtColumn,
  writeReplacement,
  rewriteLine,
} from './fixer/markdown-source.js';
export type { Located } from './fixer/markdown-source.js';

export { PullRequestBuilder } from './pr/pull-request-builder.js';
export type { PROptions, PRResult } from './pr/pull-request-builder.js';

export {
  nodeKey,
  fingerprintKey,
  fingerprintViolations,
  loadBaseline,
  buildBaseline,
  saveBaseline,
  diffAgainstBaseline,
} from './baseline/index.js';
export type { Baseline, BaselineDiff } from './baseline/index.js';
