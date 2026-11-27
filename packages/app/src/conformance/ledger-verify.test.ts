import { describe, it, expect, beforeEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { MemoryStore } from '../db/memory-store.js';
import { writeClaims, type ClaimDraft } from './ledger.js';
import { pageSubjectKey, type PublicKeyring } from './claim.js';
import { buildLedgerReadModel, formatLedgerReport } from './ledger-verify.js';

const kp = generateKeyPairSync('ed25519');
const PEM = kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const PUB = kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const KEY_ID = 'conformance-2026';
const RING: PublicKeyring = { [KEY_ID]: PUB };

const SUBJECT_A = pageSubjectKey(7, 'src/a.html');
const SUBJECT_B = pageSubjectKey(7, 'src/b.html');

function draft(subjectKey: string, criterion: string, state: 'pass' | 'fail', tag: string): ClaimDraft {
  return {
    body: {
      subjectKind: 'page',
      subjectKey,
      criterion,
      wcagVersion: '2.2',
      level: 'A',
      state,
      method: 'deterministic',
      confidence: 1,
      assertedBy: 'scanner@axe-core/4.14.1',
      assertedAt: '2026-01-01T00:00:00Z',
    },
    evidence: { type: 'scan-output', producerVersion: 'axe-core/4.14.1', blob: { tag } },
  };
}

function write(store: MemoryStore, drafts: ClaimDraft[]) {
  return writeClaims({ store, drafts, signingKeyPem: PEM, keyId: KEY_ID });
}

describe('buildLedgerReadModel', () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = new MemoryStore();
  });

  it('reports an empty ledger with no subjects and ok=true', async () => {
    const model = await buildLedgerReadModel(store, RING);
    expect(model.subjects).toEqual([]);
    expect(model.ok).toBe(true);
  });

  it('collapses a chain to the current state per criterion (latest wins)', async () => {
    await write(store, [draft(SUBJECT_A, '1.4.2', 'fail', 'v1')]);
    await write(store, [draft(SUBJECT_A, '1.4.2', 'pass', 'v2')]); // supersedes the fail

    const model = await buildLedgerReadModel(store, RING);
    expect(model.ok).toBe(true);
    expect(model.subjects).toHaveLength(1);

    const s = model.subjects[0];
    expect(s.subjectKey).toBe(SUBJECT_A);
    expect(s.claimCount).toBe(2);
    expect(s.criteria).toHaveLength(1);
    expect(s.criteria[0]).toMatchObject({ criterion: '1.4.2', state: 'pass' });
    expect(s.stateCounts.pass).toBe(1);
    expect(s.stateCounts.fail).toBe(0);
  });

  it('sorts subjects and their criteria for stable output', async () => {
    await write(store, [
      draft(SUBJECT_B, '3.1.1', 'pass', 'b1'),
      draft(SUBJECT_A, '1.4.2', 'fail', 'a1'),
      draft(SUBJECT_A, '1.1.1', 'pass', 'a2'),
    ]);

    const model = await buildLedgerReadModel(store, RING);
    expect(model.subjects.map(s => s.subjectKey)).toEqual([SUBJECT_A, SUBJECT_B].sort());
    const a = model.subjects.find(s => s.subjectKey === SUBJECT_A)!;
    expect(a.criteria.map(c => c.criterion)).toEqual(['1.1.1', '1.4.2']);
    expect(a.stateCounts.pass).toBe(1);
    expect(a.stateCounts.fail).toBe(1);
  });

  it('honors an explicit subjectKeys subset', async () => {
    await write(store, [draft(SUBJECT_A, '1.4.2', 'pass', 'a1'), draft(SUBJECT_B, '3.1.1', 'pass', 'b1')]);
    const model = await buildLedgerReadModel(store, RING, [SUBJECT_B]);
    expect(model.subjects.map(s => s.subjectKey)).toEqual([SUBJECT_B]);
  });

  it('reports a tampered chain as failed with no criteria, and ok=false', async () => {
    await write(store, [draft(SUBJECT_A, '1.4.2', 'pass', 'a1')]);
    // Tamper: flip the stored state after signing. The id/signature no longer match.
    store.claims[0].state = 'fail';

    const model = await buildLedgerReadModel(store, RING);
    expect(model.ok).toBe(false);
    const s = model.subjects[0];
    expect(s.verdict.ok).toBe(false);
    expect(s.criteria).toEqual([]);
    expect(s.claimCount).toBe(1);
  });

  it('fails closed under an empty keyring (unknown-key)', async () => {
    await write(store, [draft(SUBJECT_A, '1.4.2', 'pass', 'a1')]);
    const model = await buildLedgerReadModel(store, {});
    expect(model.ok).toBe(false);
    expect(model.subjects[0].verdict).toMatchObject({ ok: false, reason: 'unknown-key' });
  });
});

describe('formatLedgerReport', () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = new MemoryStore();
  });

  it('renders an empty-ledger message with ok=true', async () => {
    const report = formatLedgerReport(await buildLedgerReadModel(store, RING));
    expect(report.ok).toBe(true);
    expect(report.text).toMatch(/Ledger is empty/);
  });

  it('renders a ✅ line per verified subject and a verified summary', async () => {
    await write(store, [draft(SUBJECT_A, '1.4.2', 'pass', 'a1')]);
    const report = formatLedgerReport(await buildLedgerReadModel(store, RING));
    expect(report.ok).toBe(true);
    expect(report.text).toContain('✅');
    expect(report.text).toContain('1.4.2=pass');
    expect(report.text).toMatch(/All 1 subject chain\(s\) verified\./);
  });

  it('renders a ❌ line with the reason and a failure summary when a chain is tampered', async () => {
    await write(store, [draft(SUBJECT_A, '1.4.2', 'pass', 'a1')]);
    store.claims[0].state = 'fail';
    const report = formatLedgerReport(await buildLedgerReadModel(store, RING));
    expect(report.ok).toBe(false);
    expect(report.text).toContain('❌');
    expect(report.text).toMatch(/FAILED/);
    expect(report.text).toMatch(/1 of 1 subject chain\(s\) FAILED/);
  });

  it('labels a verified subject that has no current criteria', async () => {
    // A subject whose only claim is not-evaluated still verifies; render (no criteria)
    // is exercised via the empty-criteria branch when criteria collapse to zero rows.
    const report = formatLedgerReport({
      subjects: [
        {
          subjectKey: SUBJECT_A,
          subjectKind: 'page',
          verdict: { ok: true, claims: 0 },
          claimCount: 0,
          criteria: [],
          stateCounts: { pass: 0, fail: 0, 'not-applicable': 0, 'not-evaluated': 0, 'human-reviewed': 0 },
        },
      ],
      ok: true,
    });
    expect(report.text).toContain('(no criteria)');
  });
});
