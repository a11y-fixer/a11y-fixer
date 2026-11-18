import type { A11yViolation } from '@a11y-fixer/core';

export interface PrintViolationsOptions {
  /** Which console stream to write to. Defaults to stdout. */
  stream?: 'out' | 'err';
  /** Cap nodes printed per violation (e.g. `check` shows the first 2). */
  maxNodes?: number;
  /** When a violation has no located source, print its axe help URL instead. */
  showHelpUrl?: boolean;
}

/**
 * Renders violation lines shared by `scan` and `check`. Each violation prints
 * as `  WCAG <id> [<impact>] <description>` followed by one `    → file:line`
 * per located node; violations with no source fall back to their help URL when
 * `showHelpUrl` is set. Callers own their own summary header and exit behavior.
 */
export function printViolations(
  violations: A11yViolation[],
  opts: PrintViolationsOptions = {},
): void {
  const { stream = 'out', maxNodes, showHelpUrl = false } = opts;
  const write = stream === 'err' ? console.error : console.log;

  for (const v of violations) {
    write(`  WCAG ${v.wcagId} [${v.impact}] ${v.description}`);

    const nodes = maxNodes != null ? v.nodes.slice(0, maxNodes) : v.nodes;
    const located = nodes.filter(n => n.sourceFile);
    for (const node of located) {
      write(`    → ${node.sourceFile}:${node.sourceLine ?? '?'}`);
    }

    if (showHelpUrl && located.length === 0) {
      write(`    Help: ${v.helpUrl}`);
    }
  }
}
