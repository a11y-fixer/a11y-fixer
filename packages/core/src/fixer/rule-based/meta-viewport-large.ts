import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { sanitizeViewportContent } from './meta-viewport.js';

/**
 * Fixes axe `meta-viewport-large` (Deque best practice; closest WCAG criterion
 * 1.4.4) by stripping zoom-blocking directives from the `<meta name="viewport">`
 * `content` attribute so users can scale text up to 500%.
 *
 * The rule flags the exact same directives as axe `meta-viewport`
 * (`user-scalable=no`/`0`/`false` and `maximum-scale` < 5), so this fixer reuses
 * {@link sanitizeViewportContent} rather than duplicating the transform. It is a
 * separate class from {@link MetaViewportFixer} because the registry dispatches
 * on the axe id; it claims only `meta-viewport-large`.
 */
export class MetaViewportLargeFixer implements Fixer {
  readonly wcagId = '1.4.4';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'meta-viewport-large';
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
      return this.humanFlag(violation, 'Viewport content already allows large zoom');
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
