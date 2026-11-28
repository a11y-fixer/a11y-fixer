import { describe, it, expect } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import {
  canonicalBody,
  claimId,
  signClaim,
  verifyClaim,
  pageSubjectKey,
  componentSubjectKey,
  flowSubjectKey,
  flowSubjectKeyForName,
  flowId,
  repoIdOfSubjectKey,
  pathOfSubjectKey,
  type ClaimBody,
  type PublicKeyring,
} from './claim.js';

const kp = generateKeyPairSync('ed25519');
const PEM = kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const PUB = kp.publicKey.export({ type: 'spki', format: 'pem' }).toString();
const KEY_ID = 'conformance-2026';
const KEYRING: PublicKeyring = { [KEY_ID]: PUB };

function body(over: Partial<ClaimBody> = {}): ClaimBody {
  return {
    subjectKind: 'page',
    subjectKey: pageSubjectKey(42, 'src/index.html'),
    criterion: '1.1.1',
    wcagVersion: '2.2',
    level: 'A',
    state: 'pass',
    method: 'deterministic',
    confidence: 1,
    assertedBy: 'scanner@axe-core/4.9.1',
    assertedAt: '2026-01-01T00:00:00Z',
    prevClaimId: null,
    supersedes: null,
    evidenceHash: 'a'.repeat(64),
    ...over,
  };
}

describe('canonicalBody / claimId', () => {
  it('is independent of input key order', () => {
    const a = body();
    // Rebuild with keys in a scrambled order.
    const scrambled = Object.fromEntries(Object.entries(a).reverse()) as unknown as ClaimBody;
    expect(canonicalBody(a).equals(canonicalBody(scrambled))).toBe(true);
    expect(claimId(a)).toBe(claimId(scrambled));
  });

  it('is reproducible (same body -> same id) across calls', () => {
    expect(claimId(body())).toBe(claimId(body()));
  });

  it('changes the id when any ASSERTION-CONTENT field changes', () => {
    const base = claimId(body());
    expect(claimId(body({ state: 'fail' }))).not.toBe(base);
    expect(claimId(body({ criterion: '1.3.1' }))).not.toBe(base);
    expect(claimId(body({ assertedAt: '2026-01-02T00:00:00Z' }))).not.toBe(base);
    expect(claimId(body({ evidenceHash: 'b'.repeat(64) }))).not.toBe(base);
  });

  it('does NOT change the id when only chain-linkage fields change (idempotent identity)', () => {
    const base = claimId(body());
    expect(claimId(body({ prevClaimId: 'x'.repeat(64) }))).toBe(base);
    expect(claimId(body({ supersedes: 'y'.repeat(64) }))).toBe(base);
  });
});

describe('signClaim / verifyClaim', () => {
  it('signs a well-formed body and verifies clean', () => {
    const signed = signClaim(body(), PEM, KEY_ID);
    expect(signed.id).toBe(claimId(body()));
    expect(signed.keyId).toBe(KEY_ID);
    expect(verifyClaim(signed, KEYRING)).toEqual({ ok: true });
  });

  it('rejects a tampered body (id/content mismatch)', () => {
    const signed = signClaim(body(), PEM, KEY_ID);
    const tampered = { ...signed, state: 'fail' as const };
    expect(verifyClaim(tampered, KEYRING)).toEqual({ ok: false, reason: 'id-mismatch' });
  });

  it('rejects a swapped signature (id matches body, signature does not)', () => {
    const a = signClaim(body(), PEM, KEY_ID);
    const b = signClaim(body({ criterion: '1.3.1' }), PEM, KEY_ID);
    const forged = { ...a, signature: b.signature };
    expect(verifyClaim(forged, KEYRING)).toEqual({ ok: false, reason: 'bad-signature' });
  });

  it('detects a mutated chain-linkage field via the signature (id unchanged, sig fails)', () => {
    const signed = signClaim(body(), PEM, KEY_ID);
    const relinked = { ...signed, prevClaimId: 'z'.repeat(64) };
    // id still matches (linkage is not part of the id)...
    expect(claimId(relinked)).toBe(relinked.id);
    // ...but the signature, which covers linkage, no longer verifies.
    expect(verifyClaim(relinked, KEYRING)).toEqual({ ok: false, reason: 'bad-signature' });
  });

  it('rejects an unknown signing key', () => {
    const signed = signClaim(body(), PEM, 'rotated-key-that-is-not-in-ring');
    expect(verifyClaim(signed, KEYRING)).toEqual({ ok: false, reason: 'unknown-key' });
  });

  it('verifies against the right key after rotation (multi-key ring)', () => {
    const kp2 = generateKeyPairSync('ed25519');
    const pem2 = kp2.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const pub2 = kp2.publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const ring: PublicKeyring = { [KEY_ID]: PUB, 'conformance-2027': pub2 };
    const oldClaim = signClaim(body(), PEM, KEY_ID);
    const newClaim = signClaim(body({ criterion: '1.3.1' }), pem2, 'conformance-2027');
    expect(verifyClaim(oldClaim, ring)).toEqual({ ok: true });
    expect(verifyClaim(newClaim, ring)).toEqual({ ok: true });
  });
});

