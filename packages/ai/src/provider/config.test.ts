import { describe, it, expect } from 'vitest';
import { resolveAIConfig } from './config.js';

describe('resolveAIConfig', () => {
  it('defaults to anthropic + its default model, reading ANTHROPIC_API_KEY (back-compat)', () => {
    const c = resolveAIConfig({ ANTHROPIC_API_KEY: 'sk-ant' });
    expect(c).toEqual({ provider: 'anthropic', model: 'claude-haiku-4-5', apiKey: 'sk-ant' });
  });

  it('returns an empty key (not a throw) when no key is present — AI simply unavailable', () => {
    expect(resolveAIConfig({}).apiKey).toBe('');
  });

  it('selects a provider and its default model from A11Y_AI_PROVIDER', () => {
    const c = resolveAIConfig({ A11Y_AI_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-oai' });
    expect(c).toEqual({ provider: 'openai', model: 'gpt-4o-mini', apiKey: 'sk-oai' });
  });

  it('reads the google native key', () => {
    const c = resolveAIConfig({ A11Y_AI_PROVIDER: 'google', GOOGLE_GENERATIVE_AI_API_KEY: 'g-key' });
    expect(c).toMatchObject({ provider: 'google', model: 'gemini-1.5-flash', apiKey: 'g-key' });
  });

  it('prefers the generic A11Y_AI_API_KEY over the native env var', () => {
    const c = resolveAIConfig({
      A11Y_AI_PROVIDER: 'openai',
      A11Y_AI_API_KEY: 'generic',
      OPENAI_API_KEY: 'native',
    });
    expect(c.apiKey).toBe('generic');
  });

  it('honors an explicit A11Y_AI_MODEL override', () => {
    const c = resolveAIConfig({ A11Y_AI_PROVIDER: 'openai', A11Y_AI_MODEL: 'gpt-5', OPENAI_API_KEY: 'k' });
    expect(c.model).toBe('gpt-5');
  });

  it('is case-insensitive on the provider name', () => {
    expect(resolveAIConfig({ A11Y_AI_PROVIDER: 'OpenAI', OPENAI_API_KEY: 'k' }).provider).toBe('openai');
  });

  it('throws on an unsupported provider', () => {
    expect(() => resolveAIConfig({ A11Y_AI_PROVIDER: 'mistral' })).toThrow(/Unsupported A11Y_AI_PROVIDER/);
  });
});
