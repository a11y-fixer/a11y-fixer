import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { A11yViolation, Detector } from '../../detector/index.js';
import { AxeDetector } from '../../detector/axe.js';
import { collectFiles } from '../../mapper/walk-files.js';
import { scanHtmlContent } from '../../runners/render-locate.js';
import { maskRanges } from './mask.js';
import { extractVue } from './extract-vue.js';
import { extractSvelte } from './extract-svelte.js';
import { extractAstro } from './extract-astro.js';

/**
 * Accessibility scanner for component single-file formats whose markup is
 * HTML-shaped: **Vue SFC** (`.vue`), **Svelte** (`.svelte`), and **Astro**
 * (`.astro`). Each file's template region is isolated by blanking its non-template
 * parts (`<script>`/`<style>`/frontmatter) *in place* — newlines preserved, every
 * other byte spaced — so the result is valid HTML whose lines/columns still map
 * 1:1 to the original file. That masked markup is rendered with the same axe
 * detector the static-HTML path uses, giving these formats the full axe ruleset
 * and letting the existing rule-based fixers edit the real source line.
 *
 * Like the Markdown scanner, this is additive: callers concatenate its output
 * onto `scanSource`'s. It needs a browser (puppeteer), same as `--html`.
 *
 * MDX is *not* here — it's a Markdown superset handled by the Markdown scanner.
 */

const COMPONENT_EXTENSIONS = /\.(vue|svelte|astro)$/i;

/**
 * Axe rules that describe a *whole page/document* and are meaningless for a
 * component fragment. Isolating a template and handing it to a browser wraps it
 * in a synthetic `<html><body>`, so axe reports a missing `<title>`/`lang`, no
 * `<main>` landmark, no `<h1>`, un-landmarked content, and no skip link — none of
 * which the component owns (its host page does). Dropping them keeps component
 * findings to element-level issues the component can actually fix.
 */
const FRAGMENT_EXCLUDED_RULES = new Set([
  'document-title',
  'html-has-lang',
  'html-lang-valid',
  'html-xml-lang-mismatch',
  'landmark-one-main',
  'landmark-no-duplicate-main',
  'landmark-complementary-is-top-level',
  'page-has-heading-one',
  'region',
  'bypass',
]);

export async function scanComponents(
  rootDir: string,
  detector: Detector = new AxeDetector(),
): Promise<A11yViolation[]> {
  const files = await collectFiles(rootDir, COMPONENT_EXTENSIONS);
  const out: A11yViolation[] = [];
  for (const file of files) {
    const content = await readFile(file, 'utf8').catch(() => null);
    if (content === null) continue;
    const masked = await maskNonTemplate(file, content);
    if (masked === null) continue;
    const violations = await scanHtmlContent(detector, masked, file);
    out.push(...violations.filter((v) => !FRAGMENT_EXCLUDED_RULES.has(v.id)));
  }
  return out;
}

/**
 * Masks everything but the template markup of one component file, dispatched by
 * extension. Returns `null` when the file has no scannable template (e.g. a Vue
 * SFC that is script/style only). Exported for unit tests.
 */
export async function maskNonTemplate(file: string, content: string): Promise<string | null> {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case '.vue': {
      const ranges = await extractVue(content);
      return ranges === null ? null : maskRanges(content, ranges);
    }
    case '.svelte':
      return maskRanges(content, extractSvelte(content));
    case '.astro':
      return maskRanges(content, extractAstro(content));
    default:
      return null;
  }
}
