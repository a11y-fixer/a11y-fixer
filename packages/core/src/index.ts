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

// Runtime sensor (Phase 2 — WCAG 4.1.3 SPA route-change). The pure facts/judge/
// discovery pieces carry no browser dependency (the backend imports the judge);
// the observer reuses the shared puppeteer loader.
export {
  hashText,
  hashContent,
  normalizeText,
  redactRouteLabel,
  canonicalizeFacts,
  liveRegionTextChanged,
  EMPTY_TEXT_HASH,
} from './sensor/facts.js';
export type { RegionFingerprint, RouteChangeFacts } from './sensor/facts.js';
export { judgeObservation } from './sensor/judge.js';
export type { Observation } from './sensor/judge.js';
export {
  NextAppRouterDiscovery,
  resolveFlowName,
} from './sensor/route-discovery.js';
export type { RouteDiscovery, DiscoveredRoute } from './sensor/route-discovery.js';
export { runRouteSensor } from './sensor/observer.js';
export type { RunSensorOptions, SensorObservation } from './sensor/observer.js';

export {
  SUCCESS_CRITERIA,
  SECTION_508_INCORPORATION,
  getSuccessCriterion,
  isKnownCriterion,
  criteriaWithAutomatedCoverage,
} from './wcag/catalog.js';
export type {
  SuccessCriterion,
  SuccessCriterionMeta,
  ConformanceLevel,
  WcagVersion,
} from './wcag/catalog.js';

export { EslintFixer } from './fixer/rule-based/eslint-fixer.js';
export { HtmlLangFixer } from './fixer/rule-based/html-lang.js';
export { ColorContrastFixer, parseContrastFailure } from './fixer/rule-based/color-contrast.js';
export { TabindexFixer, normalizeTabindex } from './fixer/rule-based/tabindex.js';
export { MetaRefreshFixer, isPureTimedRefresh, removeTimedMetaRefresh } from './fixer/rule-based/meta-refresh.js';
export { HtmlXmlLangMismatchFixer, primarySubtag } from './fixer/rule-based/html-xml-lang-mismatch.js';
export { MarkdownHeadingOrderFixer } from './fixer/rule-based/markdown-heading-order.js';
export { MarkdownTableHeaderFixer } from './fixer/rule-based/markdown-table-header.js';
export { AriaAllowedAttrFixer, offendingAriaAttrs } from './fixer/rule-based/aria-allowed-attr.js';
export { LinkInTextBlockFixer, addUnderlineToLink } from './fixer/rule-based/link-in-text-block.js';
export { DefinitionListFixer, fixDefinitionList, fixDlItem } from './fixer/rule-based/definition-list.js';
export { ValidLangFixer, canonicalizeLangOnLine } from './fixer/rule-based/valid-lang.js';
export { AutoplayAudioFixer, removeAutoplay } from './fixer/rule-based/no-autoplay-audio.js';
export { ServerSideImageMapFixer, removeIsMap } from './fixer/rule-based/server-side-image-map.js';
export { AriaRolesFixer, removeRole } from './fixer/rule-based/aria-roles.js';
export { PresentationRoleConflictFixer, removePresentationRole } from './fixer/rule-based/presentation-role-conflict.js';
export { ScopeAttrValidFixer, normalizeScope, fixScopeOnLine } from './fixer/rule-based/scope-attr-valid.js';
export { AriaDeprecatedRoleFixer, replacementRole, fixDeprecatedRoleOnLine } from './fixer/rule-based/aria-deprecated-role.js';
export { ImageRedundantAltFixer, emptyRedundantAlt } from './fixer/rule-based/image-redundant-alt.js';
export { AriaAllowedRoleFixer, removeAllowedRole } from './fixer/rule-based/aria-allowed-role.js';
export { AriaRoledescriptionFixer, removeRoledescription } from './fixer/rule-based/aria-roledescription.js';
export { AriaBrailleLabelEquivalentFixer, removeDanglingBrailleLabel } from './fixer/rule-based/aria-braillelabel-equivalent.js';
export { AriaBrailleRoledescriptionEquivalentFixer, removeDanglingBrailleRoledescription } from './fixer/rule-based/aria-brailleroledescription-equivalent.js';
export { AriaValidAttrFixer } from './fixer/rule-based/aria-valid-attr.js';
export { AriaConditionalAttrFixer } from './fixer/rule-based/aria-conditional-attr.js';
export { AriaValidAttrValueFixer, normalizeAriaValueOnLine } from './fixer/rule-based/aria-valid-attr-value.js';
export { TableDuplicateNameFixer, removeDuplicateTableSummary } from './fixer/rule-based/table-duplicate-name.js';
export { TdHeadersAttrFixer, removeBrokenHeaders } from './fixer/rule-based/td-headers-attr.js';
export { MetaRefreshNoExceptionsFixer } from './fixer/rule-based/meta-refresh-no-exceptions.js';
export { readAttr, removeAttribute, removeNamedAttrs } from './fixer/shared/attrs.js';
export { setElementText } from './fixer/shared/html-edit.js';
export { editRecordedLine } from './fixer/shared/line-edit.js';
export type { LineEdit } from './fixer/shared/line-edit.js';

export { scanMarkdown, scanContent, collectMarkdownHeadings, GENERIC_LINK_PATTERNS } from './scanner/markdown.js';
export type { MarkdownHeading } from './scanner/markdown.js';
export { scanComponents, maskNonTemplate } from './scanner/components/index.js';
export { scanHtmlContent } from './runners/render-locate.js';
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
