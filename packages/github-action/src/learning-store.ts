import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { FixResult } from '@a11y-fixer/core';
import {
  fixId,
  extractValue,
  extractAnchor,
  dedupeExamples,
  type ExampleBucket,
  type ExamplesByBucket,
  type Generation,
} from '@a11y-fixer/ai';

/**
 * The local, committed learning loop.
 *
 * Every AI fix that survives the re-scan gate is recorded here as `proposed`.
 * On a later run we reconcile each prior record against the repo's current
 * state: a value that persisted was accepted (`merged`); a value a human changed
 * is a `corrected` signal (the richest one); a value that was removed is
 * `rejected`. Accepted values become few-shot examples that steer future
 * generations toward this codebase's house style.
 *
 * Everything lives in the user's own repo — no telemetry, no phone-home —
 * preserving the product's "sends nowhere but Anthropic and your repo" promise.
 */

export type LearningStatus = 'proposed' | 'merged' | 'corrected' | 'rejected';

export interface LearningRecord {
  /** Stable, line-independent fix id (see fixId). */
  id: string;
  bucket: ExampleBucket;
  wcagId: string;
  /** Repo-relative source file of the fix. */
  sourceFile: string;
  /** A stable locator (img src / link href) to relocate the element, or null. */
  anchor: string | null;
  /** Pre-fix markup, used to relocate the element when there's no anchor. */
  before: string;
  /** The value we generated and applied. */
  proposed: string;
  status: LearningStatus;
  /** The value ultimately accepted (merged → proposed, corrected → the human's). */
  accepted: string | null;
  firstSeen: string;
  resolvedAt: string | null;
}

export const DEFAULT_STORE_PATH = '.a11y-fixer/learning.jsonl';

/** Reads the JSONL store. Missing or corrupt lines are skipped, never fatal. */
export async function readStore(file: string): Promise<LearningRecord[]> {
  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch {
    return [];
  }
  const out: LearningRecord[] = [];
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as LearningRecord);
    } catch {
      // Skip a corrupt line rather than losing the whole store.
    }
  }
  return out;
}

/** Writes the store atomically-ish as JSONL (one record per line). */
export async function writeStore(file: string, records: LearningRecord[]): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  const body = records.map((r) => JSON.stringify(r)).join('\n');
  await writeFile(file, body ? body + '\n' : '', 'utf8');
}

/**
 * Turns the fixes that survived the re-scan gate into new `proposed` records by
 * correlating each AI fix with the generation that produced its value (the value
 * appears in the fix's resulting markup). Fixers never have to know about this.
 *
 * Returns the records to append (new ids only — a re-run of the same fix is not
 * duplicated).
 */
export function recordProposals(
  existing: LearningRecord[],
  verifiedFixes: FixResult[],
  generations: Generation[],
  now: () => string = () => new Date().toISOString(),
): LearningRecord[] {
  const known = new Set(existing.map((r) => r.id));
  const pool = generations.slice();
  const additions: LearningRecord[] = [];

  for (const fix of verifiedFixes) {
    if (fix.bucket !== 'ai-assisted' || !fix.applied) continue;
    const file = fix.sourceLocation?.file;
    const after = fix.after;
    if (!file || !after) continue;

    // Find the generation whose value this fix carries; claim it so two fixes
    // can't attribute to the same generation.
    const idx = pool.findIndex((g) => after.includes(g.value) || fix.description.includes(g.value));
    if (idx === -1) continue;
    const gen = pool.splice(idx, 1)[0]!;

    const id = fixId({ wcagId: fix.wcagId, sourceFile: file, before: fix.before });
    if (known.has(id)) continue;
    known.add(id);

    additions.push({
      id,
      bucket: gen.bucket,
      wcagId: fix.wcagId,
      sourceFile: file,
      anchor: extractAnchor(gen.bucket, fix.before) ?? extractAnchor(gen.bucket, after),
      before: fix.before,
      proposed: gen.value,
      status: 'proposed',
      accepted: null,
      firstSeen: now(),
      resolvedAt: null,
    });
  }
  return additions;
}

/** Reads a repo-relative source file, or null if it can't be read. */
export type FileReader = (relPath: string) => Promise<string | null>;

export function makeFileReader(repoRoot: string): FileReader {
  return async (relPath) => {
    try {
      return await readFile(path.resolve(repoRoot, relPath), 'utf8');
    } catch {
      return null;
    }
  };
}

/**
 * Reconciles still-`proposed` records against current repo state. Mutates and
 * returns the record list.
 *
 * - value still present  → `merged`   (accepted as-is)
 * - element found, value changed → `corrected` (capture the human's value)
 * - element found, value removed  → `rejected`
 * - element not found at all → left `proposed` (e.g. the PR is still open)
 */
export async function reconcile(
  records: LearningRecord[],
  readSource: FileReader,
  now: () => string = () => new Date().toISOString(),
): Promise<LearningRecord[]> {
  for (const r of records) {
    if (r.status !== 'proposed') continue;
    const content = await readSource(r.sourceFile);
    if (content == null) continue; // file unreadable: keep pending, don't lose it

    if (content.includes(r.proposed)) {
      r.status = 'merged';
      r.accepted = r.proposed;
      r.resolvedAt = now();
      continue;
    }

    const line = relocate(content, r);
    if (line == null) continue; // can't find it: stay pending (PR may be open)

    const current = extractValue(r.bucket, line);
    if (current && current !== r.proposed) {
      r.status = 'corrected';
      r.accepted = current;
    } else {
      r.status = 'rejected';
      r.accepted = null;
    }
    r.resolvedAt = now();
  }
  return records;
}

/** Finds the current line for a record's element via its anchor, else its markup. */
function relocate(content: string, r: LearningRecord): string | null {
  const lines = content.split('\n');
  if (r.anchor) {
    const hit = lines.find((l) => l.includes(r.anchor!));
    if (hit) return hit;
  }
  // No anchor (e.g. an icon button): relocate on the pre-fix markup *up to* the
  // value, so a line whose value changed still matches on its stable prefix.
  const at = r.before.indexOf(r.proposed);
  const prefix = (at >= 0 ? r.before.slice(0, at) : r.before).trim();
  if (prefix.length >= 8) {
    const hit = lines.find((l) => l.includes(prefix));
    if (hit) return hit;
  }
  return null;
}

/** Collects accepted values (merged + corrected), most-recent first, per bucket. */
export function loadExamples(records: LearningRecord[], perBucket = 5): ExamplesByBucket {
  const byBucket: Record<string, string[]> = {};
  // Most-recent first: corrections and fresh acceptances should win.
  for (const r of [...records].reverse()) {
    if ((r.status !== 'merged' && r.status !== 'corrected') || !r.accepted) continue;
    (byBucket[r.bucket] ??= []).push(r.accepted);
  }
  const out: ExamplesByBucket = {};
  for (const [bucket, values] of Object.entries(byBucket)) {
    out[bucket as ExampleBucket] = dedupeExamples(values).slice(0, perBucket);
  }
  return out;
}
