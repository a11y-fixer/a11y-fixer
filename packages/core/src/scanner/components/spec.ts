import type { Range } from './mask.js';

/**
 * A delimiter-pair "raw island" of non-HTML content to blank — e.g. PHP tags or
 * Blade comments. Matched by literal `indexOf` scanning (never regex) so there is
 * no backtracking and no ReDoS surface, no matter how large or malformed the file.
 */
export interface RawIsland {
  /** Literal opening delimiter, e.g. `<?php`, `@php`, `{{--`. */
  open: string;
  /** Literal closing delimiter, e.g. `?>`, `@endphp`, `--}}`. An unterminated
   *  island (no closer before EOF) is blanked through to the end of the file. */
  close: string;
  /** Alternate openers sharing the same closer, e.g. `<?=` alongside `<?php`. */
  openAliases?: string[];
}

/**
 * Keep ONLY the inner content of one root block (Vue's `<template>`); blank its
 * complement — the surrounding `<script>`/`<style>`/custom blocks AND the block's
 * own wrapper tags, so a browser promotes the markup into `<body>` where axe sees it.
 */
export interface RootElementOnly {
  /** Tag name of the block whose inner content is the scannable template. */
  block: string;
  /**
   * Optional external parser hook returning the block's inner `[start, end)`
   * content range, or `null` when the block is absent (→ nothing to scan). Vue
   * supplies one backed by `@vue/compiler-sfc`; when omitted a parse5 fallback
   * locates the first matching element.
   */
  locate?: (content: string) => Promise<Range | null>;
}

/**
 * Declarative description of how to isolate the HTML-shaped template of one
 * component/template file format. The scanner composes these primitives into the
 * byte ranges that {@link maskRanges} blanks; the only invariant is that whatever
 * survives masking is valid, position-preserved HTML an axe browser can parse.
 * Interpolations/directives left behind (`{{ }}`, `{expr}`, `*ngIf`, `[attr]`,
 * `(click)`, `@if`, `{!! !!}`) are inert text/attribute values to the parser.
 *
 * Adding a framework is one entry in `FRAMEWORK_SPECS` — no new dispatch code.
 */
export interface FrameworkSpec {
  /** Human label for messages/docs, e.g. `'Vue SFC'`, `'Blade'`. */
  name: string;
  /**
   * Tested against the file **basename** (not the full path), so multi-dot names
   * like `.component.ts` and `.blade.php` match. Must not carry the global flag.
   */
  match: RegExp;

  // --- masking primitives, composed in order by extractRanges() ---
  /** Blank a leading `---\n…\n---` frontmatter fence (Astro). */
  frontmatterFence?: boolean;
  /** parse5: blank the full source range of each of these elements (Svelte `script`/`style`). */
  blankElements?: string[];
  /** Keep only one root block's inner content (Vue). Takes precedence over other primitives. */
  rootElementOnly?: RootElementOnly;
  /** Index-scanned delimiter pairs to blank (Blade `<?php ?>`/`@php…@endphp`/`{{-- --}}`). */
  rawIslands?: RawIsland[];
  /**
   * Fully custom extractor for what the primitives can't express (Angular inline
   * `template:` literal). Returns the ranges to blank, or `null` to skip the file.
   * Takes precedence over every other primitive.
   */
  extract?: (content: string) => Promise<Range[] | null> | Range[] | null;

  /**
   * Treat the masked output as an HTML *fragment* — drop whole-document axe rules
   * that are artifacts of wrapping a fragment in a synthetic page. Defaults to
   * `true`; every format we support is a fragment.
   */
  fragment?: boolean;
}
