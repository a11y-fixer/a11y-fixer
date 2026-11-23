import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';

/**
 * Maps field-identity keywords to the valid WCAG 1.3.5 (HTML) autocomplete token.
 * Ordered most-specific first so e.g. "first name" wins over the generic "name".
 */
const FIELD_TOKENS: ReadonlyArray<readonly [RegExp, string]> = [
  [/new.?password/i, 'new-password'],
  [/current.?password/i, 'current-password'],
  [/password|passwd|pwd/i, 'current-password'],
  [/first.?name|given.?name|fname|forename/i, 'given-name'],
  [/last.?name|family.?name|surname|lname/i, 'family-name'],
  [/full.?name|your.?name|\bfullname\b|\bname\b/i, 'name'],
  [/e.?mail/i, 'email'],
  [/phone|mobile|\btel\b|telephone/i, 'tel'],
  [/user.?name|\blogin\b|\buserid\b/i, 'username'],
  [/street|address.?line.?1|\baddr\b|address1/i, 'street-address'],
  [/city|town|locality|address.?level.?2/i, 'address-level2'],
  [/state|province|region|address.?level.?1/i, 'address-level1'],
  [/zip|postal|postcode/i, 'postal-code'],
  [/country/i, 'country-name'],
  [/organization|company|employer/i, 'organization'],
  [/card.?number|cc.?number|credit.?card/i, 'cc-number'],
  [/birth|\bdob\b|bday/i, 'bday'],
];

/** Reads the first quoted value of `attr` from a tag's markup, else null. */
function attr(html: string, name: string): string | null {
  const m = html.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return m ? m[2]! : null;
}

/**
 * Chooses a valid autocomplete token for the field from its `name`/`id`/
 * `placeholder`/`type`/`aria-label` and the invalid value, or `null` when nothing
 * matches confidently (caller human-flags rather than guessing).
 */
export function suggestAutocompleteToken(html: string, invalidValue: string): string | null {
  const haystack = [
    invalidValue,
    attr(html, 'name'),
    attr(html, 'id'),
    attr(html, 'placeholder'),
    attr(html, 'aria-label'),
  ]
    .filter((s): s is string => Boolean(s))
    .join(' ');
  for (const [re, token] of FIELD_TOKENS) {
    if (re.test(haystack)) return token;
  }
  const type = attr(html, 'type')?.toLowerCase();
  if (type === 'email') return 'email';
  if (type === 'tel') return 'tel';
  return null;
}

/** Replaces the `autocomplete` attribute value on `line`, or null if it isn't inline. */
export function replaceAutocompleteOnLine(line: string, token: string): string | null {
  const re = /(\bautocomplete\s*=\s*)(["'])[\s\S]*?\2/i;
  if (!re.test(line)) return null;
  return line.replace(re, `$1$2${token}$2`);
}

/**
 * Fixes axe `autocomplete-valid` (WCAG 1.3.5) by replacing an invalid
 * `autocomplete` token with the correct one inferred deterministically from the
 * field's identity (name/id/placeholder/type). The correction is rule-based, so
 * applied fixes report the `rule-based` bucket; a field whose purpose can't be
 * inferred, or whose `autocomplete` isn't inline on the source line, is
 * human-flagged.
 */
export class AutocompleteValidFixer implements Fixer {
  readonly wcagId = '1.3.5';
  readonly bucket = 'rule-based' as const;

  constructor(
    private readonly aiProvider: AIProvider,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'autocomplete-valid';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to fix the autocomplete token');
    }

    const current = attr(node.html, 'autocomplete') ?? '';
    const token = suggestAutocompleteToken(node.html, current);
    if (token === null) {
      return this.humanFlag(violation, 'Could not infer the field purpose to set a valid autocomplete token');
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

    const updated = replaceAutocompleteOnLine(original, token);
    if (updated === null) {
      return this.humanFlag(violation, `Suggested autocomplete="${token}" — attribute not found inline on the source line`);
    }

    lines[idx] = updated;
    try {
      await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
    } catch {
      return this.humanFlag(violation, `Suggested autocomplete="${token}" — could not write the file`);
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Corrected autocomplete token${current ? ` "${current}"` : ''} → "${token}"`,
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
