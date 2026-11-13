import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr, escapeAttr } from '../shared/attrs.js';
import { titleFromSrc } from '../shared/title-from-src.js';

/**
 * Gives an `<img>` an `alt` derived from its `src` filename, so axe `image-alt`
 * (WCAG 1.1.1) has alternative text. Returns the rewritten line, or `null` when
 * there is nothing deterministic to do.
 *
 * Returns `null` when: the line has no `<img>`; it already carries any `alt`
 * (an explicit `alt=""` marks a decorative image and is valid — never overwrite
 * it); it already has a non-empty `aria-label`/`aria-labelledby`/`title`; it is
 * explicitly `role="presentation"`/`role="none"`; or no sensible name can be
 * derived from the `src`. The filename is already in the markup, so reusing it
 * preserves intent rather than inventing text; anything else is left for a human.
 */
export function addImageAlt(line: string): string | null {
  const tagMatch = line.match(/<(img)\b([^>]*?)(\s*\/?)>/i);
  if (!tagMatch) return null;

  const [whole, tag, attrs, close] = tagMatch;

  // Any existing alt (including an intentional empty alt="") is left untouched.
  if (readAttr(attrs, 'alt') !== null) return null;

  // Already named by another mechanism — nothing to add.
  if (
    (readAttr(attrs, 'aria-label')?.trim().length ?? 0) > 0 ||
    (readAttr(attrs, 'aria-labelledby')?.trim().length ?? 0) > 0 ||
    (readAttr(attrs, 'title')?.trim().length ?? 0) > 0
  ) {
    return null;
  }

  // Explicitly decorative — adding alt text would be wrong.
  const role = readAttr(attrs, 'role')?.trim().toLowerCase();
  if (role === 'presentation' || role === 'none') return null;

  const src = readAttr(attrs, 'src');
  const derived = src ? titleFromSrc(src) : null;
  if (!derived) return null;

  return line.replace(whole, `<${tag}${attrs} alt="${escapeAttr(derived)}"${close}>`);
}

/**
 * Fixes axe `image-alt` (WCAG 1.1.1) by giving an `<img>` an `alt` derived from
 * its `src` filename, so screen-reader users get a description. When no sensible
 * word can be derived from the `src` the fixer human-flags rather than inventing
 * text; it still lives in the rule-based bucket because the derivation is
 * deterministic.
 */
export class ImageAltFixer implements Fixer {
  readonly wcagId = '1.1.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'image-alt';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the image back to a component; flag it.
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

    const updated = addImageAlt(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'No image needing alt, or no src to derive alt text from',
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
      description: 'Added alt text from the image src so the image has a description',
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
