/**
 * Canonicalizes a language value to a well-formed BCP-47 tag via the built-in
 * {@link Intl.getCanonicalLocales} — `EN_us` → `en-US`, `fr` → `fr` — or returns
 * `null` for empty input or anything structurally invalid (`englsh`, `xx_yy_zz`).
 *
 * Unlike {@link normalizeLangTag} in `html-lang-valid`, this returns the canonical
 * tag even when the input is already canonical, so it can validate a `--lang` flag
 * or a detected value (not just detect a *change*).
 */
export function canonicalizeLangTag(value: string): string | null {
  const tag = value.trim().replace(/_/g, '-');
  if (tag.length === 0) return null;
  try {
    return Intl.getCanonicalLocales(tag)[0] ?? null;
  } catch {
    return null;
  }
}
