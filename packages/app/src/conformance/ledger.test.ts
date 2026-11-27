import { describe, it, expect, beforeEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { MemoryStore } from '../db/memory-store.js';
import { writeClaims, verifyLedger, hashEvidence, type ClaimDraft } from './ledger.js';
import { pageSubjectKey, type PublicKeyring, type SignedClaim } from './claim.js';

const kp = generateKeyPairSync('ed25519');
const PEM = kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const PUB = kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const KEY_ID = 'conformance-2026';
const RING: PublicKeyring = { [KEY_ID]: PUB };

const SUBJECT = pageSubjectKey(42, 'src/index.html');

function draft(criterion: string, state: 'pass' | 'fail', blobTag: string): ClaimDraft {
  return {
    body: {
      subjectKind: 'page',
      subjectKey: SUBJECT,
      criterion,
      wcagVersion: '2.2',
      level: 'A',
      state,
      method: 'deterministic',
      confidence: 1,
      assertedBy: 'scanner@axe-core/4.9.1',
      assertedAt: '2026-01-01T00:00:00Z',
    },
    evidence: { type: 'scan-output', producerVersion: 'axe-core/4.9.1', blob: { tag: blobTag } },
  };
}

function write(store: MemoryStore, drafts: ClaimDraft[]) {
  return writeClaims({ store, drafts, signingKeyPem: PEM, keyId: KEY_ID });
}

describe('writeClaims — chaining', () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = new MemoryStore();
  });

  it('genesis claim has prevClaimId null; later claims link head-to-head', async () => {
    const signed = await write(store, [draft('1.1.1', 'fail', 'a'), draft('1.3.1', 'pass', 'b')]);
    // Deterministic order: 1.1.1 before 1.3.1.
    expect(signed[0].criterion).toBe('1.1.1');
    expect(signed[0].prevClaimId).toBeNull();
    expect(signed[1].prevClaimId).toBe(signed[0].id);
    expect(await store.getSubjectHead(SUBJECT)).toBe(signed[1].id);
  });

  it('a second batch chains onto the stored head', async () => {
    const [g0, g1] = await write(store, [draft('1.1.1', 'fail', 'a'), draft('1.3.1', 'pass', 'b')]);
    const [n0] = await write(store, [draft('2.4.2', 'pass', 'c')]);
    expect(n0.prevClaimId).toBe(g1.id);
    void g0;
  });

  it('resolves supersedes to the prior claim for the same (subject, criterion)', async () => {
    const [first] = await write(store, [draft('1.1.1', 'fail', 'a')]);
    expect(first.supersedes).toBeNull();
    // Re-scan: same criterion now passes (remediated).
    const [second] = await write(store, [draft('1.1.1', 'pass', 'fixed')]);
    expect(second.supersedes).toBe(first.id);
    expect(second.state).toBe('pass');
  });

  it('deduplicates evidence by content hash', async () => {
    await write(store, [draft('1.1.1', 'fail', 'same'), draft('1.3.1', 'fail', 'same')]);
    // Both drafts share blob {tag:'same'} -> one evidence row.
    expect(store.evidence.size).toBe(1);
    const hash = hashEvidence({ tag: 'same' });
    expect(await store.getEvidence(hash)).not.toBeNull();
  });
});

describe('writeClaims — idempotent redelivery', () => {
  it('re-writing the identical batch produces identical ids and leaves the head stable', async () => {
    const store = new MemoryStore();
    const drafts = [draft('1.1.1', 'fail', 'a'), draft('1.3.1', 'pass', 'b')];
    const first = await write(store, drafts);
    const headAfterFirst = await store.getSubjectHead(SUBJECT);
    const countAfterFirst = store.claims.length;

    const second = await write(store, drafts);
    expect(second.map(c => c.id)).toEqual(first.map(c => c.id));
    expect(store.claims.length).toBe(countAfterFirst); // no duplicate rows
    expect(await store.getSubjectHead(SUBJECT)).toBe(headAfterFirst); // head unchanged
  });
});

describe('verifyLedger — clean', () => {
  it('passes a well-formed chain and counts the claims', async () => {
    const store = new MemoryStore();
    await write(store, [draft('1.1.1', 'fail', 'a'), draft('1.3.1', 'pass', 'b')]);
    await write(store, [draft('1.1.1', 'pass', 'fixed')]);
    expect(await verifyLedger(store, SUBJECT, RING)).toEqual({ ok: true, claims: 3 });
  });

  it('passes with an empty subject (no claims)', async () => {
    const store = new MemoryStore();
    expect(await verifyLedger(store, 'repo:1|path:none', RING)).toEqual({ ok: true, claims: 0 });
  });
});

describe('verifyLedger — tamper detection (fails closed)', () => {
  let store: MemoryStore;
  let claims: SignedClaim[];
  beforeEach(async () => {
    store = new MemoryStore();
    claims = await write(store, [draft('1.1.1', 'fail', 'a'), draft('1.3.1', 'pass', 'b')]);
  });

  it('detects a mutated claim body (id mismatch)', async () => {
    store.claims[0].state = 'pass'; // flip a fail to a pass in place
    const v = await verifyLedger(store, SUBJECT, RING);
    expect(v.ok).toBe(false);
    expect(v).toMatchObject({ reason: 'id-mismatch', claimId: claims[0].id });
  });

  it('detects a swapped signature', async () => {
    store.claims[0].signature = store.claims[1].signature;
    const v = await verifyLedger(store, SUBJECT, RING);
    expect(v).toMatchObject({ ok: false, reason: 'bad-signature' });
  });

  it('detects an unknown signing key', async () => {
    store.claims[0].keyId = 'rotated-away';
    const v = await verifyLedger(store, SUBJECT, RING);
    expect(v).toMatchObject({ ok: false, reason: 'unknown-key' });
  });

  it('detects a removed middle claim (broken chain)', async () => {
    // Append a third so there is a middle to remove.
    const [third] = await write(store, [draft('2.4.2', 'pass', 'c')]);
    // Remove the second claim; the third's prev now dangles.
    const idx = store.claims.findIndex(c => c.id === claims[1].id);
    store.claims.splice(idx, 1);
    const v = await verifyLedger(store, SUBJECT, RING);
    expect(v).toMatchObject({ ok: false, reason: 'broken-chain', claimId: third.id });
  });

  it('detects missing evidence', async () => {
    store.evidence.clear();
    const v = await verifyLedger(store, SUBJECT, RING);
    expect(v).toMatchObject({ ok: false, reason: 'evidence-missing' });
  });

  it('detects tampered evidence (hash mismatch)', async () => {
    const hash = claims[0].evidenceHash!;
    const e = store.evidence.get(hash)!;
    e.blob = { tag: 'tampered' }; // same hash key, different content
    const v = await verifyLedger(store, SUBJECT, RING);
    expect(v).toMatchObject({ ok: false, reason: 'evidence-mismatch', claimId: claims[0].id });
  });
});
