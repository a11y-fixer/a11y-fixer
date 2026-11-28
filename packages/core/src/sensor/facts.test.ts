import { describe, it, expect } from 'vitest';
import {
  hashContent,
  normalizeText,
  redactRouteLabel,
  canonicalizeFacts,
  liveRegionTextChanged,
  EMPTY_TEXT_HASH,
  type RegionFingerprint,
  type RouteChangeFacts,
} from './facts.js';

function region(partial: Partial<RegionFingerprint>): RegionFingerprint {
  return { role: 'polite', nameHash: null, textHash: hashContent('x'), childCount: 0, ariaBusy: false, ...partial };
}

function facts(partial: Partial<RouteChangeFacts>): RouteChangeFacts {
  return {
    fromLabel: '/a',
    toLabel: '/b',
    settled: true,
    liveRegionsBefore: [],
    liveRegionsAfter: [],
    focusMovedIntoNewContent: false,
    ...partial,
  };
}

describe('normalizeText + hashContent', () => {
  it('collapses whitespace so cosmetic differences hash identically', () => {
    expect(normalizeText('  a   b \n c ')).toBe('a b c');
    expect(hashContent('a b c')).toBe(hashContent('a  b\tc'));
  });
  it('maps empty/whitespace content to EMPTY_TEXT_HASH', () => {
    expect(hashContent('   ')).toBe(EMPTY_TEXT_HASH);
  });
});

describe('redactRouteLabel — PII + determinism', () => {
  it('drops query/hash and masks numeric ids', () => {
    expect(redactRouteLabel('/orders/8821?token=abc#x')).toBe('/orders/:param');
    expect(redactRouteLabel('/orders/8821')).toBe(redactRouteLabel('/orders/9910'));
  });
  it('masks uuid and long-hex segments', () => {
    expect(redactRouteLabel('/u/3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toBe('/u/:param');
    expect(redactRouteLabel('/s/deadbeefcafebabe0123')).toBe('/s/:param');
  });
});

describe('liveRegionTextChanged — A1 false-pass guard', () => {
  it('present-but-unchanged live region is NOT a change', () => {
    const r = region({ textHash: hashContent('loading') });
    expect(liveRegionTextChanged(facts({ liveRegionsBefore: [r], liveRegionsAfter: [r] }))).toBe(false);
  });
  it('new non-empty text in a live region IS a change', () => {
    expect(
      liveRegionTextChanged(
        facts({
          liveRegionsBefore: [region({ textHash: EMPTY_TEXT_HASH })],
          liveRegionsAfter: [region({ textHash: hashContent('Dashboard loaded') })],
        }),
      ),
    ).toBe(true);
  });
  it('an empty after-region announces nothing', () => {
    expect(
      liveRegionTextChanged(facts({ liveRegionsAfter: [region({ textHash: EMPTY_TEXT_HASH })] })),
    ).toBe(false);
  });
  it('a region still aria-busy is not counted as announced', () => {
    expect(
      liveRegionTextChanged(
        facts({ liveRegionsAfter: [region({ textHash: hashContent('new'), ariaBusy: true })] }),
      ),
    ).toBe(false);
  });
});

describe('canonicalizeFacts — A5 determinism', () => {
  it('sorts region lists so ordering cannot perturb the serialization', () => {
    const a = region({ textHash: hashContent('a') });
    const b = region({ textHash: hashContent('b') });
    const one = canonicalizeFacts(facts({ liveRegionsAfter: [a, b] }));
    const two = canonicalizeFacts(facts({ liveRegionsAfter: [b, a] }));
    expect(JSON.stringify(one)).toBe(JSON.stringify(two));
  });
});
