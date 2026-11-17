import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { A11yViolation } from '@a11y-fixer/core';
import { GENERIC_LINK_PATTERNS } from '../fixers/link-text.js';

/**
 * A repo-local scanner for Markdown accessibility violations.
 *
 * `@a11y-fixer/core`'s `scanSource` only understands JSX/TSX (ESLint) and static
 * HTML (axe) — it never sees `.md`. Markdown is authored prose, so the two
 * violations that actually occur in it are:
 *   - **1.1.1** images with empty/missing alt: `![](img.png)` / `![  ](img.png)`
 *   - **2.4.4** non-descriptive link text: `[here](url)`, `[click here](url)`,
 *     empty link text `[](url)`, or a bare URL used as its own text.
 *
 * It emits the same {@link A11yViolation} shape core emits, keyed off
 * `{ sourceFile, sourceLine, sourceColumn }`, so the existing registry dispatch,
 * `dedupeFixFiles`, `verifyFixes`, and `PullRequestBuilder` work unchanged. The
 * matching markdown fixers do a column-anchored line replace back into the `.md`.
 *
 * Scope (v1): Markdown-syntax images/links only. Reference-style (`![a][ref]`)
 * and raw inline HTML inside `.md` are intentionally out of scope.
 */

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.a11y-fixer']);

/** Empty (or whitespace-only) alt image: `![](src)`. Global, column-aware. */
const EMPTY_ALT_IMAGE = /!\[\s*\]\(([^)]+)\)/g;
/**
 * Any inline link `[text](href)`, excluding images via a `(?<!!)` lookbehind so
 * the char before `[` is not consumed — that keeps two directly adjacent links
 * (`[a](x)[b](y)`) both matchable and the column equal to `match.index`.
 */
const INLINE_LINK = /(?<!!)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export async function scanMarkdown(rootDir: string): Promise<A11yViolation[]> {
  const files = await collectMarkdownFiles(rootDir);
  const violations: A11yViolation[] = [];

  for (const file of files) {
    let content: string;
    try {
      content = await readFile(file, 'utf8');
    } catch {
      continue;
    }
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      const lineNo = i + 1;
      violations.push(...scanLine(file, lineNo, line));
    }
  }

  return violations;
}

/** Exported for unit tests: all violations on a single 1-indexed source line. */
export function scanLine(file: string, lineNo: number, line: string): A11yViolation[] {
  const out: A11yViolation[] = [];

  EMPTY_ALT_IMAGE.lastIndex = 0;
  for (let m = EMPTY_ALT_IMAGE.exec(line); m; m = EMPTY_ALT_IMAGE.exec(line)) {
    const column = m.index + 1; // 1-indexed, points at the `!` of `![`
    out.push(violation('md-image-alt', '1.1.1', 'Markdown image has no alt text', file, lineNo, column, m[0]));
  }

  INLINE_LINK.lastIndex = 0;
  for (let m = INLINE_LINK.exec(line); m; m = INLINE_LINK.exec(line)) {
    const text = (m[1] ?? '').trim();
    const href = (m[2] ?? '').trim();
    if (!isNonDescriptive(text, href)) continue;
    const column = m.index + 1; // 1-indexed, points at the `[` of `[text]`
    out.push(violation('md-link-text', '2.4.4', 'Markdown link has non-descriptive text', file, lineNo, column, `[${m[1]}](${m[2]})`));
  }

  // Emit a line's constructs rightmost-first. The fixers edit sequentially,
  // each re-reading the file and slicing at the violation's original column; a
  // left-to-right order would let an earlier (lower-column) splice shift a later
  // construct, so its stale column would miss and the fix would be dropped.
  // Descending column means every edit lands to the right of the ones still
  // pending, keeping their columns valid.
  out.sort((a, b) => (b.nodes[0]?.sourceColumn ?? 0) - (a.nodes[0]?.sourceColumn ?? 0));

  return out;
}

/** Empty, generic, or a bare URL repeated as its own visible text. */
function isNonDescriptive(text: string, href: string): boolean {
  if (text === '') return true;
  if (GENERIC_LINK_PATTERNS.test(text)) return true;
  // Bare URL as link text: a screen reader reads the whole URL aloud.
  if (text === href && /^(https?:\/\/|www\.)/i.test(text)) return true;
  return false;
}

function violation(
  id: string,
  wcagId: string,
  description: string,
  file: string,
  line: number,
  column: number,
  markup: string,
): A11yViolation {
  return {
    id,
    wcagId,
    impact: 'serious',
    description,
    helpUrl: '',
    nodes: [{
      html: `${file}:${line}:${column}`,
      target: [file],
      failureSummary: description,
      sourceFile: file,
      sourceLine: line,
      sourceColumn: column,
    }],
  };
}

async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        await walk(path.join(dir, entry.name));
      } else if (entry.isFile() && MARKDOWN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        out.push(path.join(dir, entry.name));
      }
    }
  }
  await walk(rootDir);
  return out.sort();
}
