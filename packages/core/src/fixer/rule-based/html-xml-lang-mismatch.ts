import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

/**
 * Primary (first) subtag of a BCP-47 tag, lower-cased; `''` for empty input.
 *
 * axe `html-xml-lang-mismatch` compares only the *primary* language subtag of
 * `lang` and `xml:lang` (so `en-US` and `en-GB` agree), which is what this
 * extracts.
 */
export function primarySubtag(tag: string): string {
  return tag.trim().split('-')[0]?.toLowerCase() ?? '';
}

/**
 * Fixes axe `html-xml-lang-mismatch` (WCAG 3.1.1) by rewriting the `<html>`
 * element's `xml:lang` value to match its `lang` value on the recorded source
 * line. The rule fires when both attributes are present but their primary
 * language subtags differ; `lang` is authoritative for HTML user agents, so we
 * align `xml:lang` to it. Deterministic, so it lives in the rule-based bucket
 * alongside {@link HtmlLangFixer} (missing lang) and {@link HtmlLangValidFixer}
 * (malformed lang). Claims only the axe id; the jsx-a11y path stays with
 * EslintFixer.
 */
export class HtmlXmlLangMismatchFixer implements Fixer {
  readonly wcagId = '3.1.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'html-xml-lang-mismatch';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL scans often can't map <html> back to a component; flag for a human.
      return this.humanFlag(violation, 'No source location to fix the xml:lang value');
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

    // Match an <html ...> element and pull its lang and xml:lang attributes.
    // The xml:lang regex is checked before lang so the \blang pattern below —
    // which also matches the `lang` inside `xml:lang` — is read off a tag we've
    // already confirmed carries both attributes.
    const htmlMatch = original.match(/<html\b[^>]*>/i);
    const xmlLangMatch = htmlMatch?.[0].match(/\bxml:lang\s*=\s*(["'])([^"']*)\1/i);
    const langMatch = htmlMatch?.[0].match(/(?<!xml:)\blang\s*=\s*(["'])([^"']*)\1/i);
    if (!htmlMatch || !langMatch || !xmlLangMatch) {
      return this.humanFlag(violation, 'No <html lang>/<html xml:lang> pair on the recorded line');
    }

    const lang = langMatch[2];
    const xmlLang = xmlLangMatch[2];
    if (primarySubtag(lang) === '') {
      return this.humanFlag(violation, 'lang value is empty; cannot align xml:lang');
    }
    if (primarySubtag(lang) === primarySubtag(xmlLang)) {
      return this.humanFlag(violation, 'lang and xml:lang already agree');
    }

    const quote = xmlLangMatch[1];
    const updated = original.replace(
      xmlLangMatch[0],
      `xml:lang=${quote}${lang}${quote}`,
    );
    lines[idx] = updated;

    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the fixed xml:lang value');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Aligned xml:lang to lang ("${lang}")`,
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
