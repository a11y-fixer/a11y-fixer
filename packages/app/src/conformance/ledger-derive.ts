// Turn a deterministic scan into conformance claim drafts.
//
// Claims are emitted at (page path, criterion) granularity:
//   - one `fail` per criterion that has >=1 violation on a file (the individual
//     component locations ride inside the evidence blob, so the chain stays at
//     page+criterion while detail is preserved);
//   - a `pass` for a pass-eligible M-criterion on a file the scan demonstrably
//     looked at (it produced some located violation) and did NOT flag for that
//     criterion — but only when the report is complete (not truncated) and the
//     engine/path are known. Otherwise the criterion stays not-evaluated (no
//     claim), never a silent pass.
// See docs/conformance/phase-1-ledger-plan.md.
import { pageSubjectKey } from './claim.js';
import type { ClaimDraft } from './ledger.js';
import { levelOf } from './wcag-matrix.js';
import { passEligibleCriteria, type ScanPath } from './evaluated-set.js';

/** One violation, flattened to a single source location (path/line may be null). */
export interface DerivableViolation {
  ruleId: string;
  wcagId: string;
  impact: string;
  path: string | null;
  line: number | null;
}

export interface DerivableScan {
  repoId: number;
  headSha: string;
  /** RFC3339 UTC; the scan's completion time (not wall-clock), for idempotency. */
  assertedAt: string;
  /** True when the Action truncated the violation list — blocks all pass claims. */
  truncated: boolean;
  /** Contract v2 fields; null on a v1 (fail-only) contract. */
  engine: string | null;
  engineVersion: string | null;
  scanPath: ScanPath | null;
  violations: DerivableViolation[];
}

const UNLOCATED = '(no source location)';

export function deriveClaims(scan: DerivableScan): ClaimDraft[] {
  const { repoId, headSha, assertedAt, truncated, engine, engineVersion, scanPath } = scan;
  const assertedBy = engine && engineVersion ? `scanner@${engine}/${engineVersion}` : 'scanner';

  // Group located violations by path, then criterion. Track which real files the
  // scan proved it looked at (for pass inference).
  const byPath = new Map<string, Map<string, DerivableViolation[]>>();
  const locatedPaths = new Set<string>();

  for (const v of scan.violations) {
    if (!levelOf(v.wcagId)) continue; // unknown/non-2.2 criterion: can't type a claim
    const path = v.path ?? UNLOCATED;
    if (v.path) locatedPaths.add(v.path);
    const crits = byPath.get(path) ?? new Map<string, DerivableViolation[]>();
    const list = crits.get(v.wcagId) ?? [];
    list.push(v);
    crits.set(v.wcagId, list);
    byPath.set(path, crits);
  }

  const drafts: ClaimDraft[] = [];

  // Fail claims: one per (path, criterion) with violations.
  for (const [path, crits] of byPath) {
    for (const [criterion, vs] of crits) {
      const level = levelOf(criterion)!;
      drafts.push({
        body: {
          subjectKind: 'page',
          subjectKey: pageSubjectKey(repoId, path),
          criterion,
          wcagVersion: '2.2',
          level,
          state: 'fail',
          method: 'deterministic',
          confidence: 1,
          assertedBy,
          assertedAt,
        },
        evidence: {
          type: 'scan-output',
          producerVersion: assertedBy,
          blob: {
            headSha,
            engine,
            scanPath,
            items: vs.map(v => ({ ruleId: v.ruleId, impact: v.impact, line: v.line })),
          },
        },
      });
    }
  }

  // Pass claims: only on a complete scan with a known engine/path.
  if (!truncated && engine && engineVersion && scanPath) {
    const eligible = passEligibleCriteria(scanPath);
    for (const path of locatedPaths) {
      const failedHere = new Set(byPath.get(path)?.keys() ?? []);
      for (const criterion of eligible) {
        if (failedHere.has(criterion)) continue;
        drafts.push({
          body: {
            subjectKind: 'page',
            subjectKey: pageSubjectKey(repoId, path),
            criterion,
            wcagVersion: '2.2',
            level: levelOf(criterion)!,
            state: 'pass',
            method: 'deterministic',
            confidence: 1,
            assertedBy,
            assertedAt,
          },
          evidence: {
            type: 'scan-output',
            producerVersion: assertedBy,
            blob: { headSha, engine, engineVersion, scanPath, result: 'no-violation' },
          },
        });
      }
    }
  }

  return drafts;
}
