import { describe, it, expect } from 'vitest';
import { AXE_WCAG_MAP, toWcagId } from './axe.js';

// Unit test for the axe-id → WCAG-id mapping. Kept separate from axe.test.ts so
// it runs without Chromium/puppeteer (axe.test.ts self-skips when puppeteer is
// unavailable, which would leave the mapping uncovered in CI).
describe('toWcagId', () => {
  it('maps a known axe rule to its WCAG id', () => {
    expect(toWcagId('color-contrast')).toBe('1.4.3');
  });

  it('falls through to the raw axe id for an unknown rule', () => {
    expect(toWcagId('some-future-rule')).toBe('some-future-rule');
  });

  // Regression: these rules shipped with fixers but were missing from the map,
  // so scans reported the raw axe id instead of the correct WCAG number.
  it('maps every rule a fixer claims to a real WCAG number', () => {
    const expected: Record<string, string> = {
      'html-xml-lang-mismatch': '3.1.1',
      'meta-viewport-large': '1.4.4',
      'aria-hidden-body': '4.1.2',
      'aria-hidden-focus': '4.1.2',
      'frame-title': '4.1.2',
      'document-title': '2.4.2',
      'blink': '2.2.2',
      'marquee': '2.2.2',
    };
    for (const [rule, wcag] of Object.entries(expected)) {
      expect(toWcagId(rule), rule).toBe(wcag);
    }
  });

  it('maps every entry to a dotted WCAG success-criterion number', () => {
    for (const [rule, wcag] of Object.entries(AXE_WCAG_MAP)) {
      expect(wcag, rule).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });
});
