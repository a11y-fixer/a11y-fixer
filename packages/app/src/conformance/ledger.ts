// The Conformance Ledger writer + verifier.
//
// The writer turns unsigned claim drafts into a signed, per-subject-chained
// batch and appends it through the Store. The verifier walks a subject's chain
// and re-checks every signature, link, and evidence hash — the tamper-evidence
// the Phase 4 warranty leans on. Design: docs/conformance/phase-1-ledger-plan.md.
import { createHash } from 'node:crypto';
import type { EvidenceBlobRecord, SignedClaimRecord, Store } from '../db/store.js';
import {
  canonicalBody,
  signClaim,
  verifyClaim,
  type ClaimBody,
  type PublicKeyring,
  type SignedClaim,
} from './claim.js';

/**
 * A claim before it is placed on a chain: everything in a ClaimBody EXCEPT the
 * two linkage fields (`prevClaimId`, `supersedes`), which the writer resolves
 * from the ledger, plus the evidence to attach.
 */
export interface ClaimDraft {
  body: Omit<ClaimBody, 'prevClaimId' | 'supersedes' | 'evidenceHash'>;
  /** Evidence to store and reference, or null for a not-evaluated claim. */
  evidence: { type: string; producerVersion: string; blob: unknown } | null;
}

/** Deterministic JSON (recursively sorted keys) for stable content hashing. */
function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${canonicalJson((value as Record<string, unknown>)[k])}`).join(',')}}`;
}

/** Content hash of an evidence blob: sha-256 hex of its canonical JSON. */
export function hashEvidence(blob: unknown): string {
  return createHash('sha256').update(canonicalJson(blob), 'utf8').digest('hex');
}

export interface WriteClaimsOptions {
  store: Store;
  drafts: ClaimDraft[];
  /** PKCS#8 PEM of the dedicated CONFORMANCE_SIGNING_KEY. */
  signingKeyPem: string;
  /** Which public key verifies these claims (keyring id for the signing key). */
  keyId: string;
}

/**
 * Signs and appends a batch of claim drafts. For each draft:
 *  - stores its evidence (idempotent by content hash),
 *  - resolves `prevClaimId` from the subject's current head (advancing locally so
 *    multiple drafts on one subject chain within the batch),
 *  - resolves `supersedes` to the latest prior claim for the same (subject,
 *    criterion), and
 *  - signs the claim.
 * Drafts are processed in a deterministic order (subjectKey, then criterion) so a
 * redelivered scan reproduces the identical chain and claim ids.
 */
export async function writeClaims(opts: WriteClaimsOptions): Promise<SignedClaim[]> {
  const { store, drafts, signingKeyPem, keyId } = opts;

  const ordered = [...drafts].sort((a, b) =>
    a.body.subjectKey === b.body.subjectKey
      ? a.body.criterion.localeCompare(b.body.criterion)
      : a.body.subjectKey.localeCompare(b.body.subjectKey),
  );

  // Per-subject working head, seeded from the store and advanced as we chain.
  const heads = new Map<string, string | null>();
  // Latest claim id per (subjectKey, criterion), for supersedes. Seeded lazily.
  const latestByCriterion = new Map<string, string | null>();
  const subjectsLoaded = new Set<string>();

  const signed: SignedClaim[] = [];

  for (const draft of ordered) {
    const { subjectKey, criterion } = draft.body;

    if (!heads.has(subjectKey)) heads.set(subjectKey, await store.getSubjectHead(subjectKey));
    // Load existing claims once per subject to seed supersedes lookups.
    if (!subjectsLoaded.has(subjectKey)) {
      subjectsLoaded.add(subjectKey);
      const existing = await store.listClaims(subjectKey);
      for (const c of existing) latestByCriterion.set(`${subjectKey}\u0000${c.criterion}`, c.id);
    }

    let evidenceHash: string | null = null;
    if (draft.evidence) {
      evidenceHash = hashEvidence(draft.evidence.blob);
      const record: EvidenceBlobRecord = {
        hash: evidenceHash,
        type: draft.evidence.type,
        producerVersion: draft.evidence.producerVersion,
        blob: draft.evidence.blob,
        createdAt: draft.body.assertedAt,
      };
      await store.putEvidence(record);
    }

    const critKey = `${subjectKey}\u0000${criterion}`;
    const body: ClaimBody = {
      ...draft.body,
      prevClaimId: heads.get(subjectKey) ?? null,
      supersedes: latestByCriterion.get(critKey) ?? null,
      evidenceHash,
    };
    const claim = signClaim(body, signingKeyPem, keyId);
    signed.push(claim);
    heads.set(subjectKey, claim.id);
    latestByCriterion.set(critKey, claim.id);
  }

  await store.appendClaims(signed as SignedClaimRecord[]);
  return signed;
}

export type LedgerVerdict =
  | { ok: true; claims: number }
  | {
      ok: false;
      claimId: string | null;
      reason:
        | 'unknown-key'
        | 'id-mismatch'
        | 'bad-signature'
        | 'broken-chain'
        | 'evidence-missing'
        | 'evidence-mismatch';
    };

/**
 * Verifies a subject's whole chain. Fails CLOSED: the first failing check stops
 * and reports which claim and why. Checks, per claim in chain order:
 *   1. signature + id (verifyClaim),
 *   2. prevClaimId equals the previous claim's id (no gap/reorder/fork),
 *   3. evidence resolves and its stored blob re-hashes to evidenceHash.
 */
export async function verifyLedger(
  store: Store,
  subjectKey: string,
  keyring: PublicKeyring,
): Promise<LedgerVerdict> {
  const claims = await store.listClaims(subjectKey);
  let prev: string | null = null;

  for (const claim of claims) {
    const sig = verifyClaim(claim as SignedClaim, keyring);
    if (!sig.ok) return { ok: false, claimId: claim.id, reason: sig.reason };

    if (claim.prevClaimId !== prev) {
      return { ok: false, claimId: claim.id, reason: 'broken-chain' };
    }

    if (claim.evidenceHash) {
      const blob = await store.getEvidence(claim.evidenceHash);
      if (!blob) return { ok: false, claimId: claim.id, reason: 'evidence-missing' };
      if (hashEvidence(blob.blob) !== claim.evidenceHash) {
        return { ok: false, claimId: claim.id, reason: 'evidence-mismatch' };
      }
    }

    prev = claim.id;
  }

  return { ok: true, claims: claims.length };
}

// canonicalBody is re-exported for tests that need to tamper at the byte level.
export { canonicalBody };
