import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Decides whether a `<meta http-equiv="refresh">` `content` value is a *pure
 * timed refresh* — a delay with no `url=` directive — which is the only case we
 * can safely auto-fix by deleting the tag.
 *
 * axe `meta-refresh` (WCAG 2.2.1) fails whenever a timed refresh is present.
 * `content="30"` reloads the page after 30s; removing the tag just stops that.
 * But `content="0; url=/next"` is a redirect, and deleting it would change where
 * the page navigates — so that is left for a human (returns `false`).
 *
 * Returns `true` only when the first directive parses as a finite, non-negative
 * number and no later directive is a `url`.
 */
export function isPureTimedRefresh(content: string): boolean {
  const directives = content.split(';').map(d => d.trim()).filter(d => d.length > 0);
  if (directives.length === 0) return false;

  const delay = Number.parseFloat(directives[0]);
  if (!Number.isFinite(delay) || delay < 0) return false;

  return !directives.slice(1).some(directive => {
    const eq = directive.indexOf('=');
    const key = (eq === -1 ? directive : directive.slice(0, eq)).trim().toLowerCase();
    return key === 'url';
  });
}

/**
 * Fixes axe `meta-refresh` (WCAG 2.2.1) by removing a time-based
 * `<meta http-equiv="refresh">` from its source line. Deterministic, so it
 * lives in the rule-based bucket alongside {@link MetaViewportFixer}.
 *
 * Only pure timed refreshes are removed; a refresh carrying a `url=` redirect is
 * human-flagged because deleting it would change navigation. Claims only the axe
 * id; a jsx-a11y equivalent, if any, stays with EslintFixer.
 */
export class MetaRefreshFixer implements Fixer {
  readonly wcagId = '2.2.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'meta-refresh';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map <meta> back to a component; flag for a human.
      return this.humanFlag(violation, 'No source location to fix the meta refresh');
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

    // Match a <meta ...> element and confirm it carries http-equiv="refresh".
    const metaRe = /<meta\b[^>]*>/i;
    const metaMatch = original.match(metaRe);
    if (
      !metaMatch ||
      !/http-equiv\s*=\s*(["'])refresh\1/i.test(metaMatch[0])
    ) {
      return this.humanFlag(violation, 'No meta refresh on the recorded line');
    }

    const contentMatch = metaMatch[0].match(/content\s*=\s*(["'])([^"']*)\1/i);
    if (!contentMatch) {
      return this.humanFlag(violation, 'No content attribute on the meta refresh');
    }

    if (!isPureTimedRefresh(contentMatch[2])) {
      return this.humanFlag(violation, 'Meta refresh carries a url= redirect; needs a human');
    }

    const updated = original.replace(metaRe, '');
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the fixed meta refresh');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed time-based meta refresh',
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
