/** A half-open `[start, end)` byte range into a source string. */
export type Range = [start: number, end: number];

/**
 * Returns `content` with every byte inside any `range` replaced by a space,
 * except `\n` / `\r`, which are preserved. Because only the *characters* change
 * and never their offsets, every line and column in the result still maps 1:1
 * to the original source — so axe findings located in the masked markup point at
 * the real line in the untouched `.vue`/`.svelte`/`.astro` file.
 */
export function maskRanges(content: string, ranges: Range[]): string {
  if (ranges.length === 0) return content;
  const chars = [...content];
  for (const [start, end] of ranges) {
    for (let i = Math.max(0, start); i < Math.min(end, chars.length); i++) {
      const c = chars[i];
      if (c !== '\n' && c !== '\r') chars[i] = ' ';
    }
  }
  return chars.join('');
}

/** All `[start, end)` ranges matched by a global `re` in `content`. */
export function matchRanges(content: string, re: RegExp): Range[] {
  const out: Range[] = [];
  for (let m = re.exec(content); m; m = re.exec(content)) {
    out.push([m.index, m.index + m[0].length]);
    if (m.index === re.lastIndex) re.lastIndex++; // guard against zero-width matches
  }
  return out;
}
