import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Rewrites a zoom-disabling viewport `content` value into a compliant one, or
 * returns `null` when it is already compliant (nothing to change).
 *
 * axe `meta-viewport` (WCAG 1.4.4) fails when the `<meta name="viewport">`
 * `content` disables pinch-zoom via `user-scalable=no` (also `0`/`false`) or
 * caps zoom with `maximum-scale` < 5. We drop exactly those directives and keep
 * every other directive (e.g. `width=device-width`, `initial-scale=1`) in order.
 */
export function sanitizeViewportContent(content: string): string | null {
  const directives = content.split(',').map(d => d.trim()).filter(d => d.length > 0);

  const kept = directives.filter(directive => {
    const eq = directive.indexOf('=');
    const key = (eq === -1 ? directive : directive.slice(0, eq)).trim().toLowerCase();
    const value = (eq === -1 ? '' : directive.slice(eq + 1)).trim().toLowerCase();

    if (key === 'user-scalable') {
      return !(value === 'no' || value === '0' || value === 'false');
    }
    if (key === 'maximum-scale') {
      const num = Number.parseFloat(value);
      return !(Number.isFinite(num) && num < 5);
    }
    return true;
  });

  if (kept.length === directives.length) return null;
  return kept.join(', ');
}

/**
 * Fixes axe `meta-viewport` (WCAG 1.4.4) by stripping zoom-blocking directives
 * from the `<meta name="viewport">` `content` attribute. Deterministic, so it
 * lives in the rule-based bucket alongside {@link HtmlLangFixer}.
 *
 * Claims only the axe id; a jsx-a11y equivalent, if any, stays with EslintFixer.
 */
export class MetaViewportFixer implements Fixer {
  readonly wcagId = '1.4.4';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'meta-viewport';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map <meta> back to a component; flag for a human.
      return this.humanFlag(violation, 'No source location to fix the viewport meta');
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

    // Match the content attribute (single- or double-quoted) on the meta line.
    const contentRe = /content\s*=\s*(["'])([^"']*)\1/;
    const match = original.match(contentRe);
    if (!match) {
      return this.humanFlag(violation, 'No content attribute on the recorded line');
    }

    const sanitized = sanitizeViewportContent(match[2]);
    if (sanitized === null) {
      return this.humanFlag(violation, 'Viewport content is already zoom-friendly');
    }

    const quote = match[1];
    const updated = original.replace(contentRe, `content=${quote}${sanitized}${quote}`);
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the fixed viewport meta');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed zoom-blocking directives from the viewport meta',
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
