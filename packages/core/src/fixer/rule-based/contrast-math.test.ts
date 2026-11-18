import { describe, it, expect } from 'vitest';
import {
  parseHex,
  toHex,
  relativeLuminance,
  contrastRatio,
  adjustForeground,
  type RGB,
} from './contrast-math.js';

describe('parseHex', () => {
  it('parses #rrggbb', () => {
    expect(parseHex('#ffffff')).toEqual([255, 255, 255]);
    expect(parseHex('#000000')).toEqual([0, 0, 0]);
    expect(parseHex('#336699')).toEqual([0x33, 0x66, 0x99]);
  });

  it('expands #rgb shorthand', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('#369')).toEqual([0x33, 0x66, 0x99]);
  });

  it('is case-insensitive and tolerates surrounding spaces', () => {
    expect(parseHex('  #AbC  ')).toEqual([0xaa, 0xbb, 0xcc]);
  });

  it('rejects non-hex values', () => {
    expect(parseHex('red')).toBeNull();
    expect(parseHex('#12')).toBeNull();
    expect(parseHex('rgb(0,0,0)')).toBeNull();
  });
});

describe('relativeLuminance / contrastRatio', () => {
  const white: RGB = [255, 255, 255];
  const black: RGB = [0, 0, 0];

  it('luminance endpoints', () => {
    expect(relativeLuminance(white)).toBeCloseTo(1, 5);
    expect(relativeLuminance(black)).toBeCloseTo(0, 5);
  });

  it('black on white is 21:1', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 2);
  });

  it('is symmetric', () => {
    expect(contrastRatio(white, black)).toBeCloseTo(contrastRatio(black, white), 10);
  });

  it('#767676 on white just clears 4.5:1 (a known AA boundary gray)', () => {
    expect(contrastRatio(parseHex('#767676')!, white)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('adjustForeground', () => {
  it('returns null when the foreground already passes', () => {
    expect(adjustForeground('#000000', '#ffffff', 4.5)).toBeNull();
  });

  it('darkens a too-light gray on white until it clears 4.5:1', () => {
    const result = adjustForeground('#999999', '#ffffff', 4.5);
    expect(result).not.toBeNull();
    expect(contrastRatio(parseHex(result!)!, parseHex('#ffffff')!)).toBeGreaterThanOrEqual(4.5);
  });

  it('lightens a too-dark gray on black until it clears 4.5:1', () => {
    const result = adjustForeground('#444444', '#000000', 4.5);
    expect(result).not.toBeNull();
    expect(contrastRatio(parseHex(result!)!, parseHex('#000000')!)).toBeGreaterThanOrEqual(4.5);
  });

  it('finds a solution against a mid-gray background', () => {
    const result = adjustForeground('#888888', '#777777', 4.5);
    expect(result).not.toBeNull();
    expect(contrastRatio(parseHex(result!)!, parseHex('#777777')!)).toBeGreaterThanOrEqual(4.5);
  });

  it('respects the lower 3:1 large-text target', () => {
    const result = adjustForeground('#999999', '#ffffff', 3.0);
    expect(result).not.toBeNull();
    const ratio = contrastRatio(parseHex(result!)!, parseHex('#ffffff')!);
    expect(ratio).toBeGreaterThanOrEqual(3.0);
    // Minimal-ish: should not overshoot all the way to pure black.
    expect(result).not.toBe('#000000');
  });

  it('accepts #rgb shorthand input', () => {
    const result = adjustForeground('#999', '#fff', 4.5);
    expect(result).not.toBeNull();
    expect(contrastRatio(parseHex(result!)!, parseHex('#ffffff')!)).toBeGreaterThanOrEqual(4.5);
  });

  it('returns null for unparseable input', () => {
    expect(adjustForeground('red', '#fff', 4.5)).toBeNull();
  });
});

describe('toHex', () => {
  it('round-trips and clamps', () => {
    expect(toHex([255, 255, 255])).toBe('#ffffff');
    expect(toHex([0, 0, 0])).toBe('#000000');
    expect(toHex([300, -5, 128])).toBe('#ff0080');
  });
});
