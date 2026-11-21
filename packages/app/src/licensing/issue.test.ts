import { describe, expect, it } from 'vitest';
import { createPublicKey, generateKeyPairSync, verify as cryptoVerify } from 'node:crypto';
import { FREE_LICENSE_DAYS, issueFreeLicense } from './issue.js';

function keypair() {
  return generateKeyPairSync('ed25519', {
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
}

const DAY_MS = 86_400_000;

describe('issueFreeLicense', () => {
  it('mints a signature-valid token with the account as subject and a 1-year expiry', () => {
    const { privateKey, publicKey } = keypair();
    const now = new Date('2026-01-01T00:00:00.000Z');

    const rec = issueFreeLicense({ account: 'acme', installationId: 42, signingKeyPem: privateKey, now });

    expect(rec.installationId).toBe(42);
    expect(rec.sub).toBe('acme');
    expect(rec.issuedAt).toBe(now.toISOString());
    const days = Math.round((new Date(rec.expiresAt).getTime() - now.getTime()) / DAY_MS);
    expect(days).toBe(FREE_LICENSE_DAYS);

    // The token's signature verifies against the matching public key, and the
    // payload has the shape the Action's verifyLicenseKey requires.
    const [payloadB64, sigB64] = rec.token.split('.');
    const ok = cryptoVerify(
      null,
      Buffer.from(payloadB64, 'ascii'),
      createPublicKey(publicKey),
      Buffer.from(sigB64, 'base64url'),
    );
    expect(ok).toBe(true);
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    expect(payload).toMatchObject({ v: 1, sub: 'acme' });
    expect(typeof payload.exp).toBe('number');
  });

  it('honors a custom validity window', () => {
    const { privateKey } = keypair();
    const now = new Date('2026-01-01T00:00:00.000Z');
    const rec = issueFreeLicense({ account: 'a', installationId: 1, signingKeyPem: privateKey, days: 30, now });
    expect(Math.round((new Date(rec.expiresAt).getTime() - now.getTime()) / DAY_MS)).toBe(30);
  });
});
