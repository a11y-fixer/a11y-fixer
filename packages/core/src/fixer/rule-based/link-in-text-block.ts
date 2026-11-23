import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Adds `text-decoration: underline` to the first `<a>` opening tag on `line`,
 * merging into an existing inline `style` attribute or adding one.
 *
 * Returns `null` (caller human-flags) when there is no `<a>` tag on the line, or
 * the link's inline style already declares a non-`none` `text-decoration` — in
 * which case the color-only distinction lives in a stylesheet/class we can't
 * safely reach from this source line.
 */
export function addUnderlineToLink(line: string): string | null {
  const tagMatch = line.match(/<a\b[^>]*>/i);
  if (!tagMatch) return null;
  const tag = tagMatch[0];

  const styleMatch = tag.match(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/i);
  if (styleMatch) {
    const quote = styleMatch[1]!;
    const value = styleMatch[2]!;
    const decl = value.match(/text-decoration(?:-line)?\s*:\s*([^;]+)/i);
    if (decl) {
      // An explicit text-decoration already applies inline. If it underlines,
      // the link isn't color-only here; if it's `none`, replace that value.
      if (!/\bnone\b/i.test(decl[1]!)) return null;
      const fixedValue = value.replace(
        /text-decoration(?:-line)?\s*:\s*[^;]+/i,
        'text-decoration: underline',
      );
      const newStyle = `style=${quote}${fixedValue}${quote}`;
      const newTag = tag.replace(styleMatch[0], newStyle);
      return line.replace(tag, newTag);
    }
    const sep = value.trim().length > 0 && !value.trim().endsWith(';') ? '; ' : ' ';
    const merged = `${value.trimEnd()}${value.trim().length > 0 ? sep : ''}text-decoration: underline`;
    const newStyle = `style=${quote}${merged}${quote}`;
    const newTag = tag.replace(styleMatch[0], newStyle);
    return line.replace(tag, newTag);
  }

  // No style attribute — insert one right after the tag name.
  const newTag = tag.replace(/^<a\b/i, '<a style="text-decoration: underline"');
  return line.replace(tag, newTag);
}

/**
 * Fixes axe `link-in-text-block` (WCAG 1.4.1): a link inside a block of text that
 * is distinguished from the surrounding text by color alone. The deterministic
 * repair is to give it a non-color visual cue — an underline — so it lives in the
 * rule-based bucket. Only inline-style links on the recorded source line are
 * auto-fixed; class/stylesheet-driven links are human-flagged with the fix.
 */
export class LinkInTextBlockFixer implements Fixer {
  readonly wcagId = '1.4.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'link-in-text-block';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to underline the link');
    }

    let content: string;
    try {
      content = await readFile(node.sourceFile, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not read source file');
    }

    const lines = content.split('\n');
    const idx = node.sourceLine - 1;
    const original = lines[idx];
    if (original === undefined) {
      return this.humanFlag(violation, 'Recorded line is out of range');
    }

    const updated = addUnderlineToLink(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'Link styling is not inline on the source line — add `text-decoration: underline` (or another non-color cue) in the stylesheet',
      );
    }

    lines[idx] = updated;
    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the underlined link');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Added text-decoration: underline so the link is distinguishable without color',
      before: node.html,
      after: updated.trim(),
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
