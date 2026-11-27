// Ledger read-model + verification report.
//
// `verifyLedger` (ledger.ts) checks ONE subject's chain. This module walks the
// WHOLE ledger: it enumerates every subject, re-verifies each chain (the
// tamper-evidence the Phase 4 warranty leans on), and collapses each chain to
// its current per-criterion state — the shape a dashboard or an auditor reads.
//
// Consumed by:
//   - scripts/ledger-verify.ts (the `ledger:verify` CLI / CI gate), and
//   - the dashboard read-model (a signed, queryable conformance view).
//
// Design: docs/conformance/phase-1-ledger-plan.md.
import type { Store, SignedClaimRecord } from '../db/store.js';
import type { PublicKeyring } from './claim.js';
import { verifyLedger, type LedgerVerdict } from './ledger.js';

/** The current (latest, superseding) claim for one criterion on a subject. */
export interface CriterionState {
  criterion: string;
  state: SignedClaimRecord['state'];
  method: SignedClaimRecord['method'];
  confidence: number;
  assertedAt: string;
  claimId: string;
}

/** One subject's chain: its tamper verdict plus its current conformance state. */
export interface SubjectReadModel {
  subjectKey: string;
  subjectKind: SignedClaimRecord['subjectKind'];
  /** Fails CLOSED: anything other than `{ ok: true }` means do not trust this chain. */
  verdict: LedgerVerdict;
  claimCount: number;
  /** Current state per criterion, criterion-sorted. Empty if the chain is unverified. */
  criteria: CriterionState[];
  /** Count of current criteria in each state (over `criteria`). */
  stateCounts: Record<SignedClaimRecord['state'], number>;
}

/** The whole-ledger read-model. `ok` is true only when EVERY subject verifies. */
export interface LedgerReadModel {
  subjects: SubjectReadModel[];
  ok: boolean;
}

function emptyStateCounts(): Record<SignedClaimRecord['state'], number> {
  return { pass: 0, fail: 0, 'not-applicable': 0, 'not-evaluated': 0, 'human-reviewed': 0 };
}

/**
 * Collapse a subject's chain (append order) to its current state per criterion:
 * the last claim wins, since each new claim for a (subject, criterion) supersedes
 * the prior one. Criterion-sorted for stable output.
 */
function currentCriteria(claims: SignedClaimRecord[]): CriterionState[] {
  const byCriterion = new Map<string, CriterionState>();
  for (const c of claims) {
    byCriterion.set(c.criterion, {
      criterion: c.criterion,
      state: c.state,
      method: c.method,
      confidence: c.confidence,
      assertedAt: c.assertedAt,
      claimId: c.id,
    });
  }
  return [...byCriterion.values()].sort((a, b) => a.criterion.localeCompare(b.criterion));
}

/**
 * Build the read-model for the whole ledger (or a given subset of subjects).
 * For each subject: verify the chain, then — only if it verifies — collapse it to
 * its current per-criterion state. An unverified chain reports its verdict and no
 * criteria, so a tampered subject can never masquerade as a clean conformance row.
 */
export async function buildLedgerReadModel(
  store: Store,
  keyring: PublicKeyring,
  subjectKeys?: string[],
): Promise<LedgerReadModel> {
  const keys = subjectKeys ?? (await store.listSubjectKeys());
  keys.sort((a, b) => a.localeCompare(b));

  const subjects: SubjectReadModel[] = [];
  for (const subjectKey of keys) {
    const claims = await store.listClaims(subjectKey);
    const verdict = await verifyLedger(store, subjectKey, keyring);

    const stateCounts = emptyStateCounts();
    let criteria: CriterionState[] = [];
    if (verdict.ok) {
      criteria = currentCriteria(claims);
      for (const c of criteria) stateCounts[c.state] += 1;
    }

    subjects.push({
      subjectKey,
      subjectKind: claims[0]?.subjectKind ?? 'page',
      verdict,
      claimCount: claims.length,
      criteria,
      stateCounts,
    });
  }

  return { subjects, ok: subjects.every(s => s.verdict.ok) };
}

/**
 * Render a read-model as a plain-text report for the CLI. Returns the text and
 * `ok` so the caller can set a non-zero exit code when any chain fails.
 */
export function formatLedgerReport(model: LedgerReadModel): { text: string; ok: boolean } {
  const lines: string[] = [];
  if (model.subjects.length === 0) {
    lines.push('Ledger is empty: no subjects with claims.');
    return { text: lines.join('\n'), ok: true };
  }

  for (const s of model.subjects) {
    if (s.verdict.ok) {
      const summary = s.criteria.length
        ? s.criteria.map(c => `${c.criterion}=${c.state}`).join(' ')
        : '(no criteria)';
      lines.push(`✅ ${s.subjectKey}  [${s.claimCount} claims]  ${summary}`);
    } else {
      lines.push(
        `❌ ${s.subjectKey}  FAILED: ${s.verdict.reason}` +
          (s.verdict.claimId ? ` at claim ${s.verdict.claimId}` : ''),
      );
    }
  }

  const failed = model.subjects.filter(s => !s.verdict.ok).length;
  lines.push('');
  lines.push(
    model.ok
      ? `All ${model.subjects.length} subject chain(s) verified.`
      : `${failed} of ${model.subjects.length} subject chain(s) FAILED verification.`,
  );
  return { text: lines.join('\n'), ok: model.ok };
}
