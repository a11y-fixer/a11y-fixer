export type { Detector, DetectorOptions, A11yViolation, A11yNode } from './detector/index.js';
export { AxeDetector } from './detector/axe.js';

export type { SourceMapper, SourceLocation } from './mapper/index.js';
export { ReactJSXMapper } from './mapper/react-jsx.js';

export type { Fixer, FixResult, FixerBucket } from './fixer/index.js';
export { FixerRegistry } from './fixer/registry.js';

export type { AIProvider } from './ai-provider/index.js';
export { AnthropicProvider } from './ai-provider/anthropic.js';
