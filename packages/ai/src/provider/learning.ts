import type { AIProvider } from './index.js';
import {
  buildExamplePreamble,
  methodBucket,
  type ExamplesByBucket,
  type Generation,
} from '../learning/index.js';

/**
 * Wraps an {@link AIProvider} to close the learning loop, with two jobs:
 *
 * 1. **Inject** — prepends this repo's previously accepted values (the house
 *    style) to the `context` argument of each call, as few-shot guidance. This
 *    rides the existing `context` string, so the provider interface is unchanged
 *    and the downstream cache key naturally reflects the active example set.
 * 2. **Observe** — records every generation (method + returned value) so the
 *    caller can correlate them with the fixes that survived the re-scan gate and
 *    persist the survivors as new learning records. Fixers stay oblivious.
 *
 * Wrap order must be `CachingProvider(new LearningProvider(real, examples))`:
 * learning is *inside* caching so the injected examples are part of what gets
 * cached, and a repeated identical request still costs at most one API call.
 */
export class LearningProvider implements AIProvider {
  private readonly generations: Generation[] = [];

  constructor(
    private readonly delegate: AIProvider,
    private readonly examples: ExamplesByBucket = {},
  ) {}

  available(): boolean {
    return this.delegate.available();
  }

  async describeImage(imageBuffer: Buffer, context: string): Promise<string> {
    const value = await this.delegate.describeImage(imageBuffer, this.enrich('alt', context));
    return this.record('describeImage', value);
  }

  async suggestAltText(context: string): Promise<string> {
    const value = await this.delegate.suggestAltText(this.enrich('alt', context));
    return this.record('suggestAltText', value);
  }

  async rewriteLinkText(current: string, context: string): Promise<string> {
    const value = await this.delegate.rewriteLinkText(current, this.enrich('link', context));
    return this.record('rewriteLinkText', value);
  }

  async suggestAccessibleName(element: string, context: string): Promise<string> {
    const value = await this.delegate.suggestAccessibleName(element, this.enrich('name', context));
    return this.record('suggestAccessibleName', value);
  }

  /** Generations observed so far this run, for correlation with verified fixes. */
  drainGenerations(): Generation[] {
    return this.generations.slice();
  }

  private enrich(bucket: 'alt' | 'link' | 'name', context: string): string {
    const preamble = buildExamplePreamble(bucket, this.examples[bucket]);
    return preamble ? preamble + context : context;
  }

  private record(method: Generation['method'], value: string): string {
    const trimmed = value.trim();
    if (trimmed) this.generations.push({ method, bucket: methodBucket(method), value: trimmed });
    return value;
  }
}
