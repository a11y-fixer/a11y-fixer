// The Conformance Claim — the signed unit the ledger appends.
//
// Design spec: docs/conformance/claim-model.md. A claim is a single assertion
// about one WCAG criterion for one subject at one point in time, Ed25519-signed
// over a canonical body and chained per subject. This module owns the three
// integrity-critical operations and nothing else: canonical serialization, the
// content-addressed id, and sign/verify. The signing key is a DEDICATED
// conformance key (CONFORMANCE_SIGNING_KEY), never the license key.
import { createHash } from 'node:crypto';
import { signPayload, verifyPayload } from '@a11y-fixer/licensing';

export type SubjectKind = 'flow' | 'page' | 'component';
export type ClaimState = 'pass' | 'fail' | 'not-applicable' | 'not-evaluated' | 'human-reviewed';
export type ClaimMethod = 'deterministic' | 'runtime' | 'semantic' | 'human';

/**
 * The claim body: every field that is signed. `id` and `signature` are derived
 * from this and are NOT part of it. `prevClaimId` IS part of it — that is what
 * chains the per-subject timeline (each body commits to the prior claim's id).
 */
export interface ClaimBody {
  subjectKind: SubjectKind;
  /** Canonical subject identity, stable across scans. See subjectKey helpers. */
  subjectKey: string;
  /** WCAG SC id, e.g. '1.1.1'. */
  criterion: string;
  wcagVersion: string;
  level: 'A' | 'AA';
  state: ClaimState;
  method: ClaimMethod;
  /** 0..1; deterministic producers assert exactly 1. */
  confidence: number;
  /** Producer id + version, e.g. 'scanner@axe-core/4.9.1'. */
  assertedBy: string;
  /** RFC3339 UTC. Derived from the evidence (scan completion), not wall-clock,
   *  so a redelivered scan produces byte-identical claims. */
  assertedAt: string;
  /** Prior claim id for this subjectKey, or null for the subject's genesis claim. */
  prevClaimId: string | null;
  /** Prior claim id for the same (subjectKey, criterion), or null. */
  supersedes: string | null;
  /** sha-256 of the evidence blob; null ONLY when state = 'not-evaluated'. */
  evidenceHash: string | null;
}

/** A claim body plus the derived content-address id, signature, and signing key id. */
export interface SignedClaim extends ClaimBody {
  /** sha-256 (hex) of the canonical body — the content address. */
  id: string;
  /** base64url Ed25519 signature over the canonical body bytes. */
  signature: string;
  /** Which conformance public key verifies this claim (keyring lookup). */
  keyId: string;
}

/** Map of keyId -> SPKI PEM public key, so claims verify across key rotation. */
export type PublicKeyring = Readonly<Record<string, string>>;

// Field orders are FIXED and explicit. Canonical serialization must be byte-stable
// across processes and versions, so we never rely on object key insertion order
// or JSON.stringify defaults — we build the object by hand. Adding a field is a
// breaking change and must bump wcagVersion-independent schema handling.
//
// Two orderings on purpose:
//  - SIGN_FIELDS: the full body the SIGNATURE covers, including the chain-linkage
//    fields (prevClaimId, supersedes). This is what makes the chain tamper-evident.
//  - ID_FIELDS: the ASSERTION content only — no linkage. The `id` is the hash of
//    these, so the identity of "this subject passes 1.1.1 with this evidence at
//    this time" is independent of where it lands on the chain. That makes a
//    redelivered scan collapse to the same id (idempotent) even after the head
//    has advanced, and lets a genuine re-assertion dedup instead of forking.
const SIGN_FIELDS: (keyof ClaimBody)[] = [
  'subjectKind',
  'subjectKey',
  'criterion',
  'wcagVersion',
  'level',
  'state',
  'method',
  'confidence',
  'assertedBy',
  'assertedAt',
  'prevClaimId',
  'supersedes',
  'evidenceHash',
];
const ID_FIELDS: (keyof ClaimBody)[] = SIGN_FIELDS.filter(
  f => f !== 'prevClaimId' && f !== 'supersedes',
);

