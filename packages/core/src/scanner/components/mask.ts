/** A half-open `[start, end)` byte range into a source string. */
export type Range = [start: number, end: number];

/**
 * Returns `content` with every byte inside any `range` replaced by a space,
 * except `\n` / `\r`, which are preserved. Because only the *characters* change
 * and never their offsets, every line and column in the result still maps 1:1
 * to the original source — so axe findings located in the masked markup point at
 * the real line in the untouched `.vue`/`.svelte`/`.astro` file.
 *
 * Indexing is by UTF-16 code unit (`split('')`), not code point (`[...content]`),
 * because every range offset fed here is a code-unit offset: `indexOf`,
 * `RegExp.index`, parse5 `sourceCodeLocation`, and `@vue/compiler-sfc` `loc.offset`
 * all count code units. Spreading by code point would shift every offset after an
 * astral character (emoji, some CJK) by the surrogate count and mask the wrong bytes.
 */
export function maskRanges(content: string, ranges: Range[]): string {
  if (ranges.length === 0) return content;
  const chars = content.split('');
  for (const [start, end] of ranges) {
    for (let i = Math.max(0, start); i < Math.min(end, chars.length); i++) {
      const c = chars[i];
      if (c !== '\n' && c !== '\r') chars[i] = ' ';
    }
  }
  return chars.join('');
}
