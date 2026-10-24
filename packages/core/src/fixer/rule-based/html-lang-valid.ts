import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Canonicalizes a `<html>` `lang` value to a well-formed BCP-47 tag, or returns
 * `null` when it cannot do so deterministically.
 *
 * axe `html-lang-valid` (WCAG 3.1.1) fails when the `lang` attribute is present
 * but malformed or non-canonical — `en_US`, `EN`, `en-us`. Those are fixable by
 * pure string canonicalization: underscores become hyphens and casing is
 * normalized via the built-in {@link Intl.getCanonicalLocales}, which throws a
 * `RangeError` on structurally invalid input (`english`, `xx_yy_zz`).
 *
 * Returns the canonical tag only when it differs from the original (so an
 * already-canonical value is a no-op, `null`). Returns `null` for empty input or
 * anything `Intl` rejects, leaving those for a human — the value may be
 * content-dependent (e.g. a misspelled language name) rather than a casing slip.
 */
export function normalizeLangTag(value: string): string | null {
  const tag = value.trim().replace(/_/g, '-');
  if (tag.length === 0) return null;

  let canonical: string;
  try {
    [canonical] = Intl.getCanonicalLocales(tag);
  } catch {
    return null;
  }

  if (!canonical || canonical === value) return null;
  return canonical;
}

/**
 * Fixes axe `html-lang-valid` (WCAG 3.1.1) by rewriting an invalid `<html lang>`
 * value to its canonical BCP-47 form on the recorded source line. Deterministic,
 * so it lives in the rule-based bucket alongside {@link HtmlLangFixer} — which
 * handles the *missing* `lang` case and explicitly defers invalid values to this
 * fixer. Claims only the axe id; the jsx-a11y path stays with EslintFixer.
 */
export class HtmlLangValidFixer implements Fixer {
  readonly wcagId = '3.1.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'html-lang-valid';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map <html> back to a component; flag for a human.
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

    // Match an <html ...> element and pull its lang="..."/lang='...' attribute.
    const htmlMatch = original.match(/<html\b[^>]*>/i);
    const langMatch = htmlMatch?.[0].match(/\blang\s*=\s*(["'])([^"']*)\1/i);
    if (!htmlMatch || !langMatch) {
      return this.humanFlag(violation, 'No <html lang> attribute on the recorded line');
    }

    const canonical = normalizeLangTag(langMatch[2]);
    if (canonical === null) {
      return this.humanFlag(violation, 'lang value is not a canonicalizable BCP-47 tag');
    }

    const quote = langMatch[1];
    const updated = original.replace(
      langMatch[0],
      `lang=${quote}${canonical}${quote}`,
    );
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
      description: `Canonicalized lang to "${canonical}"`,
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
