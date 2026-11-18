/**
 * Strips HTML tags from a fragment to recover its visible text, then collapses
 * whitespace. Used to borrow an element's text content (an `<h1>`'s text, a
 * `<label>`'s text) for a deterministic fix.
 *
 * The removal loops until the string stops changing, rather than a single pass,
 * so that nested or overlapping angle brackets (e.g. `<<b>script>`) can never
 * leave a half-tag like `<script` behind — a single `/<[^>]+>/g` pass can. The
 * result is treated as plain text and is still HTML-escaped at the point it is
 * written back, so this is defense in depth, not the only guard.
 */
export function stripTags(html: string): string {
  let prev: string;
  let out = html;
  do {
    prev = out;
    out = out.replace(/<[^>]*>/g, '');
  } while (out !== prev);
  return out.replace(/\s+/g, ' ').trim();
}
