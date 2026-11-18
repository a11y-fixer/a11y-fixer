import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr, escapeAttr } from '../shared/attrs.js';
import { titleFromSrc } from '../shared/title-from-src.js';

/**
 * Gives an `<input type="image">` (a button rendered as an image) an `alt`
 * derived from its `src` filename, so axe `input-image-alt` (WCAG 1.1.1) has
 * alternative text. Returns the rewritten line.
 *
 * Returns `null` when there is nothing deterministic to do: the line has no
 * `<input>`, the input is not `type="image"`, it already has a non-empty `alt`
 * or `aria-label`, or no sensible name can be derived from the `src`. The
 * filename is already in the markup, so reusing it preserves intent rather than
 * inventing text; anything else is left for a human.
 */
export function addImageInputAlt(line: string): string | null {
  const tagMatch = line.match(/<input\b([^>]*?)(\s*\/?)>/i);
  if (!tagMatch) return null;

  const [whole, attrs, close] = tagMatch;

  if (readAttr(attrs, 'type')?.trim().toLowerCase() !== 'image') return null;

  // Already named — nothing to add.
  if (
    (readAttr(attrs, 'alt')?.trim().length ?? 0) > 0 ||
    (readAttr(attrs, 'aria-label')?.trim().length ?? 0) > 0
  ) {
    return null;
  }

  const src = readAttr(attrs, 'src');
  const derived = src ? titleFromSrc(src) : null;
  if (!derived) return null;

  // Replace an empty alt in place; otherwise append a new alt attribute.
  let fixedAttrs: string;
  if (readAttr(attrs, 'alt') !== null) {
    fixedAttrs = attrs.replace(
      /\balt\s*=\s*(["'])[^"']*\1/i,
      `alt="${escapeAttr(derived)}"`,
    );
  } else {
    fixedAttrs = `${attrs} alt="${escapeAttr(derived)}"`;
  }

  return line.replace(whole, `<input${fixedAttrs}${close}>`);
}

/**
 * Fixes axe `input-image-alt` (WCAG 1.1.1) by giving an `<input type="image">`
 * an `alt` derived from its `src` filename, so screen-reader users get a name
 * for the image button. When no sensible word can be derived from the `src` the
 * fixer human-flags rather than inventing text; it still lives in the rule-based
 * bucket because the derivation is deterministic.
 */
export class InputImageAltFixer implements Fixer {
  readonly wcagId = '1.1.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'input-image-alt';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the input back to a component; flag it.
      return this.humanFlag(violation, 'No source location to add alt text');
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

    const updated = addImageInputAlt(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'No image input needing alt, or no src to derive alt text from',
      );
    }
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the alt text');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Added alt text from the image src so the image button has an accessible name',
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
