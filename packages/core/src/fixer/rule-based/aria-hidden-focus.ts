import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/** Elements that are focusable by default (when `<a>`/`<area>` carry an href). */
const NATIVELY_FOCUSABLE = /^(a|area|button|input|select|textarea|iframe)$/i;

/** Reads a `tabindex="N"` value from an attribute string, or `null` if absent. */
function readTabindex(attrs: string): number | null {
  const m = attrs.match(/\btabindex\s*=\s*(["'])\s*(-?\d+)\s*\1/i);
  return m ? Number(m[2]) : null;
}

/**
 * Rewrites a single opening tag so a focusable element carries `tabindex="-1"`,
 * removing it from the tab order, preserving any self-closing slash. Returns the
 * rewritten tag, or `null` when the tag is not focusable or already has a
 * negative tabindex (nothing to do).
 */
function hideTag(fullTag: string): string | null {
  const m = fullTag.match(/^<([a-zA-Z][\w-]*)([\s\S]*?)(\s*\/?)>$/);
  if (!m) return null;
  const [, name, attrs, close] = m;

  const tabindex = readTabindex(attrs);
  // <a>/<area> are only focusable with an href.
  const hrefRequired = /^(a|area)$/i.test(name);
  const nativelyFocusable =
    NATIVELY_FOCUSABLE.test(name) && (!hrefRequired || /\bhref\s*=/i.test(attrs));
  const focusable = nativelyFocusable || (tabindex !== null && tabindex >= 0);
  if (!focusable) return null;

  if (tabindex !== null) {
    if (tabindex < 0) return null; // already out of tab order
    const fixedAttrs = attrs.replace(
      /\btabindex\s*=\s*(["'])\s*-?\d+\s*\1/i,
      'tabindex="-1"',
    );
    return `<${name}${fixedAttrs}${close}>`;
  }

  return `<${name}${attrs} tabindex="-1"${close}>`;
}

/**
 * Adds `tabindex="-1"` to every focusable element on a source line so none of
 * them can receive keyboard focus, returning the rewritten line.
 *
 * Returns `null` when there is nothing deterministic to do: the line has no
 * focusable element that still needs hiding. This is intentionally conservative
 * — it only touches focusable descendants present on the one recorded line, so a
 * focusable element living on another line of a multi-line subtree is left for a
 * human rather than guessed at.
 */
export function hideFocusableDescendants(line: string): string | null {
  let changed = false;
  const rewritten = line.replace(/<[a-zA-Z][\w-]*[^>]*>/g, (tag) => {
    const fixed = hideTag(tag);
    if (fixed === null) return tag;
    changed = true;
    return fixed;
  });
  return changed ? rewritten : null;
}

/**
 * Fixes axe `aria-hidden-focus` (WCAG 4.1.2) by taking the focusable descendants
 * of an `aria-hidden="true"` element out of the tab order with `tabindex="-1"`.
 * A focusable control inside an aria-hidden subtree is reachable by keyboard yet
 * invisible to assistive tech, a mismatch this resolves. Only descendants present
 * on the recorded line are handled; anything else human-flags. Deterministic, so
 * it lives in the rule-based bucket. Sibling of AriaHiddenBodyFixer.
 */
export class AriaHiddenFocusFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-hidden-focus';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map the subtree back to a component; flag it.
      return this.humanFlag(violation, 'No source location to hide focusable descendants');
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

    const updated = hideFocusableDescendants(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'Recorded line has no focusable descendant to take out of the tab order',
      );
    }
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the fixed tabindex');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Added tabindex="-1" to focusable descendants of the aria-hidden element',
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
