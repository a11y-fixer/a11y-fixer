import { canonicalizeLangTag } from './lang-tag.js';

/**
 * Deterministically detects a document's language from in-source signals, or
 * returns `null` when none can be found. Used by {@link HtmlLangFixer} when no
 * explicit `--lang` is supplied, so a missing-lang fix stamps the real language
 * rather than fabricating one.
 *
 * Priority:
 *   1. `<meta http-equiv="content-language" content="…">` — the most authoritative
 *      declared document language (first comma-separated token, per HTTP semantics).
 *   2. Any existing `lang=`/`xml:lang=` attribute elsewhere in the file.
 *
 * Each candidate is run through {@link canonicalizeLangTag}; the first that
 * canonicalizes wins. No AI — purely regex over the source.
 */
export function detectLangFromSource(content: string): string | null {
  // 1. <meta http-equiv="content-language" content="…"> — attribute-order-independent.
  const metaTag = content.match(/<meta\b[^>]*\bhttp-equiv\s*=\s*(["'])content-language\1[^>]*>/i);
  if (metaTag) {
    const contentAttr = metaTag[0].match(/\bcontent\s*=\s*(["'])([^"']*)\1/i);
    if (contentAttr) {
      const first = contentAttr[2].split(',')[0] ?? '';
      const canonical = canonicalizeLangTag(first);
      if (canonical) return canonical;
    }
  }

  // 2. First lang= / xml:lang= attribute anywhere in the file.
  const langAttr = content.match(/(?:xml:)?lang\s*=\s*(["'])([^"']+)\1/i);
  if (langAttr) {
    const canonical = canonicalizeLangTag(langAttr[2]);
    if (canonical) return canonical;
  }

  return null;
}
