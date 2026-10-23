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
