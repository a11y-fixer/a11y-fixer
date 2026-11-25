import type { A11yViolation } from '../detector/index.js';
import type { SourceLocation } from '../mapper/index.js';

export type FixerBucket = 'rule-based' | 'ai-assisted' | 'human-flagged';

export interface FixResult {
  wcagId: string;
  bucket: FixerBucket;
  applied: boolean;
  description: string;
  before: string;
  after?: string;
  sourceLocation?: SourceLocation;
  humanNote?: string;
}

export interface Fixer {
  readonly wcagId: string;
  readonly bucket: FixerBucket;
  /**
   * When `true`, {@link FixerRegistry.applyAll} invokes {@link Fixer.fix} once
   * per node in a violation (each call sees a single-node copy), so every
   * occurrence is fixed — not just `nodes[0]`. Opt-in because it is only safe
   * for fixers whose fix is an independent per-element edit (e.g. inserting an
   * `aria-label` on one element). Fixers that act at file or document scope, or
   * that need the whole node set at once (ESLint `--fix` over a file, heading
   * order, a single `<title>`), must leave this unset/`false` and handle all
   * nodes within one `fix()` call.
   */
  readonly perNode?: boolean;
  canFix(violation: A11yViolation): boolean;
  fix(violation: A11yViolation): Promise<FixResult>;
}

/** Repo-absolute source files touched by applied fixes, de-duplicated. */
export function dedupeFixFiles(fixes: FixResult[]): string[] {
  const set = new Set<string>();
  for (const f of fixes) {
    if (f.applied && f.sourceLocation) set.add(f.sourceLocation.file);
  }
  return [...set];
}
