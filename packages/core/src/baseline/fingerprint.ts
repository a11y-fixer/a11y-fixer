import path from 'node:path';
import type { A11yViolation, A11yNode } from '../detector/index.js';

/**
 * Stable identity for a single violation occurrence (node), independent of
 * line/column so the key survives ordinary edits that shift code around.
 *
 * Prefers the source file (made relative to `rootDir` for portability across
 * machines/CI checkouts). Falls back to the axe DOM target, then the raw html
 * snippet, for occurrences that were never mapped back to source.
 */
export function nodeKey(node: A11yNode, rootDir: string): string {
  if (node.sourceFile) {
    return path.relative(rootDir, node.sourceFile);
  }
  if (node.target.length > 0) {
    return node.target.join('>');
  }
  return node.html;
}

/** Combines a rule id with a node key into a single fingerprint. */
export function fingerprintKey(ruleId: string, node: A11yNode, rootDir: string): string {
  return `${ruleId}::${nodeKey(node, rootDir)}`;
}

/**
 * Counts violation occurrences per fingerprint. A fingerprint collapses all
 * occurrences of the same rule in the same file (or target), so the count is
 * what distinguishes "same as before" from "one more than before".
 */
export function fingerprintViolations(
  violations: A11yViolation[],
  rootDir: string,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of violations) {
    for (const node of v.nodes) {
      const key = fingerprintKey(v.id, node, rootDir);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}
