import type { Range } from './mask.js';

/**
 * Extracts the blank-ranges for a Vue SFC: everything *outside* the root
 * `<template>` block's content — the `<script>`/`<style>` blocks, custom blocks,
 * and the `<template>`/`</template>` tags themselves.
 *
 * The tags must be blanked (not just the sibling blocks) because a browser treats
 * a real `<template>` element's contents as an inert document fragment that axe
 * never sees; stripping the wrapper promotes the markup into `<body>`.
 *
 * Returns `null` when the SFC has no `<template>` — nothing to scan. Uses the
 * official `@vue/compiler-sfc` parser (loaded on demand so `.md`/HTML-only users
 * never pay for it) and throws a clear error if it isn't installed.
 */
export async function extractVue(content: string): Promise<Range[] | null> {
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

  // `loc` spans the content between the tags, so blanking the complement keeps
  // the inner markup at its original offsets while removing the wrapper tags.
  const start = template.loc.start.offset;
  const end = template.loc.end.offset;
  return [
    [0, start],
    [end, content.length],
  ];
}
