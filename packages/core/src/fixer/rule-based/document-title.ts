import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/** Escapes a string for use as HTML text content inside `<title>`. */
function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

/**
 * Extracts the trimmed text of the document's first `<h1>`, with inner markup
 * stripped and whitespace collapsed. Returns `null` when there is no `<h1>` or
 * it has no text.
 */
function firstH1Text(content: string): string | null {
  const m = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  const text = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > 0 ? text : null;
}

/**
 * Fills an empty `<title>` element with the document's first `<h1>` text,
 * returning the rewritten file content.
 *
 * Returns `null` when there is nothing deterministic to do: there is no
 * `<title>` element at all (adding one needs a placement decision in `<head>`
 * that isn't deterministic), the `<title>` already has non-whitespace text, or
 * there is no `<h1>` text to borrow. Those cases are left for a human — a page
 * title should describe the page, and guessing one risks a misleading label.
 */
export function fillDocumentTitle(content: string): string | null {
  const titleRe = /<title\b[^>]*>([\s\S]*?)<\/title>/i;
  const m = content.match(titleRe);
  if (!m) return null; // no <title> to fill
  if (m[1].trim().length > 0) return null; // already has a real title

  const heading = firstH1Text(content);
  if (!heading) return null;

  const opening = m[0].slice(0, m[0].indexOf('>') + 1);
  return content.replace(titleRe, `${opening}${escapeText(heading)}</title>`);
}

/**
 * Fixes axe `document-title` (WCAG 2.4.2) by filling an empty `<title>` with the
 * page's first `<h1>` text, giving the document a name that describes it. Only
 * the empty-title case is handled deterministically; a missing `<title>` or a
 * page with no usable `<h1>` human-flags, because inventing title text or
 * choosing a `<head>` insertion point is not safe to automate. Deterministic
 * where it acts, so it lives in the rule-based bucket.
 */
export class DocumentTitleFixer implements Fixer {
  readonly wcagId = '2.4.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'document-title';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the document back to a file; flag it.
      return this.humanFlag(violation, 'No source location to fill the document title');
    }

    let content: string;
    try {
      content = await readFile(node.sourceFile, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not read source file');
    }

    const updated = fillDocumentTitle(content);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'No empty <title> to fill, or no <h1> text to derive a title from',
      );
    }

    try {
      await writeFile(node.sourceFile, updated, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the document title');
    }

    const after = updated.match(/<title\b[^>]*>[\s\S]*?<\/title>/i)?.[0] ?? '';
    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Filled the empty <title> with the page\'s first <h1> text',
      before: node.html,
      after,
      sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
    };
  }

  private humanFlag(violation: A11yViolation, note: string): FixResult {
    return {
      wcagId: this.wcagId,
      bucket: 'human-flagged',
      applied: false,
      description: note,
      before: violation.nodes[0]?.html ?? '',
      humanNote: note,
    };
  }
}
