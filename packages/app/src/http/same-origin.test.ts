import { describe, expect, it } from 'vitest';
import { isSameOrigin } from './same-origin.js';

const APP = 'https://app.a11y-fixer.com';

describe('isSameOrigin', () => {
  it('accepts a same-host origin', () => {
    expect(isSameOrigin('https://app.a11y-fixer.com', APP)).toBe(true);
  });

  it('accepts a same host ignoring path on the app base url', () => {
    expect(isSameOrigin('https://app.a11y-fixer.com', `${APP}/dashboard`)).toBe(true);
  });

  it('rejects a cross-site origin', () => {
    expect(isSameOrigin('https://evil.example.com', APP)).toBe(false);
  });

  it('rejects a missing origin', () => {
    expect(isSameOrigin(null, APP)).toBe(false);
    expect(isSameOrigin(undefined, APP)).toBe(false);
  });

  it('rejects an unparseable origin', () => {
    expect(isSameOrigin('not a url', APP)).toBe(false);
  });

  it('distinguishes host including port', () => {
    expect(isSameOrigin('http://localhost:3000', 'http://localhost:3000')).toBe(true);
    expect(isSameOrigin('http://localhost:4000', 'http://localhost:3000')).toBe(false);
  });
});
