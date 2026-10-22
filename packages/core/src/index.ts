export type { Detector, DetectorOptions, A11yViolation, A11yNode } from './detector/index.js';
export { AxeDetector } from './detector/axe.js';

export type { SourceMapper, SourceLocation } from './mapper/index.js';
export { ReactJSXMapper } from './mapper/react-jsx.js';
export { HtmlMapper } from './mapper/html.js';
export { locateElementInHtml } from './mapper/html-locate.js';
export type { HtmlPosition } from './mapper/html-locate.js';

export type { Fixer, FixResult, FixerBucket } from './fixer/index.js';
export { FixerRegistry } from './fixer/registry.js';
export { buildDefaultRegistry } from './fixer/defaults.js';

export type { AIProvider } from './ai-provider/index.js';
export { AnthropicProvider } from './ai-provider/anthropic.js';

export { EslintRunner } from './runners/eslint-runner.js';
export { HtmlFileRunner } from './runners/html-runner.js';
export { PuppeteerRunner } from './runners/puppeteer-runner.js';
export { WCAG_TO_ESLINT, ESLINT_TO_WCAG, AUTO_FIXABLE_RULES } from './runners/wcag-eslint-map.js';

export { EslintFixer } from './fixer/rule-based/eslint-fixer.js';
export { AltTextFixer } from './fixer/ai-assisted/alt-text.js';
export type { ScreenshotProvider } from './fixer/ai-assisted/alt-text.js';
export { LinkTextFixer } from './fixer/ai-assisted/link-text.js';
export { ButtonNameFixer } from './fixer/ai-assisted/button-name.js';
export { FormLabelFixer } from './fixer/ai-assisted/form-label.js';

export { PullRequestBuilder } from './pr/pull-request-builder.js';
export type { PROptions, PRResult } from './pr/pull-request-builder.js';
