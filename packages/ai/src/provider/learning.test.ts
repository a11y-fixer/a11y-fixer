import { describe, it, expect } from 'vitest';
import { LearningProvider } from './learning.js';
import type { AIProvider } from './index.js';

/** Captures the context each method received and echoes a canned value. */
class SpyProvider implements AIProvider {
  seen: Record<string, string> = {};
  available(): boolean {
    return true;
  }
  async describeImage(_buf: Buffer, context: string): Promise<string> {
    this.seen['describeImage'] = context;
    return 'A described image';
  }
  async suggestAltText(context: string): Promise<string> {
    this.seen['suggestAltText'] = context;
    return 'Alt from context';
  }
  async rewriteLinkText(_current: string, context: string): Promise<string> {
    this.seen['rewriteLinkText'] = context;
    return 'Descriptive link';
  }
  async suggestAccessibleName(_el: string, context: string): Promise<string> {
    this.seen['suggestAccessibleName'] = context;
    return 'Close dialog';
  }
}

describe('LearningProvider', () => {
  it('injects example preamble into context for the matching bucket', async () => {
    const spy = new SpyProvider();
    const lp = new LearningProvider(spy, { alt: ['A golden retriever'] });

    await lp.suggestAltText('Image element: <img src=x>');
    expect(spy.seen['suggestAltText']).toContain('A golden retriever');
    expect(spy.seen['suggestAltText']).toContain('Image element:');
  });

  it('leaves context untouched for buckets with no examples', async () => {
    const spy = new SpyProvider();
    const lp = new LearningProvider(spy, { alt: ['x'] });

    await lp.rewriteLinkText('here', 'Link href: /a');
    expect(spy.seen['rewriteLinkText']).toBe('Link href: /a');
  });

  it('records every non-empty generation with its bucket', async () => {
    const spy = new SpyProvider();
    const lp = new LearningProvider(spy, {});

    await lp.suggestAltText('ctx');
    await lp.rewriteLinkText('here', 'ctx');
    await lp.suggestAccessibleName('<button>', 'ctx');

    const gens = lp.drainGenerations();
    expect(gens).toEqual([
      { method: 'suggestAltText', bucket: 'alt', value: 'Alt from context' },
      { method: 'rewriteLinkText', bucket: 'link', value: 'Descriptive link' },
      { method: 'suggestAccessibleName', bucket: 'name', value: 'Close dialog' },
    ]);
  });

  it('passes through availability', () => {
    expect(new LearningProvider(new SpyProvider()).available()).toBe(true);
  });
});
