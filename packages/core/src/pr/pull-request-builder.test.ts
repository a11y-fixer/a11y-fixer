import { describe, it, expect } from 'vitest';
import { PullRequestBuilder } from './pull-request-builder.js';

describe('PullRequestBuilder', () => {
  it('throws when no GitHub token is available', () => {
    const original = process.env['GITHUB_TOKEN'];
    delete process.env['GITHUB_TOKEN'];

    expect(() => new PullRequestBuilder({ owner: 'a', repo: 'b' }))
      .toThrow('GitHub token required');

    if (original !== undefined) process.env['GITHUB_TOKEN'] = original;
  });

  it('constructs successfully with token option', () => {
    expect(() => new PullRequestBuilder({ owner: 'a', repo: 'b', token: 'test-token' }))
      .not.toThrow();
  });

  it('branch names include timestamp suffix', () => {
    const builder = new PullRequestBuilder({ owner: 'a', repo: 'b', token: 'test-token' });
    // Access private method via cast for test
    const ts = (builder as unknown as { timestamp(): string }).timestamp();
    expect(ts).toMatch(/^\d{15}$/);
  });
});
