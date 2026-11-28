import { describe, it, expect, beforeEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { MemoryStore } from '../db/memory-store.js';
import { writeClaims, verifyLedger, type ClaimDraft } from './ledger.js';
import { flowSubjectKeyForName, type PublicKeyring } from './claim.js';
import { detectRegression, flowRegressions, isFlowSubject } from './flow-regression.js';

const kp = generateKeyPairSync('ed25519');
const PEM = kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const PUB = kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const KEY_ID = 'conformance-2026';
const RING: PublicKeyring = { [KEY_ID]: PUB };

const SUBJECT = flowSubjectKeyForName(7, '/dashboard');

function claim(state: 'pass' | 'fail', assertedAt: string): ClaimDraft {
  return {
    body: {
      subjectKind: 'flow',
      subjectKey: SUBJECT,
      criterion: '4.1.3',
      wcagVersion: '2.2',
      level: 'AA',
      state,
      method: 'runtime',
      confidence: 1,
      assertedBy: 'runtime-sensor@puppeteer/25.18.1',
      assertedAt,
    },
    evidence: { type: 'dom-trace', producerVersion: 'puppeteer/25.18.1', blob: { at: assertedAt, state } },
  };
}

describe('detectRegression — debounce (A7)', () => {
  const series = (states: Array<'pass' | 'fail'>) =>
    states.map((state, i) => ({ criterion: '4.1.3', state, assertedAt: `t${i}` }));

  it('flags a live pass→fail flip once', () => {
    const r = detectRegression(SUBJECT, '4.1.3', series(['pass', 'fail']));
    expect(r).toMatchObject({ regressedAt: 't1', priorPassAt: 't0' });
  });
  it('a flapping fail→pass→fail is one regression, not three', () => {
    const r = detectRegression(SUBJECT, '4.1.3', series(['fail', 'pass', 'fail']));
    expect(r?.priorPassAt).toBe('t1');
  });
  it('a standing failure (only ever failed) is not a regression', () => {
    expect(detectRegression(SUBJECT, '4.1.3', series(['fail', 'fail']))).toBeNull();
  });
  it('a recovered flow (current pass) is not a regression', () => {
    expect(detectRegression(SUBJECT, '4.1.3', series(['fail', 'pass']))).toBeNull();
  });
});

describe('isFlowSubject', () => {
  it('matches only flow subjects', () => {
    expect(isFlowSubject(SUBJECT)).toBe(true);
    expect(isFlowSubject('repo:7|path:src/index.html')).toBe(false);
  });
});

describe('flowRegressions — end-to-end over a signed ledger', () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = new MemoryStore();
  });

  it('spine: flow subject writes, chains, and verifies', async () => {
    await writeClaims({ store, drafts: [claim('pass', '2026-01-01T00:00:00Z')], signingKeyPem: PEM, keyId: KEY_ID });
    const verdict = await verifyLedger(store, SUBJECT, RING);
    expect(verdict.ok).toBe(true);
  });

  it('surfaces a pass→fail flip as a regression with the flow-scope caveat', async () => {
    await writeClaims({ store, drafts: [claim('pass', '2026-01-01T00:00:00Z')], signingKeyPem: PEM, keyId: KEY_ID });
    await writeClaims({ store, drafts: [claim('fail', '2026-01-02T00:00:00Z')], signingKeyPem: PEM, keyId: KEY_ID });
    const regressions = await flowRegressions(store, RING);
    expect(regressions).toHaveLength(1);
    expect(regressions[0]).toMatchObject({ subjectKey: SUBJECT, criterion: '4.1.3' });
    expect(regressions[0].caveat).toMatch(/only/i);
  });

  it('no regression while the flow still passes', async () => {
    await writeClaims({ store, drafts: [claim('pass', '2026-01-01T00:00:00Z')], signingKeyPem: PEM, keyId: KEY_ID });
    expect(await flowRegressions(store, RING)).toEqual([]);
  });
});
