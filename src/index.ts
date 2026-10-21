export type { Detector, DetectorOptions, A11yViolation, A11yNode } from './detector/index.js';
export { AxeDetector } from './detector/axe.js';

export type { SourceMapper, SourceLocation } from './mapper/index.js';
export { ReactJSXMapper } from './mapper/react-jsx.js';

export type { Fixer, FixResult, FixerBucket } from './fixer/index.js';
export { FixerRegistry } from './fixer/registry.js';

export type { AIProvider } from './ai-provider/index.js';
export { AnthropicProvider } from './ai-provider/anthropic.js';

export { EslintRunner } from './runners/eslint-runner.js';
export { PuppeteerRunner } from './runners/puppeteer-runner.js';
export { WCAG_TO_ESLINT, ESLINT_TO_WCAG, AUTO_FIXABLE_RULES } from './runners/wcag-eslint-map.js';

export { EslintFixer } from './fixer/rule-based/eslint-fixer.js';
export { AltTextFixer } from './fixer/ai-assisted/alt-text.js';
export type { ScreenshotProvider } from './fixer/ai-assisted/alt-text.js';
export { LinkTextFixer } from './fixer/ai-assisted/link-text.js';

export { PullRequestBuilder } from './pr/pull-request-builder.js';
export type { PROptions, PRResult } from './pr/pull-request-builder.js';
