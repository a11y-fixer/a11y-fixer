import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr, escapeAttr } from '../shared/attrs.js';
import { titleFromSrc } from '../shared/title-from-src.js';

/**
 * Adds a `title` to the first `<iframe>`/`<frame>` opening tag on a source line,
 * deriving the title deterministically from an existing `aria-label`, then
 * `name`, then the `src` URL's last path segment. Returns the rewritten line.
 *
 * Returns `null` when there is nothing deterministic to do: the line has no
 * `<iframe>`/`<frame>`, the frame already has a non-empty `title`, or no source
 * yields a sensible title string (title text is partly heuristic, so the caller
 * flags these for a human rather than inventing a label).
 */
export function addFrameTitle(line: string): string | null {
  const tagMatch = line.match(/<(iframe|frame)\b([^>]*?)(\s*\/?)>/i);
  if (!tagMatch) return null;

  const [whole, name, attrs, close] = tagMatch;

  const existing = readAttr(attrs, 'title');
  if (existing !== null && existing.trim().length > 0) return null;

  const derived =
    readAttr(attrs, 'aria-label')?.trim() ||
    readAttr(attrs, 'name')?.trim() ||
    (readAttr(attrs, 'src') ? titleFromSrc(readAttr(attrs, 'src')!) : null);
  if (!derived) return null;

  // Replace an empty title in place; otherwise append a new title attribute.
  let fixedAttrs: string;
  if (existing !== null) {
    fixedAttrs = attrs.replace(
      /\btitle\s*=\s*(["'])[^"']*\1/i,
      `title="${escapeAttr(derived)}"`,
    );
  } else {
    fixedAttrs = `${attrs} title="${escapeAttr(derived)}"`;
  }

  const fixedTag = `<${name}${fixedAttrs}${close}>`;
  return line.replace(whole, fixedTag);
}

/**
 * Fixes axe `frame-title` (WCAG 4.1.2) by giving an `<iframe>`/`<frame>` a
 * descriptive `title` derived from its own attributes. Screen-reader users rely
 * on the title to decide whether to enter a frame. The title text is partly
 * heuristic, so when nothing sensible can be derived the fixer human-flags
 * rather than inventing a label; it still lives in the rule-based bucket because
 * the derivation is deterministic.
 */
export class FrameTitleFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'frame-title';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the frame back to a component; flag it.
      return this.humanFlag(violation, 'No source location to add a frame title');
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

    const updated = addFrameTitle(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'Recorded line has no frame needing a title, or no source to derive one from',
      );
    }
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the frame title');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Added a title to the frame so assistive tech can describe it',
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