describe('claim invariants (claim-model.md)', () => {
  it('requires evidence unless state is not-evaluated', () => {
    expect(() => signClaim(body({ state: 'pass', evidenceHash: null }), PEM, KEY_ID)).toThrow(/evidence/);
    expect(() => signClaim(body({ state: 'fail', evidenceHash: null }), PEM, KEY_ID)).toThrow(/evidence/);
    // not-evaluated may omit evidence.
    expect(() =>
      signClaim(body({ state: 'not-evaluated', evidenceHash: null }), PEM, KEY_ID),
    ).not.toThrow();
  });

  it('forces deterministic claims to confidence 1', () => {
    expect(() => signClaim(body({ method: 'deterministic', confidence: 0.9 }), PEM, KEY_ID)).toThrow(/confidence 1/);
  });

  it('forbids a semantic claim from asserting human-reviewed', () => {
    expect(() =>
      signClaim(body({ method: 'semantic', confidence: 0.8, state: 'human-reviewed' }), PEM, KEY_ID),
    ).toThrow(/human-reviewed/);
  });

  it('rejects out-of-range confidence and missing identity', () => {
    expect(() => signClaim(body({ confidence: 1.5 }), PEM, KEY_ID)).toThrow(/confidence/);
    expect(() => signClaim(body({ subjectKey: '' }), PEM, KEY_ID)).toThrow(/subjectKey/);
  });

  it('forces a runtime pass/fail (directly observed) to confidence 1', () => {
    expect(() =>
      signClaim(body({ method: 'runtime', state: 'pass', confidence: 0.9 }), PEM, KEY_ID),
    ).toThrow(/confidence 1/);
    expect(() =>
      signClaim(body({ method: 'runtime', state: 'fail', confidence: 0.5 }), PEM, KEY_ID),
    ).toThrow(/confidence 1/);
  });

  it('accepts a directly-observed runtime pass@1.0 and a sampled runtime not-evaluated (<1)', () => {
    expect(() => signClaim(body({ method: 'runtime', state: 'pass', confidence: 1 }), PEM, KEY_ID)).not.toThrow();
    expect(() =>
      signClaim(
        body({ method: 'runtime', state: 'not-evaluated', confidence: 0.4, evidenceHash: null }),
        PEM,
        KEY_ID,
      ),
    ).not.toThrow();
  });
});

describe('subject keys', () => {
  it('page key is stable and sha-independent', () => {
    expect(pageSubjectKey(1, 'a.html')).toBe('repo:1|path:a.html');
    expect(pageSubjectKey(1, 'a.html')).toBe(pageSubjectKey(1, 'a.html'));
  });
  it('component key nests a locator under the page', () => {
    expect(componentSubjectKey(1, 'a.html', 'button#x')).toBe('repo:1|path:a.html|node:button#x');
  });

  it('flow key keeps the repo prefix so repoIdOfSubjectKey scopes it', () => {
    expect(flowSubjectKey(5, 'abc123')).toBe('repo:5|flow:abc123');
    expect(repoIdOfSubjectKey(flowSubjectKey(5, 'abc123'))).toBe(5);
    expect(pathOfSubjectKey(flowSubjectKey(5, 'abc123'))).toBeNull();
  });

  it('flowId is a stable hash of the normalized name (A3), independent of case/spacing', () => {
    expect(flowId('/dashboard')).toBe(flowId('  /DASHBOARD  '));
    expect(flowSubjectKeyForName(5, '/orders')).toBe(flowSubjectKey(5, flowId('/orders')));
    expect(() => flowId('   ')).toThrow();
  });

  it('repoIdOfSubjectKey extracts the repo id, or null for a foreign key', () => {
    expect(repoIdOfSubjectKey(pageSubjectKey(42, 'src/a.html'))).toBe(42);
    expect(repoIdOfSubjectKey(componentSubjectKey(7, 'a.html', 'btn'))).toBe(7);
    expect(repoIdOfSubjectKey('flow:checkout')).toBeNull();
    expect(repoIdOfSubjectKey('repo:x|path:a')).toBeNull();
  });

  it('pathOfSubjectKey returns the path, dropping any component locator', () => {
    expect(pathOfSubjectKey(pageSubjectKey(1, 'src/a.html'))).toBe('src/a.html');
    expect(pathOfSubjectKey(componentSubjectKey(1, 'src/a.html', 'button#x'))).toBe('src/a.html');
    expect(pathOfSubjectKey('flow:checkout')).toBeNull();
  });
});
