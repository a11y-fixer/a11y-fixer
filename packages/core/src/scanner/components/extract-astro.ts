import type { Range } from './mask.js';

/**
 * An Astro component opens with an optional `---` frontmatter fence (component
 * script: imports, TS, data). Everything after it is HTML-shaped template. We
 * return the frontmatter range so the scanner blanks it; the fence must be at
 * the very start of the file to count.
 */
export function extractAstro(content: string): Range[] {
  const m = content.match(/^---\r?\n[\s\S]*?\r?\n---/);
  return m ? [[0, m[0].length]] : [];
}
