import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { A11yViolation, Detector } from '../../detector/index.js';
import { AxeDetector } from '../../detector/axe.js';
import { collectFiles } from '../../mapper/walk-files.js';
import { scanHtmlContent } from '../../runners/render-locate.js';
import { maskRanges } from './mask.js';
import { extractRanges } from './extract.js';
import { FRAMEWORK_SPECS } from './specs.js';
import type { FrameworkSpec } from './spec.js';

/**
 * Accessibility scanner for component/template formats whose markup is HTML-shaped:
 * **Vue SFC** (`.vue`), **Svelte** (`.svelte`), **Astro** (`.astro`), **Handlebars**
 * (`.hbs`/`.handlebars`), **Blade** (`.blade.php`), and **Angular** (`.component.html`
 * external templates + inline `template:` literals in `.component.ts`).
 *
 * Each file's template region is isolated by blanking its non-template parts
 * (`<script>`/`<style>`/frontmatter/PHP islands) *in place* — newlines preserved,
 * every other byte spaced — so the result is valid HTML whose lines/columns still
 * map 1:1 to the original file. That masked markup is rendered with the same axe
 * detector the static-HTML path uses, giving these formats the full axe ruleset and
 * letting the existing rule-based fixers edit the real source line.
 *
 * How each format is masked is declared in {@link FRAMEWORK_SPECS}; adding a format
 * is one spec entry. Like the Markdown scanner, this is additive: callers concatenate
 * its output onto `scanSource`'s. It needs a browser (puppeteer), same as `--html`.
 *
 * MDX is *not* here — it's a Markdown superset handled by the Markdown scanner.
 */

/** Union matcher for traversal; per-file format is resolved by {@link specFor}. */
const COMPONENT_FILE = /\.(vue|svelte|astro|hbs|handlebars)$|\.component\.ts$|\.component\.html$|\.blade\.php$/i;

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

/** First spec whose `match` tests the file basename, or `null` if none applies. */
function specFor(file: string): FrameworkSpec | null {
  const base = path.basename(file);
  return FRAMEWORK_SPECS.find((s) => s.match.test(base)) ?? null;
}

export async function scanComponents(
  rootDir: string,
  detector: Detector = new AxeDetector(),
): Promise<A11yViolation[]> {
  const files = await collectFiles(rootDir, COMPONENT_FILE);
  const out: A11yViolation[] = [];
  for (const file of files) {
    const spec = specFor(file);
    if (!spec) continue;
    const content = await readFile(file, 'utf8').catch(() => null);
    if (content === null) continue;
    const ranges = await extractRanges(content, spec);
    if (ranges === null) continue;
    const masked = maskRanges(content, ranges);
    const violations = await scanHtmlContent(detector, masked, file);
    const isFragment = spec.fragment !== false;
    out.push(...violations.filter((v) => !isFragment || !FRAGMENT_EXCLUDED_RULES.has(v.id)));
  }
  return out;
}

/**
 * Masks everything but the template markup of one component file, dispatched by
 * its {@link FrameworkSpec}. Returns `null` when the file has no scannable template
 * (e.g. a script/style-only Vue SFC, or a `templateUrl:` Angular component).
 * Exported for unit tests.
 */
export async function maskNonTemplate(file: string, content: string): Promise<string | null> {
  const spec = specFor(file);
  if (!spec) return null;
  const ranges = await extractRanges(content, spec);
  return ranges === null ? null : maskRanges(content, ranges);
}
