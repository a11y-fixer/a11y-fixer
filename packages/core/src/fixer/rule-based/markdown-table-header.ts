import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { rewriteLine } from '../markdown-source.js';

/**
 * Fixes `md-table-header` violations (WCAG 1.3.1): a GFM table whose header row
 * has one or more empty cells, leaving data columns without an accessible name.
 * The deterministic remediation (no AI) fills each blank header cell with a
 * generic `Column N` label so every column is announced. The data and delimiter
 * rows are untouched; only the single header line is rewritten.
 */
export class MarkdownTableHeaderFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'md-table-header';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node?.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to fill table headers');
    }

    let before = '';
    const after = await rewriteLine(node.sourceFile, node.sourceLine, (raw) => {
      const cells = splitRow(raw);
      if (cells === null || cells.length < 1) return null;
      if (!cells.some((c) => c.trim() === '')) return null; // nothing blank to fill
      before = raw;
      const filled = cells.map((c, i) => (c.trim() === '' ? `Column ${i + 1}` : c.trim()));
      return `| ${filled.join(' | ')} |`;
    });
    if (after === null) {
      return this.humanFlag(violation, 'Could not parse the table header row — manual review needed');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: 'Filled empty Markdown table header cell(s) with generic column labels',
      before,
      after,
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

/**
 * Splits a GFM table row into its cells, dropping the optional leading/trailing
 * pipe. Honors escaped pipes (`\|`) inside a cell. Returns null if the line has
 * no pipe at all (not a table row).
 */
function splitRow(raw: string): string[] | null {
  const trimmed = raw.trim();
  if (!trimmed.includes('|')) return null;
  const cells: string[] = [];
  let cur = '';
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === '\\' && trimmed[i + 1] === '|') {
      cur += '\\|';
      i++;
      continue;
    }
    if (ch === '|') {
      cells.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  // Drop the empties created by a leading/trailing pipe.
  if (cells.length && cells[0].trim() === '') cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
  return cells;
}
