import { describe, expect, it } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { MemoryStore } from '../../db/memory-store.js';
import { handleCheckRun } from './check-run.js';
import { verifyLedger } from '../../conformance/ledger.js';
import { pageSubjectKey, type PublicKeyring } from '../../conformance/claim.js';
import type { CheckRunEvent } from '../events.js';

const kp = generateKeyPairSync('ed25519');
const PEM = kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const PUB = kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const KEY_ID = 'conformance-2026';
const RING: PublicKeyring = { [KEY_ID]: PUB };
const CONF = { signingKeyPem: PEM, keyId: KEY_ID };

const repository = { id: 42, full_name: 'acme/web', private: false, default_branch: 'main' };

function event(text: string | undefined): CheckRunEvent {
  return {
    action: 'completed',
    installation: { id: 100 },
    repository,
    check_run: {
      id: 9001,
      name: 'a11y-fixer',
      head_sha: 'abc123',
      status: 'completed',
      conclusion: 'failure',
      completed_at: '2026-01-02T03:04:05Z',
      output: text === undefined ? { annotations_count: 1 } : { annotations_count: 1, text },
      pull_requests: [{ number: 7 }],
    },
  };
}

function contractV2(over: Record<string, unknown> = {}): string {
  return JSON.stringify({
    schema: 'a11y-fixer.scan/2',
    sha: 'abc123',
    engine: 'axe-core',
    engineVersion: '4.9.1',
    scanPath: 'html',
    mode: 'check',
    conclusion: 'failure',
    counts: { critical: 1, serious: 0, moderate: 0, minor: 0, total: 1 },
    truncated: false,
    violations: [
      { id: 'image-alt', wcagId: '1.1.1', impact: 'critical', description: 'alt', helpUrl: 'h', locations: [{ path: 'src/a.html', line: 3 }] },
    ],
    ...over,
  });
}

describe('handleCheckRun — conformance ledger wiring', () => {
  it('appends signed claims from a v2 contract, and the chain verifies', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event(contractV2()), store, () => new Date('2026-01-02T03:04:05Z'), CONF);

    // a.html: a 1.1.1 fail + passes for the html pass-eligible criteria (1.4.2, 3.1.1).
    const subject = pageSubjectKey(42, 'src/a.html');
    const claims = await store.listClaims(subject);
    const byState = (s: string) => claims.filter(c => c.state === s).map(c => c.criterion).sort();
    expect(byState('fail')).toEqual(['1.1.1']);
    expect(byState('pass')).toEqual(['1.4.2', '3.1.1']);
    expect(claims.every(c => c.method === 'deterministic' && c.confidence === 1)).toBe(true);
    expect(await verifyLedger(store, subject, RING)).toEqual({ ok: true, claims: 3 });
  });

  it('writes the scan rows AND the claims (ledger does not replace existing ingestion)', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event(contractV2()), store, () => new Date(), CONF);
    expect(store.scans.has(9001)).toBe(true);
    expect(store.claims.length).toBeGreaterThan(0);
  });

  it('a v1 contract yields fail-only claims (no pass without engine/path)', async () => {
    const store = new MemoryStore();
    const v1 = JSON.stringify({
      schema: 'a11y-fixer.scan/1',
      counts: { critical: 1, serious: 0, moderate: 0, minor: 0, total: 1 },
      truncated: false,
      violations: [
        { id: 'image-alt', wcagId: '1.1.1', impact: 'critical', description: 'a', helpUrl: 'h', locations: [{ path: 'src/a.html', line: 3 }] },
      ],
    });
    await handleCheckRun(event(v1), store, () => new Date(), CONF);
    expect(store.claims.some(c => c.state === 'pass')).toBe(false);
    expect(store.claims.some(c => c.state === 'fail')).toBe(true);
  });

  it('writes no claims when no conformance config is supplied', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event(contractV2()), store); // no conf arg
    expect(store.claims.length).toBe(0);
    expect(store.scans.has(9001)).toBe(true); // ingestion still happened
  });

  it('re-delivering the same completed run does not duplicate claims', async () => {
    const store = new MemoryStore();
    const now = () => new Date('2026-01-02T03:04:05Z');
    await handleCheckRun(event(contractV2()), store, now, CONF);
    const after = store.claims.length;
    await handleCheckRun(event(contractV2()), store, now, CONF);
    expect(store.claims.length).toBe(after); // content-addressed idempotency
  });
});
