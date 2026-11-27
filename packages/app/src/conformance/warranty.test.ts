import { describe, it, expect, beforeEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { MemoryStore } from '../db/memory-store.js';
import { writeClaims } from './ledger.js';
import { auditSubjectKey, type PublicKeyring } from './claim.js';
import type { ReconciledCriterion } from './reconcile.js';
import type { VerdictValue, VerdictSource } from '../db/store.js';
import {
  claimStateForVerdict,
  reconciledToClaimDrafts,
  verifyAuditWarranty,
  type WarrantyBacking,
} from './warranty.js';

const kp = generateKeyPairSync('ed25519');
const PEM = kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const PUB = kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const KEY_ID = 'conformance-2026';
const RING: PublicKeyring = { [KEY_ID]: PUB };

const REPO = 10;
const SUBJECT = auditSubjectKey(REPO);
const PUBLISHED_AT = '2026-03-05T00:00:00Z';

function rc(
  wcagId: string,
  verdict: VerdictValue,
  source: VerdictSource,
  level: ReconciledCriterion['level'] = 'A',
): ReconciledCriterion {
  return {
    wcagId,
    title: `Criterion ${wcagId}`,
    level,
    verdict,
    source,
    remarks: `remarks ${wcagId}`,
    evidence: null,
    needsHumanReview: source === 'machine',
  };
}

describe('claimStateForVerdict', () => {
  it('maps the VPAT vocabulary to claim states, skipping not_evaluated', () => {
    expect(claimStateForVerdict('supports')).toBe('pass');
    expect(claimStateForVerdict('partially_supports')).toBe('fail');
    expect(claimStateForVerdict('does_not_support')).toBe('fail');
    expect(claimStateForVerdict('not_applicable')).toBe('not-applicable');
    expect(claimStateForVerdict('not_evaluated')).toBeNull();
  });
});

describe('reconciledToClaimDrafts', () => {
  it('emits one human-method draft per human-reviewed, warrantable criterion', () => {
    const drafts = reconciledToClaimDrafts(
      REPO,
      'abc123',
      [
        rc('1.1.1', 'supports', 'human'),
        rc('1.3.1', 'does_not_support', 'human'),
        rc('1.4.3', 'not_applicable', 'human', 'AA'),
      ],
      PUBLISHED_AT,
    );
    expect(drafts.map(d => [d.body.criterion, d.body.state])).toEqual([
      ['1.1.1', 'pass'],
      ['1.3.1', 'fail'],
      ['1.4.3', 'not-applicable'],
    ]);
    for (const d of drafts) {
      expect(d.body.subjectKey).toBe(SUBJECT);
      expect(d.body.subjectKind).toBe('flow');
      expect(d.body.method).toBe('human');
      expect(d.body.assertedAt).toBe(PUBLISHED_AT);
      expect(d.evidence?.type).toBe('audit-verdict');
    }
  });

  it('excludes machine-sourced rows (the warranty covers only human-attested verdicts)', () => {
    const drafts = reconciledToClaimDrafts(
      REPO,
      'abc123',
      [rc('1.1.1', 'does_not_support', 'machine'), rc('1.3.1', 'supports', 'human')],
      PUBLISHED_AT,
    );
    expect(drafts.map(d => d.body.criterion)).toEqual(['1.3.1']);
  });

  it('excludes not_evaluated and AAA criteria (out of A/AA warranty scope)', () => {
    const drafts = reconciledToClaimDrafts(
      REPO,
      'abc123',
      [
        rc('1.1.1', 'not_evaluated', 'human'),
        rc('2.4.9', 'supports', 'human', 'AAA'),
        rc('1.3.1', 'supports', 'human'),
      ],
      PUBLISHED_AT,
    );
    expect(drafts.map(d => d.body.criterion)).toEqual(['1.3.1']);
  });
});

describe('verifyAuditWarranty', () => {
  let store: MemoryStore;
  const reconciled = [rc('1.1.1', 'supports', 'human'), rc('1.3.1', 'does_not_support', 'human')];

  async function backRevision(): Promise<WarrantyBacking> {
    const drafts = reconciledToClaimDrafts(REPO, 'abc123', reconciled, PUBLISHED_AT);
    const signed = await writeClaims({ store, drafts, signingKeyPem: PEM, keyId: KEY_ID });
    return { subjectKey: SUBJECT, claimIds: signed.map(c => c.id) };
  }

  beforeEach(() => {
    store = new MemoryStore();
  });

  it('verifies an untampered warranty: chain valid, snapshot agrees', async () => {
    const backing = await backRevision();
    const verdict = await verifyAuditWarranty(store, backing, reconciled, RING);
    expect(verdict).toEqual({ ok: true, backed: true, claims: 2 });
  });

  it('is backed:false (not tampered) when no backing claims were frozen', async () => {
    expect(await verifyAuditWarranty(store, null, reconciled, RING)).toEqual({
      ok: true,
      backed: false,
      claims: 0,
    });
    expect(
      await verifyAuditWarranty(store, { subjectKey: SUBJECT, claimIds: [] }, reconciled, RING),
    ).toEqual({ ok: true, backed: false, claims: 0 });
  });

  it('fails chain-invalid when the keyring cannot verify the signatures', async () => {
    const backing = await backRevision();
    const verdict = await verifyAuditWarranty(store, backing, reconciled, {});
    expect(verdict).toMatchObject({ ok: false, reason: 'chain-invalid' });
  });

  it('fails claim-missing when a referenced claim id is not on the chain', async () => {
    const backing = await backRevision();
    backing.claimIds.push('deadbeef-not-a-real-claim');
    const verdict = await verifyAuditWarranty(store, backing, reconciled, RING);
    expect(verdict).toMatchObject({ ok: false, reason: 'claim-missing', detail: 'deadbeef-not-a-real-claim' });
  });

  it('fails snapshot-divergence when the frozen verdict no longer matches the signed claim', async () => {
    const backing = await backRevision();
    // The signed ledger says 1.3.1 does_not_support (fail). Tamper the snapshot to
    // claim it `supports` — the public statement now lies about a signed claim.
    const tampered = [rc('1.1.1', 'supports', 'human'), rc('1.3.1', 'supports', 'human')];
    const verdict = await verifyAuditWarranty(store, backing, tampered, RING);
    expect(verdict).toMatchObject({ ok: false, reason: 'snapshot-divergence' });
    expect((verdict as { detail: string }).detail).toContain('1.3.1');
  });

  it('detects a tampered CLAIM: a flipped stored state breaks the chain signature', async () => {
    const backing = await backRevision();
    // Rewrite a stored claim's state in place without re-signing — exactly what
    // verifyLedger must catch via the signature check before any snapshot compare.
    // (listClaims returns copies, so tamper the backing array directly.)
    store.claims[0].state = store.claims[0].state === 'pass' ? 'fail' : 'pass';
    const verdict = await verifyAuditWarranty(store, backing, reconciled, RING);
    expect(verdict).toMatchObject({ ok: false, reason: 'chain-invalid' });
  });
});
