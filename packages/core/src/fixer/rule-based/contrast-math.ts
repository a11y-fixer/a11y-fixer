/**
 * Deterministic WCAG color-contrast math. All functions are pure so they can be
 * unit-tested in isolation from the fixer that wires them to source files.
 */

export type RGB = [number, number, number];

/** Parses `#rgb` or `#rrggbb` (case-insensitive) to 0-255 RGB, else null. */
export function parseHex(value: string): RGB | null {
  const hex = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    const r = parseInt(hex[0]! + hex[0]!, 16);
    const g = parseInt(hex[1]! + hex[1]!, 16);
    const b = parseInt(hex[2]! + hex[2]!, 16);
    return [r, g, b];
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

/** Formats 0-255 RGB as a `#rrggbb` string (lowercase). */
export function toHex([r, g, b]: RGB): string {
  const h = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** WCAG relative luminance of an sRGB color (0 = black, 1 = white). */
export function relativeLuminance([r, g, b]: RGB): number {
  const chan = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/** WCAG contrast ratio between two colors, in the range [1, 21]. */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

function lerp(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const BLACK: RGB = [0, 0, 0];
const WHITE: RGB = [255, 255, 255];

/**
 * Returns a `#rrggbb` foreground that meets `requiredRatio` against the fixed
 * background with the smallest shift away from the original foreground, or null
 * if the original already meets it.
 *
 * The foreground is blended toward whichever of black/white yields more contrast
 * with the background; a solution always exists because one of those endpoints
 * clears 4.5:1 (and 3:1) against any background.
 */
export function adjustForeground(
  fgHex: string,
  bgHex: string,
  requiredRatio: number,
): string | null {
  const fg = parseHex(fgHex);
  const bg = parseHex(bgHex);
  if (!fg || !bg) return null;

  if (contrastRatio(fg, bg) >= requiredRatio) return null;

  // Blend toward the higher-contrast endpoint; black and white are the extremes.
  const target = contrastRatio(BLACK, bg) >= contrastRatio(WHITE, bg) ? BLACK : WHITE;

  // Binary-search the smallest blend factor t in [0,1] that reaches the ratio.
  // contrast is monotonic in t along fg→target, so bisection converges.
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(lerp(fg, target, mid), bg) >= requiredRatio) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  // Rounding to an integer channel can dip just under the threshold, so step the
  // blend factor up until the rounded color actually clears it (worst case t=1,
  // the endpoint, which always passes).
  const round = (c: RGB): RGB => [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])];
  for (let t = hi; t <= 1; t += 0.01) {
    const candidate = round(lerp(fg, target, t));
    if (contrastRatio(candidate, bg) >= requiredRatio) return toHex(candidate);
  }
  return toHex(target);
}
