import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { toString as mdToString } from 'mdast-util-to-string';
import type { Root, RootContent } from 'mdast';
import type { A11yViolation } from '../detector/index.js';

/**
 * A Markdown accessibility scanner built on the remark/mdast AST.
 *
 * `@a11y-fixer/core`'s `scanSource` understands JSX/TSX (ESLint) and static HTML
 * (axe) — it never parses `.md`. Markdown is authored prose; the accessibility
 * problems that actually occur in it are:
 *   - **1.1.1** images with empty/missing alt: `![](img.png)`, `![][ref]`, and
 *     raw inline `<img>` with no `alt`.
 *   - **2.4.4** non-descriptive link text: `[here](url)`, `[](url)`, `[x][ref]`
 *     with empty/generic text, or a bare URL used as its own visible text.
 *   - **2.4.6** heading order: a level that skips down (`##` → `####`).
 *   - **1.3.1** tables with empty header cells.
 *
 * Working on the AST (not line regexes) means fenced/inline code is never
 * mistaken for prose, and block-spanning (tables) and whole-document (heading
 * order) rules are expressible. It emits the standard {@link A11yViolation}
 * shape keyed on `{ sourceFile, sourceLine, sourceColumn }`, so the existing
 * registry dispatch, `dedupeFixFiles`, `verifyFixes`, and `PullRequestBuilder`
 * consume it unchanged.
 *
 * Scope: Markdown + raw-`<img>` syntax. MDX and rendered-output rules (contrast)
 * are out of scope.
 */

/** Link text so generic it conveys nothing out of context — safe to rewrite. */
export const GENERIC_LINK_PATTERNS =
  /^(click here|here|learn more|read more|more|details|link|go|continue)$/i;

const MARKDOWN_EXTENSIONS = new Set(['.md', '.markdown']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.a11y-fixer']);

const parser = unified().use(remarkParse).use(remarkGfm);

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
    violations.push(...scanContent(file, content));
  }
  return violations;
}

/** Exported for unit tests: all violations in one file's `content`. */
export function scanContent(file: string, content: string): A11yViolation[] {
  const lines = content.split('\n');
  const tree = parser.parse(content) as Root;
  const out: A11yViolation[] = [];

  visit(tree, (node) => {
    const pos = node.position?.start;
    if (!pos) return;
    const line = pos.line;
    const column = pos.column;

    switch (node.type) {
      case 'image': {
        if (isBlankAlt(node.alt)) {
          out.push(v('md-image-alt', '1.1.1', 'Markdown image has no alt text', file, line, column));
        }
        break;
      }
      case 'imageReference': {
        if (isBlankAlt(node.alt)) {
          out.push(v('md-image-alt', '1.1.1', 'Markdown image has no alt text', file, line, column));
        }
        break;
      }
      case 'link':
      case 'linkReference': {
        // Skip autolinks (`<https://…>`): valid, and not what this rule targets.
        const raw = lines[line - 1] ?? '';
        if (raw[column - 1] === '<') break;
        const text = mdToString(node).trim();
        const href = node.type === 'link' ? node.url.trim() : '';
        if (isNonDescriptiveLink(text, href)) {
          out.push(v('md-link-text', '2.4.4', 'Markdown link has non-descriptive text', file, line, column));
        }
        break;
      }
      case 'heading':
        // Heading order is a whole-document rule, handled in a second pass below.
        break;
      case 'table': {
        const header = node.children[0];
        if (header?.type === 'tableRow') {
          const hasBlankCell = header.children.some((cell) => mdToString(cell).trim() === '');
          if (hasBlankCell) {
            out.push(v('md-table-header', '1.3.1', 'Markdown table has an empty header cell', file, line, column));
          }
        }
        break;
      }
      case 'html': {
        // Raw inline/block HTML embedded in Markdown — flag <img> with no alt.
        out.push(...scanRawImg(node.value, file, line, column));
        break;
      }
    }
  });

  out.push(...scanHeadingOrder(tree, file));

  // Emit rightmost-first within a line so the column-anchored inline fixers
  // (image/link) edit a multi-construct line right-to-left, keeping the columns
  // of pending constructs valid after each splice.
  out.sort((a, b) => {
    const la = a.nodes[0]?.sourceLine ?? 0;
    const lb = b.nodes[0]?.sourceLine ?? 0;
    if (la !== lb) return la - lb;
    return (b.nodes[0]?.sourceColumn ?? 0) - (a.nodes[0]?.sourceColumn ?? 0);
  });
  return out;
}

/** Empty, generic, or a bare URL repeated as its own visible text. */
function isNonDescriptiveLink(text: string, href: string): boolean {
  if (text === '') return true;
  if (GENERIC_LINK_PATTERNS.test(text)) return true;
  if (text === href && /^(https?:\/\/|www\.)/i.test(text)) return true;
  return false;
}

function isBlankAlt(alt: string | null | undefined): boolean {
  return alt == null || alt.trim() === '';
}

/** `<img>` tags in a raw-HTML node that lack a non-empty `alt`. Single-line only. */
function scanRawImg(value: string, file: string, startLine: number, startColumn: number): A11yViolation[] {
  const out: A11yViolation[] = [];
  const IMG = /<img\b[^>]*>/gi;
  for (let m = IMG.exec(value); m; m = IMG.exec(value)) {
    const tag = m[0];
    const altMatch = tag.match(/\balt\s*=\s*("([^"]*)"|'([^']*)')/i);
    const altValue = altMatch ? (altMatch[2] ?? altMatch[3] ?? '') : null;
    if (altValue != null && altValue.trim() !== '') continue;
    // Only single-line raw HTML gets a reliable column; skip if the match spans
    // a newline from the node start.
    const before = value.slice(0, m.index);
    if (before.includes('\n')) continue;
    const column = startColumn + m.index;
    out.push(v('md-html-img-alt', '1.1.1', 'Raw <img> in Markdown has no alt text', file, startLine, column));
  }
  return out;
}

/** A heading's level and 1-indexed source position, in document order. */
export interface MarkdownHeading {
  level: number;
  line: number;
  column: number;
}

/** All ATX/Setext headings in `content`, in document order with 1-indexed lines. */
export function collectMarkdownHeadings(content: string): MarkdownHeading[] {
  const tree = parser.parse(content) as Root;
  const headings: MarkdownHeading[] = [];
  for (const node of tree.children as RootContent[]) {
    if (node.type === 'heading' && node.position?.start) {
      headings.push({ level: node.depth, line: node.position.start.line, column: node.position.start.column });
    }
  }
  return headings;
}

/** Document-level: flag a heading whose level skips past its predecessor + 1. */
function scanHeadingOrder(tree: Root, file: string): A11yViolation[] {
  const out: A11yViolation[] = [];
  const headings: MarkdownHeading[] = [];
  for (const node of tree.children as RootContent[]) {
    if (node.type === 'heading' && node.position?.start) {
      headings.push({ level: node.depth, line: node.position.start.line, column: node.position.start.column });
    }
  }
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1];
    const cur = headings[i];
    if (cur.level > prev.level + 1) {
      out.push(v('md-heading-order', '2.4.6', `Markdown heading level skips from h${prev.level} to h${cur.level}`, file, cur.line, cur.column));
    }
  }
  return out;
}

function v(
  id: string,
  wcagId: string,
  description: string,
  file: string,
  line: number,
  column: number,
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
