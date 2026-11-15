import { readFile as fsReadFile, writeFile as fsWriteFile } from 'node:fs/promises';
import type { A11yViolation, FixResult } from '@a11y-fixer/core';

/**
 * Post-fix verification gate.
 *
 * Fix mode re-scans after applying fixes, but the re-scan is only meaningful if
 * something acts on it. This module turns that re-scan into a gate: it confirms
 * each changed file's violations actually went down (no "cover-up" — a fix marked
 * applied whose violation is still present) and that no fix introduced a NEW
 * violation (a regression). Any file that fails is restored to its pre-fix
 * contents and its fixes are demoted, so a PR never contains an unverified fix
 * or a regression.
 *
 * Matching is done on per-`(ruleId, file)` violation COUNTS rather than exact
 * line/column identity. Two reasons: `wcagId` is not unique within a file (axe
 * `link-name` and JSX `anchor-has-content` both map to WCAG 2.4.4), and exact
 * lines shift once an edit adds or removes characters. Counts per rule-and-file
 * are stable under both.
 *
 * Restore is file-level (blunt but safe): if one edit in a file fails, the whole
 * file is reverted, which can discard a good sibling fix sharing that file.
 * Surgical per-edit undo would need `@a11y-fixer/core` to expose it; that is
 * future work.
 */

const SEP = '\u0000';

export interface FileVerdict {
  file: string;
  /** A fix introduced a new violation (new rule id, or a higher count). */
  regressed: boolean;
  /** Total violations in this file strictly decreased. */
  improved: boolean;
  beforeCount: number;
  afterCount: number;
  /** Rule ids present in `after` for this file that were absent in `before`. */
  newRuleIds: string[];
}

export interface VerificationReport {
  /** Applied fixes in files that passed verification — safe to PR. */
  verifiedFixes: FixResult[];
  /** Files restored to their pre-fix contents. */
  revertedFiles: string[];
  /** Applied fixes demoted because their file was reverted. */
  revertedFixes: FixResult[];
  /** Files where a fix introduced a new violation. */
  regressions: FileVerdict[];
  /** Files whose violations did not net-decrease (a cover-up / no-op fix). */
  unclearedFiles: string[];
  /** Scan result after any restores (equals the input `after` if none). */
  finalAfter: A11yViolation[];
}

/** The repo-absolute source file of a violation's primary node, or '' if none. */
function violationFile(v: A11yViolation): string {
  return v.nodes?.[0]?.sourceFile ?? '';
}

/** Count violations keyed by `${ruleId}${SEP}${sourceFile}`. */
function countByRuleFile(violations: A11yViolation[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const v of violations) {
    const key = `${v.id}${SEP}${violationFile(v)}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** Project a (ruleId,file) count map down to per-ruleId counts for one file. */
function ruleCountsForFile(counts: Map<string, number>, file: string): Map<string, number> {
  const out = new Map<string, number>();
  for (const [key, n] of counts) {
    const sep = key.indexOf(SEP);
    const id = key.slice(0, sep);
    const f = key.slice(sep + 1);
    if (f === file) out.set(id, n);
  }
  return out;
}

function sumCounts(counts: Map<string, number>): number {
  let total = 0;
  for (const n of counts.values()) total += n;
  return total;
}

function verdictForFile(
  file: string,
  beforeCounts: Map<string, number>,
  afterCounts: Map<string, number>,
): FileVerdict {
  const before = ruleCountsForFile(beforeCounts, file);
  const after = ruleCountsForFile(afterCounts, file);
  const beforeCount = sumCounts(before);
  const afterCount = sumCounts(after);

  const newRuleIds: string[] = [];
  let regressed = false;
  for (const [id, n] of after) {
    const prev = before.get(id) ?? 0;
    if (n > prev) {
      regressed = true;
      if (prev === 0) newRuleIds.push(id);
    }
  }

  return {
    file,
    regressed,
    improved: afterCount < beforeCount,
    beforeCount,
    afterCount,
    newRuleIds,
  };
}

export interface VerifyFixesOptions {
  /** Violations from the pre-fix scan. */
  before: A11yViolation[];
  /** Violations from the post-fix scan. */
  after: A11yViolation[];
  /** Fixes returned by `registry.applyAll(before)`. */
  fixes: FixResult[];
  /** Files actually edited (from `dedupeFixFiles(fixes)`). */
  changedFiles: string[];
  /** Pre-fix contents of candidate files, keyed by absolute path (see snapshotFiles). */
  snapshot: Map<string, string>;
  /** Re-run the scanner; called once only if at least one file is restored. */
  rescan: () => Promise<A11yViolation[]>;
  /** Overridable file writer (defaults to fs.writeFile), for testing. */
  restore?: (file: string, content: string) => Promise<void>;
}

async function defaultRestore(file: string, content: string): Promise<void> {
  await fsWriteFile(file, content, 'utf8');
}

/**
 * Verify applied fixes against the post-fix scan, restoring any file that
 * regressed or whose violations did not net-decrease.
 */
export async function verifyFixes(opts: VerifyFixesOptions): Promise<VerificationReport> {
  const { before, after, fixes, changedFiles, snapshot, rescan } = opts;
  const restore = opts.restore ?? defaultRestore;

  const beforeCounts = countByRuleFile(before);
  const afterCounts = countByRuleFile(after);

  const verdicts = changedFiles.map(f => verdictForFile(f, beforeCounts, afterCounts));
  const failing = verdicts.filter(v => v.regressed || !v.improved);
  const regressions = verdicts.filter(v => v.regressed);
  const unclearedFiles = failing.filter(v => !v.regressed).map(v => v.file);

  const revertedFiles: string[] = [];
  for (const v of failing) {
    const original = snapshot.get(v.file);
    // Only revert what we can restore. A file we never snapshotted (no readable
    // pre-fix content) is left as-is rather than corrupted.
    if (original === undefined) continue;
    await restore(v.file, original);
    revertedFiles.push(v.file);
  }

  const finalAfter = revertedFiles.length > 0 ? await rescan() : after;

  const reverted = new Set(revertedFiles);
  const appliedFixes = fixes.filter(f => f.applied);
  const inRevertedFile = (f: FixResult): boolean =>
    f.sourceLocation !== undefined && reverted.has(f.sourceLocation.file);

  return {
    verifiedFixes: appliedFixes.filter(f => !inRevertedFile(f)),
    revertedFixes: appliedFixes.filter(inRevertedFile),
    revertedFiles,
    regressions,
    unclearedFiles,
    finalAfter,
  };
}

/**
 * Snapshot the pre-fix contents of every candidate source file — the unique set
 * of `nodes[0].sourceFile` across the pre-fix violations — so a failed file can
 * be restored to exactly its pre-fix state (even when uncommitted). Call this
 * BEFORE `registry.applyAll`. Unreadable candidates are skipped.
 */
export async function snapshotFiles(
  before: A11yViolation[],
  read: (file: string) => Promise<string> = (f) => fsReadFile(f, 'utf8'),
): Promise<Map<string, string>> {
  const files = new Set<string>();
  for (const v of before) {
    const f = v.nodes?.[0]?.sourceFile;
    if (f) files.add(f);
  }
  const snapshot = new Map<string, string>();
  for (const f of files) {
    try {
      snapshot.set(f, await read(f));
    } catch {
      // Candidate file can't be read — simply not auto-revertible.
    }
  }
  return snapshot;
}
