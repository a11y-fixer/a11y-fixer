import { createHash } from 'node:crypto';

/** The AIProvider methods that produce a learnable text output. */
export type AiMethod =
  | 'describeImage'
  | 'suggestAltText'
  | 'rewriteLinkText'
  | 'suggestAccessibleName';

/**
 * Example buckets group methods by the *kind* of text they produce, so a
 * learned alt text steers both the vision (`describeImage`) and context-only
 * (`suggestAltText`) paths.
 */
export type ExampleBucket = 'alt' | 'link' | 'name';

export function methodBucket(method: AiMethod): ExampleBucket {
  switch (method) {
    case 'describeImage':
    case 'suggestAltText':
      return 'alt';
    case 'rewriteLinkText':
      return 'link';
    case 'suggestAccessibleName':
      return 'name';
  }
}

/** Accepted example values the house style should match, grouped by bucket. */
export type ExamplesByBucket = Partial<Record<ExampleBucket, string[]>>;

/**
 * One AI generation observed during a run: the method called, the bucket it
 * maps to, and the value it returned. The github-action correlates these with
 * the fixes that survived the re-scan gate (by value match) to decide which
 * generations become learning records — no fixer needs to know about learning.
 */
export interface Generation {
  method: AiMethod;
  bucket: ExampleBucket;
  value: string;
}

const NOUN: Record<ExampleBucket, string> = {
  alt: 'alt text',
  link: 'link text',
  name: 'accessible name (aria-label)',
};

/**
 * Builds a short preamble that teaches the model this repo's house style from
 * previously accepted values. Returns '' when there are no examples, so the
 * prompt (and therefore the cache key) is unchanged on a cold repo.
 *
 * Examples are injected into the existing `context` argument rather than a
 * separate system prompt. That keeps the AIProvider surface unchanged AND makes
 * caching correct for free: the sha256 cache key already hashes `context`, so a
 * changed example set is a natural cache miss and a stale pre-learning answer is
 * never reused.
 */
export function buildExamplePreamble(
  bucket: ExampleBucket,
  examples: string[] | undefined,
  limit = 5,
): string {
  const picked = dedupeExamples(examples ?? []).slice(0, limit);
  if (picked.length === 0) return '';
  const list = picked.map((e) => `"${e}"`).join('; ');
  return (
    `This codebase has previously accepted these ${NOUN[bucket]} values — ` +
    `match their style, tone, and length: ${list}. `
  );
}

/** De-duplicates case-insensitively while preserving first-seen order. */
export function dedupeExamples(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const key = v.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(v.trim());
  }
  return out;
}

/**
 * Stable id for a fix, independent of line/column so it survives edits that
 * shift lines — the same insight verify-fixes uses (match on content, not
 * position). Keyed on the rule, the file, and the pre-fix markup.
 */
export function fixId(parts: { wcagId: string; sourceFile: string; before: string }): string {
  return createHash('sha256')
    .update(parts.wcagId)
    .update('\0')
    .update(parts.sourceFile)
    .update('\0')
    .update(normalizeMarkup(parts.before))
    .digest('hex')
    .slice(0, 16);
}

/** Collapses whitespace so cosmetic reformatting doesn't change a fix id. */
export function normalizeMarkup(markup: string): string {
  return markup.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts the learnable value from a line of markup for a given bucket:
 * the alt attribute, the aria-label, or an anchor's inner text. Returns null
 * when no such value is present.
 */
export function extractValue(bucket: ExampleBucket, markup: string): string | null {
  if (bucket === 'alt') return attr(markup, 'alt');
  if (bucket === 'name') return attr(markup, 'aria-label');
  // link: inner text of the first anchor-like element.
  const m = markup.match(/>([^<>]+)</);
  const text = m?.[1]?.trim();
  return text && text.length > 0 ? text : null;
}

/**
 * A stable substring that relocates the element in a later version of the file
 * even after its value changed: the image `src` or the link `href`. Name
 * controls (icon buttons) often have no stable attribute, so this returns null
 * and reconciliation falls back to matching the pre-fix markup.
 */
export function extractAnchor(bucket: ExampleBucket, markup: string): string | null {
  if (bucket === 'alt') return attr(markup, 'src');
  if (bucket === 'link') return attr(markup, 'href');
  return null;
}

function attr(markup: string, name: string): string | null {
  const m = markup.match(new RegExp(`${name}=["']([^"']*)["']`));
  const v = m?.[1];
  return v != null && v.length > 0 ? v : null;
}
