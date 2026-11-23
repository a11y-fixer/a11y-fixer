import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { readAttr } from '../shared/attrs.js';
import { editRecordedLine } from '../shared/line-edit.js';

const VALID_SCOPES = new Set(['row', 'col', 'rowgroup', 'colgroup']);

/** Maps common invalid `scope` spellings to the valid HTML token, else null. */
const SCOPE_ALIASES: ReadonlyArray<readonly [RegExp, string]> = [
  [/^columns?$/, 'col'],
  [/^rows$/, 'row'],
  [/^column-?group$/, 'colgroup'],
  [/^row-?group$/, 'rowgroup'],
];

/** Normalizes an invalid `scope` value to a valid HTML token, or `null`. */
export function normalizeScope(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (v.length === 0 || VALID_SCOPES.has(v)) return null;
  for (const [re, token] of SCOPE_ALIASES) {
    if (re.test(v)) return token;
  }
  return null;
}

/**
 * Rewrites an invalid `scope` attribute value on `line` to a valid HTML token,
 * returning the rewritten line (or `null` when there's no `scope` attribute or
 * the value can't be mapped to a valid token).
 */
export function fixScopeOnLine(line: string): string | null {
  const current = readAttr(line, 'scope');
  if (current === null) return null;
  const normalized = normalizeScope(current);
  if (normalized === null) return null;
  return line.replace(
    /(\bscope\s*=\s*)(["'])[\s\S]*?\2/i,
    `$1$2${normalized}$2`,
  );
}

/**
 * Fixes axe `scope-attr-valid` (WCAG 1.3.1) by correcting an invalid `scope`
 * value on a `<th>`/`<td>` to a valid HTML token (`row`, `col`, `rowgroup`,
 * `colgroup`) on the recorded source line. Only unambiguous spelling/casing slips
 * are auto-corrected; a value that doesn't map to a known token is human-flagged.
 * Claims only the axe id.
 */
export class ScopeAttrValidFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'scope-attr-valid';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    const result = await editRecordedLine(
      node,
      fixScopeOnLine,
      'Could not map the scope value to a valid token (row/col/rowgroup/colgroup)',
    );
    if (result.status === 'flag') return this.humanFlag(violation, result.note);

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Corrected the scope attribute to a valid HTML token',
      before: node.html,
      after: result.updated.trim(),
      sourceLocation: { file: node.sourceFile!, line: node.sourceLine!, column: node.sourceColumn ?? 1 },
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
