import { describe, it, expect } from 'vitest';
import { createPublicKey, generateKeyPairSync, verify as cryptoVerify } from 'node:crypto';
import { signLicense } from './sign.mjs';

describe('signLicense (the one true minting algorithm)', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

  it('mints a two-segment base64url <payload>.<sig> token', () => {
    const { token } = signLicense({ sub: 'customer@example.com', days: 365, pem });
    const parts = token.split('.');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBeTruthy();
    expect(parts[1]).toBeTruthy();
    // base64url: no +, /, or = padding.
    expect(token).not.toMatch(/[+/=]/);
  });

  it('encodes a payload of exactly { v:1, sub, exp } with exp = now + days', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const { token, payload, iat, exp } = signLicense({ sub: 'customer@example.com', days: 30, pem, now });

    expect(Object.keys(payload).sort()).toEqual(['exp', 'sub', 'v']);
    expect(payload.v).toBe(1);
    expect(payload.sub).toBe('customer@example.com');
    expect(iat).toBe(Math.floor(now.getTime() / 1000));
    expect(exp).toBe(iat + 30 * 86400);

    const [payloadB64] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    expect(decoded).toEqual(payload);
  });

  it('signs the ASCII bytes of the payload segment (verifiable with the matching public key)', () => {
    const { token } = signLicense({ sub: 'customer@example.com', days: 365, pem });
    const [payloadB64, sigB64] = token.split('.');
    const ok = cryptoVerify(
      null,
      Buffer.from(payloadB64, 'ascii'),
      createPublicKey(publicPem),
      Buffer.from(sigB64, 'base64url'),
    );
    expect(ok).toBe(true);
  });

  it('produces a signature that fails verification once the payload is tampered with', () => {
    const { token } = signLicense({ sub: 'customer@example.com', days: 365, pem });
    const [, sigB64] = token.split('.');

    // Re-encode a different payload while keeping the original signature.
    const forged = Buffer.from(
      JSON.stringify({ v: 1, sub: 'attacker@evil.com', exp: 9999999999 }),
      'utf8',
    ).toString('base64url');
    const ok = cryptoVerify(
      null,
      Buffer.from(forged, 'ascii'),
      createPublicKey(publicPem),
      Buffer.from(sigB64, 'base64url'),
    );
    expect(ok).toBe(false);
  });

  it('mints an already-expired token when now + days lands in the past', () => {
    const now = new Date('2020-01-01T00:00:00Z');
    const { exp } = signLicense({ sub: 'customer@example.com', days: 1, pem, now });
    expect(exp).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  it('defaults `now` to the current time when omitted', () => {
    const before = Math.floor(Date.now() / 1000);
    const { iat } = signLicense({ sub: 'customer@example.com', days: 365, pem });
    const after = Math.floor(Date.now() / 1000);
    expect(iat).toBeGreaterThanOrEqual(before);
    expect(iat).toBeLessThanOrEqual(after);
  });

  it('rejects invalid inputs', () => {
    expect(() => signLicense({ sub: '', days: 365, pem })).toThrow(/sub/);
    expect(() => signLicense({ sub: 'x', days: 0, pem })).toThrow(/days/);
    expect(() => signLicense({ sub: 'x', days: -5, pem })).toThrow(/days/);
    expect(() => signLicense({ sub: 'x', days: Number.NaN, pem })).toThrow(/days/);
    expect(() => signLicense({ sub: 'x', days: 365, pem: '' })).toThrow(/key/);
  });
});
