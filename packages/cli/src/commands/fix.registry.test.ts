import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { A11yViolation } from '@a11y-fixer/core';

// Exercises the `fix` command's registry selection: deterministic core registry
// by default, and the paid @a11y-fixer/ai `buildFullRegistry` when an AI key is
// supplied. Both packages are mocked so the branch is hermetic and offline.
// vi.mock is file-scoped, so this lives apart from fix.pr.test.ts.
const h = vi.hoisted(() => ({
  scanSource: vi.fn(),
  scanMarkdown: vi.fn(),
  applyAll: vi.fn(),
  buildCoreRegistry: vi.fn(() => ({ applyAll: h.applyAll })),
  buildFullRegistry: vi.fn(() => ({ applyAll: h.applyAll })),
  resolveAIConfig: vi.fn(),
  providerCtor: vi.fn(),
}));

vi.mock('@a11y-fixer/core', () => ({
  scanSource: h.scanSource,
  scanMarkdown: h.scanMarkdown,
  dedupeFixFiles: vi.fn(() => []),
  canonicalizeLangTag: (t: string) => t,
  buildCoreRegistry: h.buildCoreRegistry,
  PullRequestBuilder: class {},
}));

vi.mock('@a11y-fixer/ai', () => ({
  resolveAIConfig: h.resolveAIConfig,
  AISDKProvider: class {
    constructor(cfg: unknown) {
      h.providerCtor(cfg);
    }
  },
  buildFullRegistry: h.buildFullRegistry,
}));

const { fixCommand } = await import('./fix.js');

const violation: A11yViolation = {
  id: 'md-image-alt',
  wcagId: '1.1.1',
  impact: 'serious',
  description: 'Markdown image is missing alt text',
  helpUrl: 'https://example.test/md-image-alt',
  nodes: [],
};

// AI env vars buildRegistry inspects / mutates; cleared around every test so
// flag-driven mutation never leaks between cases or from the host environment.
const AI_ENV = [
  'ANTHROPIC_API_KEY',
  'A11Y_AI_API_KEY',
  'A11Y_AI_PROVIDER',
  'A11Y_AI_MODEL',
  'OPENAI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
];
let savedEnv: Record<string, string | undefined>;

async function run(argv: string[]): Promise<void> {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await fixCommand().parseAsync(['/repo', ...argv], { from: 'user' });
}

beforeEach(() => {
  savedEnv = Object.fromEntries(AI_ENV.map((k) => [k, process.env[k]]));
  for (const k of AI_ENV) delete process.env[k];
  h.scanSource.mockResolvedValue([violation]);
  h.scanMarkdown.mockResolvedValue([]);
  h.applyAll.mockResolvedValue([]);
});

afterEach(() => {
  for (const k of AI_ENV) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('fix command registry selection', () => {
  it('uses the deterministic core registry when no AI key is present', async () => {
    await run([]);
    expect(h.buildCoreRegistry).toHaveBeenCalledWith('/repo', { lang: undefined });
    expect(h.buildFullRegistry).not.toHaveBeenCalled();
  });

  it('upgrades to the AI registry when --anthropic-api-key is given', async () => {
    h.resolveAIConfig.mockReturnValue({ provider: 'anthropic', model: 'claude', apiKey: 'sk-test' });
    await run(['--anthropic-api-key', 'sk-test']);
    expect(h.buildFullRegistry).toHaveBeenCalledWith(expect.anything(), '/repo');
    expect(h.providerCtor).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'sk-test' }),
    );
    expect(h.buildCoreRegistry).not.toHaveBeenCalled();
  });

  it('falls back to the core registry when an AI provider is named but no key resolves', async () => {
    h.resolveAIConfig.mockReturnValue({ provider: 'anthropic', model: 'claude', apiKey: '' });
    await run(['--ai-provider', 'anthropic']);
    expect(h.buildFullRegistry).not.toHaveBeenCalled();
    expect(h.buildCoreRegistry).toHaveBeenCalledWith('/repo', { lang: undefined });
  });
});
