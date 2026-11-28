import { describe, it, expect } from 'vitest';
import {
  fingerprint,
  selectInternalLinks,
  focusMovedIntoNewContent,
  buildFacts,
  type RawSnapshot,
} from './observe-logic.js';
import { hashContent, EMPTY_TEXT_HASH } from './facts.js';

describe('fingerprint — PII hashing (A8)', () => {
  it('hashes text and accessible name, never stores them verbatim', () => {
    const [fp] = fingerprint([
      { role: 'polite', name: 'Jane Doe', text: 'Order 123 shipped', childCount: 2, ariaBusy: false },
    ]);
    expect(fp.nameHash).toBe(hashContent('Jane Doe'));
    expect(fp.textHash).toBe(hashContent('Order 123 shipped'));
    expect(JSON.stringify(fp)).not.toContain('Jane Doe');
    expect(JSON.stringify(fp)).not.toContain('Order 123');
  });
  it('maps a missing name to null and empty text to EMPTY_TEXT_HASH', () => {
    const [fp] = fingerprint([{ role: 'assertive', name: null, text: '  ', childCount: 0, ariaBusy: true }]);
    expect(fp.nameHash).toBeNull();
    expect(fp.textHash).toBe(EMPTY_TEXT_HASH);
    expect(fp.ariaBusy).toBe(true);
  });
});

describe('selectInternalLinks', () => {
  it('keeps same-origin links to known routes, deduped and sorted', () => {
    const links = selectInternalLinks(
      ['https://x.com/a', '/dashboard?q=1', '/orders', '//evil.com', '/dashboard', '/unknown'],
      new Set(['/dashboard', '/orders']),
    );
    expect(links).toEqual([
      { selectorIndex: 2, toPath: '/orders' },
      { selectorIndex: 1, toPath: '/dashboard' },
    ].sort((a, b) => a.toPath.localeCompare(b.toPath)));
  });
  it('ignores external, protocol-relative, and unknown-route links', () => {
    expect(selectInternalLinks(['//cdn', 'https://e', '/nope'], new Set(['/yes']))).toEqual([]);
  });
});

describe('focusMovedIntoNewContent', () => {
  it('true when the focused node was absent before', () => {
    expect(focusMovedIntoNewContent(['A|', 'B|'], 'C|new')).toBe(true);
  });
  it('false when the focused node already existed, or focus is null', () => {
    expect(focusMovedIntoNewContent(['A|', 'B|'], 'A|')).toBe(false);
    expect(focusMovedIntoNewContent(['A|'], null)).toBe(false);
  });
});

describe('buildFacts', () => {
  const snap = (over: Partial<RawSnapshot> = {}): RawSnapshot => ({
    regions: [],
    elementSignatures: [],
    focusSignature: null,
    ...over,
  });

  it('redacts route labels and assembles fingerprints + focus delta', () => {
    const facts = buildFacts({
      fromPath: '/orders/8821',
      toPath: '/dashboard',
      settled: true,
      before: snap({ elementSignatures: ['A|'] }),
      after: snap({
        regions: [{ role: 'polite', name: null, text: 'Loaded', childCount: 1, ariaBusy: false }],
        focusSignature: 'NEW|',
      }),
    });
    expect(facts.fromLabel).toBe('/orders/:param');
    expect(facts.toLabel).toBe('/dashboard');
    expect(facts.settled).toBe(true);
    expect(facts.liveRegionsAfter[0].textHash).toBe(hashContent('Loaded'));
    expect(facts.focusMovedIntoNewContent).toBe(true);
  });
});
