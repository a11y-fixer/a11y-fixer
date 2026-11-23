import { matchRanges, type Range } from './mask.js';

/**
 * A Svelte component *is* its template, minus the `<script>` and `<style>`
 * blocks. We return those blocks' ranges so the scanner blanks them — the rest
 * (HTML-shaped markup, possibly interleaved with `{#if}`/`{expr}` which parse as
 * inert text/attribute values) is handed to axe unchanged.
 *
 * The non-greedy `<\/script>` / `<\/style>` match is deliberately simple; a `</`
 * sequence inside a script string is a rare, documented v1 gap.
 */
export function extractSvelte(content: string): Range[] {
  return [
    ...matchRanges(content, /<script\b[\s\S]*?<\/script>/gi),
    ...matchRanges(content, /<style\b[\s\S]*?<\/style>/gi),
  ];
}
