import type { Range } from './mask.js';
import type { FrameworkSpec } from './spec.js';
import { extractAngularInline } from './extract-angular.js';
import { extractBlade } from './extract-blade.js';

/**
 * Locates a Vue SFC's `<template>` inner content via the official
 * `@vue/compiler-sfc` parser (loaded on demand so `.md`/HTML-only users never pay
 * for it). Returns `null` when the SFC has no template; throws a clear, actionable
 * error if the parser isn't installed.
 */
async function locateVueTemplate(content: string): Promise<Range | null> {
  let parse: typeof import('@vue/compiler-sfc').parse;
  try {
    ({ parse } = await import('@vue/compiler-sfc'));
  } catch {
    throw new Error(
      'Scanning .vue files requires "@vue/compiler-sfc".\n' +
      '  Install it: pnpm add @vue/compiler-sfc',
    );
  }
  const { descriptor } = parse(content);
  const template = descriptor.template;
  if (!template) return null;
  // `loc` spans the content between the tags; the scanner blanks the complement.
  return [template.loc.start.offset, template.loc.end.offset];
}

/**
 * The supported component/template formats, in match order (first `match` that
 * tests the file basename wins). HTML-shaped formats differ only in which
 * non-HTML regions must be blanked before axe sees the template:
 *
 * - **Vue SFC** — keep only `<template>`, blank `<script>`/`<style>`/custom blocks.
 * - **Svelte** — blank `<script>`/`<style>`; the rest is the template.
 * - **Astro** — blank the leading `---…---` frontmatter fence.
 * - **Handlebars** — pure HTML; `{{…}}`/`{{#if}}`/`{{> partial}}` are inert text.
 * - **Blade** — blank PHP tags, `@php…@endphp`, and `{{-- --}}` comments; `{{ $x }}`,
 *   `{!! !!}`, and `@directives` are left inert.
 * - **Angular** — external `.component.html` is a plain HTML fragment; inline
 *   `.component.ts` keeps only the `template:` string literal's interior.
 */
export const FRAMEWORK_SPECS: FrameworkSpec[] = [
  { name: 'Vue SFC', match: /\.vue$/i, rootElementOnly: { block: 'template', locate: locateVueTemplate } },
  { name: 'Svelte', match: /\.svelte$/i, blankElements: ['script', 'style'] },
  { name: 'Astro', match: /\.astro$/i, frontmatterFence: true },
  { name: 'Handlebars', match: /\.(hbs|handlebars)$/i },
  { name: 'Blade', match: /\.blade\.php$/i, extract: extractBlade },
  { name: 'Angular template', match: /\.component\.html$/i },
  { name: 'Angular inline', match: /\.component\.ts$/i, extract: extractAngularInline },
];
