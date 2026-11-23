import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { canonicalizeLangTag } from '../shared/lang-tag.js';

/**
 * Canonicalizes the first `lang`/`xml:lang` attribute value on `line` to a
 * well-formed BCP-47 tag, returning the rewritten line.
 *
 * axe `valid-lang` (WCAG 3.1.2) fires when an element other than `<html>` carries
 * a `lang`/`xml:lang` whose value isn't a valid language tag — `en_US`, `EN`,
 * `en-us`. A casing/separator slip is fixable by pure canonicalization; a value
 * that can't be canonicalized at all (a misspelled language *name* like
 * `english`) is content-dependent and left for a human (`null`).
 *
 * Returns `null` when the line has no `lang`/`xml:lang` attribute, the value is
 * already canonical, or it cannot be canonicalized.
 */
export function canonicalizeLangOnLine(line: string): string | null {
  const re = /\b(xml:lang|lang)\s*=\s*(["'])([^"']*)\2/i;
  const m = line.match(re);
  if (!m) return null;

  const canonical = canonicalizeLangTag(m[3]!);
  if (canonical === null || canonical === m[3]) return null;

  return line.replace(re, `${m[1]}=${m[2]}${canonical}${m[2]}`);
}

/**
 * Fixes axe `valid-lang` (WCAG 3.1.2) by canonicalizing an invalid `lang`/
 * `xml:lang` value on an inline element to its BCP-47 form on the recorded source
 * line. Deterministic, so it lives in the rule-based bucket alongside
 * {@link HtmlLangValidFixer} — which owns the `<html>` element's `lang`
 * (WCAG 3.1.1). Claims only the axe id; the jsx-a11y path stays with EslintFixer.
 */
export class ValidLangFixer implements Fixer {
  readonly wcagId = '3.1.2';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'valid-lang';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to fix the lang value');
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

    const updated = canonicalizeLangOnLine(original);
    if (updated === null) {
      return this.humanFlag(
        violation,
        'lang value is not a canonicalizable BCP-47 tag — set a valid language tag by hand',
      );
    }

    lines[idx] = updated;
    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the fixed lang value');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Canonicalized the element lang to a valid BCP-47 tag',
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
