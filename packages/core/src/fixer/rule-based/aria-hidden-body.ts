import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Removes an `aria-hidden` attribute from the `<body>` opening tag on a source
 * line, along with its leading whitespace, returning the rewritten line.
 *
 * Returns `null` when there is nothing deterministic to do: the line has no
 * `<body>` opening tag, or that tag carries no `aria-hidden` attribute.
 */
export function removeAriaHidden(line: string): string | null {
  const bodyMatch = line.match(/<body\b[^>]*>/i);
  if (!bodyMatch) return null;

  const tag = bodyMatch[0];
  // aria-hidden with an optional quoted value, plus any leading whitespace.
  const attrRe = /\s*\baria-hidden(\s*=\s*(["'])[^"']*\2)?/i;
  if (!attrRe.test(tag)) return null;

  const cleanedTag = tag.replace(attrRe, '');
  return line.replace(tag, cleanedTag);
}

/**
 * Fixes axe `aria-hidden-body` (WCAG 4.1.2) by removing the `aria-hidden`
 * attribute from the `<body>` element on the recorded source line. The rule
 * fires when `<body>` carries `aria-hidden="true"`, which hides the entire page
 * from assistive technology; stripping the attribute restores it. Deterministic,
 * so it lives in the rule-based bucket. Claims only the axe id; the jsx-a11y
 * path stays with EslintFixer.
 */
export class AriaHiddenBodyFixer implements Fixer {
  readonly wcagId = '4.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'aria-hidden-body';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map <body> back to a component; flag for a human.
      return this.humanFlag(violation, 'No source location to remove aria-hidden');
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

    const updated = removeAriaHidden(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'Recorded line has no <body> tag or no aria-hidden to remove',
      );
    }
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the fixed <body> tag');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Removed aria-hidden from <body> so assistive tech can see the page',
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
