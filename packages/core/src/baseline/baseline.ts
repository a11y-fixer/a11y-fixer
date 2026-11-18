import fs from 'node:fs';
import type { A11yViolation } from '../detector/index.js';
import { fingerprintKey, fingerprintViolations } from './fingerprint.js';

/**
 * A recorded set of accepted violation occurrences. `entries` maps a
 * `${ruleId}::${nodeKey}` fingerprint to the number of occurrences accepted at
 * baseline time; `check` fails only when the current count exceeds it.
 */
export interface Baseline {
  version: 1;
  createdAt: string;
  entries: Record<string, number>;
}

/** Result of comparing a fresh scan to a baseline. */
export interface BaselineDiff {
  /** Violations carrying only the occurrences that exceed the baseline. */
  newViolations: A11yViolation[];
  /** Occurrences covered by the baseline (not reported as new). */
  baselinedCount: number;
  /** Baselined occurrences no longer present in the current scan. */
  resolvedCount: number;
}

/** Reads a baseline file; returns null when it does not exist. */
export function loadBaseline(file: string): Baseline | null {
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw) as Baseline;
}

/** Builds a baseline snapshot from the current scan. */
export function buildBaseline(violations: A11yViolation[], rootDir: string): Baseline {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    entries: Object.fromEntries(fingerprintViolations(violations, rootDir)),
  };
}

/** Writes a baseline to disk as pretty-printed JSON with a trailing newline. */
export function saveBaseline(file: string, baseline: Baseline): void {
  fs.writeFileSync(file, `${JSON.stringify(baseline, null, 2)}\n`);
}

/**
 * Compares a fresh scan to a baseline. For each fingerprint, the first
 * `baselined` occurrences are tolerated; any beyond that count are surfaced as
 * new. Violations are rebuilt carrying only their overflow nodes, and any that
 * end up empty are dropped.
 */
export function diffAgainstBaseline(
  violations: A11yViolation[],
  baseline: Baseline,
  rootDir: string,
): BaselineDiff {
  const remaining = new Map(Object.entries(baseline.entries));
  const newViolations: A11yViolation[] = [];
  let baselinedCount = 0;

  for (const v of violations) {
    const newNodes = [];
    for (const node of v.nodes) {
      const key = fingerprintKey(v.id, node, rootDir);
      const budget = remaining.get(key) ?? 0;
      if (budget > 0) {
        remaining.set(key, budget - 1);
        baselinedCount++;
      } else {
        newNodes.push(node);
      }
    }
    if (newNodes.length > 0) {
      newViolations.push({ ...v, nodes: newNodes });
    }
  }

  // Leftover budget = baselined occurrences the current scan no longer reports
  // (fully or partially resolved). Informational only.
  let resolvedCount = 0;
  for (const budget of remaining.values()) resolvedCount += budget;

  return { newViolations, baselinedCount, resolvedCount };
}