function serialize(body: ClaimBody, fields: (keyof ClaimBody)[]): Buffer {
  const ordered: Record<string, unknown> = {};
  for (const f of fields) ordered[f] = body[f];
  return Buffer.from(JSON.stringify(ordered), 'utf8');
}

/**
 * The bytes the SIGNATURE covers: the full body including chain linkage. ASCII
 * (the same convention signLicense uses) so signing sees one encoding.
 */
export function canonicalBody(body: ClaimBody): Buffer {
  return serialize(body, SIGN_FIELDS);
}

/** The bytes the `id` hashes: the assertion content, excluding chain linkage. */
export function canonicalId(body: ClaimBody): Buffer {
  return serialize(body, ID_FIELDS);
}

/** Content-address: sha-256 hex of the assertion content (linkage excluded). */
export function claimId(body: ClaimBody): string {
  return createHash('sha256').update(canonicalId(body)).digest('hex');
}

/**
 * Signs a claim body into a SignedClaim: computes the content-address id and the
 * Ed25519 signature over the SAME canonical bytes, so a verifier recomputing the
 * id and checking the signature validates both integrity and authorship.
 */
export function signClaim(body: ClaimBody, pem: string, keyId: string): SignedClaim {
  if (!keyId) throw new Error('signClaim: `keyId` is required.');
  assertWellFormed(body);
  return {
    ...body,
    id: claimId(body),
    signature: signPayload(canonicalBody(body), pem),
    keyId,
  };
}

export type ClaimVerdict =
  | { ok: true }
  | { ok: false; reason: 'unknown-key' | 'id-mismatch' | 'bad-signature' };

/**
 * Verifies ONE claim in isolation: the id is the hash of its canonical body, and
 * the signature checks out against the keyring entry for its keyId. Chain-level
 * checks (prev linkage, evidence resolution) live in the ledger verifier.
 */
export function verifyClaim(claim: SignedClaim, keyring: PublicKeyring): ClaimVerdict {
  const pub = keyring[claim.keyId];
  if (!pub) return { ok: false, reason: 'unknown-key' };
  // id covers assertion content; signature covers the full body incl. linkage.
  if (claimId(claim) !== claim.id) return { ok: false, reason: 'id-mismatch' };
  if (!verifyPayload(canonicalBody(claim), claim.signature, pub)) {
    return { ok: false, reason: 'bad-signature' };
  }
  return { ok: true };
}

function assertWellFormed(body: ClaimBody): void {
  if (!body.subjectKey) throw new Error('claim: `subjectKey` is required.');
  if (!body.criterion) throw new Error('claim: `criterion` is required.');
  if (body.confidence < 0 || body.confidence > 1) {
    throw new Error('claim: `confidence` must be in [0,1].');
  }
  // Invariant (claim-model.md #6): only not-evaluated may lack evidence.
  if (body.state !== 'not-evaluated' && !body.evidenceHash) {
    throw new Error(`claim: state '${body.state}' requires evidence.`);
  }
  // Invariant (#3): deterministic claims assert full confidence.
  if (body.method === 'deterministic' && body.confidence !== 1) {
    throw new Error('claim: deterministic method must assert confidence 1.');
  }
  // Invariant (#5): semantic claims may not carry human-reviewed state.
  if (body.method === 'semantic' && body.state === 'human-reviewed') {
    throw new Error('claim: semantic method cannot assert human-reviewed.');
  }
}

/** Canonical subject identity for a page/file: stable across commits (sha is evidence, not identity). */
export function pageSubjectKey(repoId: number, path: string): string {
  return `repo:${repoId}|path:${path}`;
}

/** Canonical subject identity for a component: a locator within a page. */
export function componentSubjectKey(repoId: number, path: string, locator: string): string {
  return `repo:${repoId}|path:${path}|node:${locator}`;
}
