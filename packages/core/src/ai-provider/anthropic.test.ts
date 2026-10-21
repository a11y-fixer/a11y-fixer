import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicProvider } from './anthropic.js';

describe('AnthropicProvider', () => {
  it('available() returns false when ANTHROPIC_API_KEY is absent', () => {
    const original = process.env['ANTHROPIC_API_KEY'];
    delete process.env['ANTHROPIC_API_KEY'];

    const provider = new AnthropicProvider();
    expect(provider.available()).toBe(false);

    if (original !== undefined) process.env['ANTHROPIC_API_KEY'] = original;
  });

  it('available() returns true when ANTHROPIC_API_KEY is set', () => {
    process.env['ANTHROPIC_API_KEY'] = 'test-key';

    const provider = new AnthropicProvider();
    expect(provider.available()).toBe(true);

    delete process.env['ANTHROPIC_API_KEY'];
  });
});
