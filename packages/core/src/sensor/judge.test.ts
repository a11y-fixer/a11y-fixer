import { describe, it, expect } from 'vitest';
import { judgeObservation } from './judge.js';
import { hashContent, EMPTY_TEXT_HASH, type RegionFingerprint, type RouteChangeFacts } from './facts.js';

function region(textHash: string, extra: Partial<RegionFingerprint> = {}): RegionFingerprint {
  return { role: 'polite', nameHash: null, textHash, childCount: 0, ariaBusy: false, ...extra };
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

describe('judgeObservation — 4.1.3', () => {
  it('announced via live-region text delta → pass', () => {
    expect(
      judgeObservation(
        facts({
          liveRegionsBefore: [region(EMPTY_TEXT_HASH)],
          liveRegionsAfter: [region(hashContent('Page B'))],
        }),
      ),
    ).toBe('pass');
  });

  it('focus moved into new content → pass', () => {
    expect(judgeObservation(facts({ focusMovedIntoNewContent: true }))).toBe('pass');
  });

  it('live region present but text unchanged → fail (A1)', () => {
    const r = region(hashContent('same'));
    expect(judgeObservation(facts({ liveRegionsBefore: [r], liveRegionsAfter: [r] }))).toBe('fail');
  });

  it('silent route change (no announcement, no focus move) → fail', () => {
    expect(judgeObservation(facts({}))).toBe('fail');
  });

  it('never settled → not-evaluated, never a guessed pass or fail (A4)', () => {
    expect(
      judgeObservation(
        facts({ settled: false, liveRegionsAfter: [region(hashContent('ignored'))] }),
      ),
    ).toBe('not-evaluated');
  });
});
