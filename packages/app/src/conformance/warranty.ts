// The warranty link: tie a published conformance audit to signed ledger claims.
//
// A published audit_revision freezes a JSON snapshot of reconciled verdicts. On
// its own that snapshot is app-owned data — editable, unsigned, unprovable. The
// warranty needs the public conformance statement to be backed by the SAME
// tamper-evident, Ed25519-signed ledger the rest of Phase 1 builds. This module
// is the seam:
//   - `reconciledToClaimDrafts` maps the human-reviewed criteria of a published
//     audit (the warranted subset — machine-only `supports` can't be published)
//     to claim drafts on a repo-level audit subject;
//   - `verifyAuditWarranty` re-verifies the backing chain AND cross-checks that
//     the frozen snapshot still agrees with the signed claims, so tampering
//     either the snapshot or a claim voids the warranty.
// Design: docs/conformance/phase-1-ledger-plan.md.
import type { ClaimState, PublicKeyring, SignedClaim } from './claim.js';
import { auditSubjectKey } from './claim.js';
import type { Store, VerdictValue } from '../db/store.js';
import type { ReconciledCriterion } from './reconcile.js';
import type { ClaimDraft } from './ledger.js';
import { verifyLedger } from './ledger.js';

/**
 * Map a published VPAT verdict to a claim state, or null for a verdict that must
 * not become a warranted claim. `not_evaluated` is skipped (a claim needs a
 * state a person stands behind); the publish gate already blocks machine-only
 * `supports`, so a `supports` reaching here is human-attested.
 */
export function claimStateForVerdict(verdict: VerdictValue): ClaimState | null {
  switch (verdict) {
    case 'supports':
      return 'pass';
    // Partial support still carries failures; at single-criterion claim
    // granularity the honest, underwritable direction is `fail`.
    case 'partially_supports':
    case 'does_not_support':
      return 'fail';
    case 'not_applicable':
      return 'not-applicable';
    case 'not_evaluated':
      return null;
    default: {
      const _never: never = verdict;
      throw new Error(`unhandled verdict: ${String(_never)}`);
    }
  }
}

/** Fixed producer id for warranty claims (the reviewed audit, not the scanner). */
export const WARRANTY_ASSERTED_BY = 'conformance-audit';

/**
 * Derive the signed-claim drafts that back a published audit: one `human`-method
 * claim per human-reviewed criterion with a warrantable verdict. Machine-sourced
 * rows are intentionally excluded — the warranty covers only what a person
 * attested; the scanner's own per-page claims already record the automated layer.
 */
export function reconciledToClaimDrafts(
  repoId: number,
  headSha: string,
  reconciled: readonly ReconciledCriterion[],
  publishedAt: string,
): ClaimDraft[] {
  const subjectKey = auditSubjectKey(repoId);
  const drafts: ClaimDraft[] = [];
  for (const r of reconciled) {
    if (r.source !== 'human') continue;
    // The warranty is scoped to WCAG 2.2 A/AA; a catalog AAA criterion is out of
    // scope and never becomes a warranted claim (ClaimBody.level is A|AA only).
    if (r.level !== 'A' && r.level !== 'AA') continue;
    const state = claimStateForVerdict(r.verdict);
    if (!state) continue;
    drafts.push({
      body: {
        subjectKind: 'flow',
        subjectKey,
        criterion: r.wcagId,
        wcagVersion: '2.2',
        level: r.level,
        state,
        method: 'human',
        confidence: 1,
        assertedBy: WARRANTY_ASSERTED_BY,
        assertedAt: publishedAt,
      },
      evidence: {
        type: 'audit-verdict',
        producerVersion: WARRANTY_ASSERTED_BY,
        blob: { headSha, verdict: r.verdict, remarks: r.remarks },
      },
    });
  }
  return drafts;
}

/** The backing-claim reference frozen into a published revision's snapshot. */
export interface WarrantyBacking {
  /** The repo-level audit subject the backing claims chain under. */
  subjectKey: string;
  /** Content-address ids of the signed claims that back this revision. */
  claimIds: string[];
}

export type WarrantyVerdict =
  | { ok: true; backed: boolean; claims: number }
  | {
      ok: false;
      reason: 'chain-invalid' | 'claim-missing' | 'snapshot-divergence';
      detail: string;
    };

/**
 * Verify a published revision's warranty. Three failure modes, each a reason:
 *   - `chain-invalid`: the backing subject's signed chain fails verification
 *     (bad signature, broken link, evidence mismatch) — delegated to verifyLedger.
 *   - `claim-missing`: a claim id the snapshot references is not on the chain.
 *   - `snapshot-divergence`: a human verdict in the frozen snapshot no longer
 *     matches the signed claim for that criterion (the snapshot was edited).
 * A revision with no backing claims (signing key absent at publish time) verifies
 * as `ok, backed:false` — not-yet-warranted, not tampered.
 */
export async function verifyAuditWarranty(
  store: Store,
  backing: WarrantyBacking | null,
  snapshotReconciled: readonly ReconciledCriterion[],
  keyring: PublicKeyring,
): Promise<WarrantyVerdict> {
  if (!backing || backing.claimIds.length === 0) {
    return { ok: true, backed: false, claims: 0 };
  }

  const chain = await verifyLedger(store, backing.subjectKey, keyring);
  if (!chain.ok) {
    return { ok: false, reason: 'chain-invalid', detail: chain.reason };
  }

  const claims = (await store.listClaims(backing.subjectKey)) as SignedClaim[];
  const byId = new Map(claims.map(c => [c.id, c]));
  for (const id of backing.claimIds) {
    if (!byId.has(id)) {
      return { ok: false, reason: 'claim-missing', detail: id };
    }
  }

  // Current signed state per criterion (last claim on the chain wins). The chain
  // is already verified, so these states are trustworthy to compare against.
  const signedState = new Map<string, ClaimState>();
  for (const c of claims) signedState.set(c.criterion, c.state);

  for (const r of snapshotReconciled) {
    if (r.source !== 'human') continue;
    const expected = claimStateForVerdict(r.verdict);
    if (!expected) continue;
    const actual = signedState.get(r.wcagId);
    if (actual !== expected) {
      return {
        ok: false,
        reason: 'snapshot-divergence',
        detail: `${r.wcagId}: snapshot=${expected} signed=${actual ?? 'none'}`,
      };
    }
  }

  return { ok: true, backed: true, claims: backing.claimIds.length };
}
