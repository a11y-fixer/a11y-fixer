/**
 * Derives a human-readable label from the last meaningful segment of a URL —
 * dropping the query/hash, decoding, stripping a file extension, and turning
 * separators into spaces. Returns `null` when no sensible word remains.
 *
 * Used to name things from a `src` deterministically (iframe titles, image-input
 * alt text) without inventing content: the words already live in the path.
 */
export function titleFromSrc(src: string): string | null {
  const withoutQuery = src.split(/[?#]/)[0].replace(/\/+$/, '');
  const segment = withoutQuery.split('/').pop() ?? '';
  let decoded: string;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    decoded = segment;
  }
  const words = decoded
    .replace(/\.[a-z0-9]+$/i, '') // drop extension
    .replace(/[-_]+/g, ' ')
    .trim();
  return words.length > 0 ? words : null;
}
