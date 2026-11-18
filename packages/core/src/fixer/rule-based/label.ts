import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr, escapeAttr } from '../shared/attrs.js';

/** Turns label text into an id-safe slug, or `null` when nothing usable remains. */
function slugify(text: string): string | null {
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : null;
}

/** Picks an id based on `base` that no `id="…"` in `content` already uses. */
function uniqueId(content: string, base: string): string {
  const taken = (id: string) => new RegExp(`\\bid\\s*=\\s*(["'])${id}\\1`, 'i').test(content);
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/**
 * Associates a form control with an adjacent `<label>` by adding `for`/`id`, so
 * axe `label` (WCAG 1.3.1) sees a programmatic label. Operates on the full file
 * `content`; `line` is the 1-indexed source line of the flagged control.
 *
 * Only the conservative, deterministic case is handled: the control on `line`
 * is immediately preceded (only whitespace between) by a `</label>` whose
 * `<label>` has visible text and no existing `for`. The label gets
 * `for="<id>"`; when the control has no `id`, one is derived from the label text
 * (made unique against the file) and added to the control too.
 *
 * Returns the rewritten content, or `null` when nothing deterministic applies:
 * no control on the line, no adjacent labelled `</label>`, the label already has
 * a `for`, the label has no text, or no id can be derived. Those cases need a
 * human to decide the association, so the caller flags them.
 */
export function associateAdjacentLabel(content: string, line: number): string | null {
  const lines = content.split('\n');
  const idx = line - 1;
  if (idx < 0 || idx >= lines.length) return null;

  let lineStart = 0;
  for (let i = 0; i < idx; i++) lineStart += lines[i].length + 1; // +1 for '\n'

  const ctrl = /<(input|select|textarea)\b/i.exec(content.slice(lineStart));
  if (!ctrl) return null;
  const ctrlStart = lineStart + ctrl.index;

  // The control must be immediately preceded by </label> (whitespace aside).
  const before = content.slice(0, ctrlStart).replace(/\s+$/, '');
  if (!/<\/label>$/i.test(before)) return null;

  const labelCloseStart = before.length - '</label>'.length;
  const labelOpenIdx = before.toLowerCase().lastIndexOf('<label', labelCloseStart);
  if (labelOpenIdx < 0) return null;
  const labelOpenEnd = content.indexOf('>', labelOpenIdx);
  if (labelOpenEnd < 0 || labelOpenEnd >= labelCloseStart) return null;

  const labelOpenTag = content.slice(labelOpenIdx, labelOpenEnd + 1);
  if (readAttr(labelOpenTag, 'for') !== null) return null; // already associated

  const labelText = content
    .slice(labelOpenEnd + 1, labelCloseStart)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (labelText.length === 0) return null;

  const ctrlEnd = content.indexOf('>', ctrlStart);
  if (ctrlEnd < 0) return null;
  const ctrlTag = content.slice(ctrlStart, ctrlEnd + 1);
  const existingId = readAttr(ctrlTag, 'id')?.trim() || null;

  let id: string;
  let newCtrlTag = ctrlTag;
  if (existingId) {
    id = existingId;
  } else {
    const base = slugify(labelText);
    if (!base) return null;
    id = uniqueId(content, base);
    newCtrlTag = ctrlTag.replace(/^<([a-z]+)/i, `<$1 id="${id}"`);
  }

  const newLabelOpen = labelOpenTag.replace(/^<label/i, `<label for="${escapeAttr(id)}"`);

  // Apply the control edit first (it sits after the label, so the label offsets
  // stay valid), then the label edit.
  let out = content;
  if (newCtrlTag !== ctrlTag) {
    out = out.slice(0, ctrlStart) + newCtrlTag + out.slice(ctrlEnd + 1);
  }
  out = out.slice(0, labelOpenIdx) + newLabelOpen + out.slice(labelOpenEnd + 1);
  return out;
}

/**
 * Fixes axe `label` (WCAG 1.3.1) by associating an unlabeled form control with
 * an adjacent `<label>` via `for`/`id`. Only this conservative case is handled
 * deterministically — a control with no nearby label needs a human to supply or
 * place one, so it human-flags. The association reuses existing markup, so it
 * lives in the rule-based bucket.
 */
export class LabelFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'label';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the control back to a component; flag it.
      return this.humanFlag(violation, 'No source location to add a label');
    }

    let content: string;
    try {
      content = await readFile(node.sourceFile, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not read source file');
    }

    const updated = associateAdjacentLabel(content, node.sourceLine);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'No adjacent <label> to associate; add a <label> or aria-label',
      );
    }

    try {
      await writeFile(node.sourceFile, updated, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the label association');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Associated the control with its adjacent <label> via for/id',
      before: node.html,
      after: updated.split('\n')[node.sourceLine - 1]?.trim() ?? node.html,
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
