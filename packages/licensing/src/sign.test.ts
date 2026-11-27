import { describe, it, expect } from 'vitest';
import {
  createPublicKey,
  generateKeyPairSync,
  sign as cryptoSign,
  createPrivateKey,
  verify as cryptoVerify,
} from 'node:crypto';
import { signLicense, signPayload, verifyPayload } from './sign.mjs';

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

  it('signLicense stays byte-identical to the inline primitive (no drift from the refactor)', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const { token } = signLicense({ sub: 'customer@example.com', days: 30, pem, now });
    const [payloadB64, sigB64] = token.split('.');
    // Reproduce the original inline signing exactly.
    const expected = cryptoSign(null, Buffer.from(payloadB64, 'ascii'), createPrivateKey(pem)).toString('base64url');
    expect(sigB64).toBe(expected);
  });
});

describe('signPayload / verifyPayload (shared Ed25519 primitive)', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

  it('round-trips: a signature over bytes verifies with the matching public key', () => {
    const bytes = Buffer.from('conformance-claim-canonical-body', 'utf8');
    const sig = signPayload(bytes, pem);
    expect(sig).not.toMatch(/[+/=]/); // base64url
    expect(verifyPayload(bytes, sig, publicPem)).toBe(true);
  });

  it('accepts a string message as ASCII bytes, matching a Buffer of the same ASCII', () => {
    const sigStr = signPayload('hello', pem);
    const sigBuf = signPayload(Buffer.from('hello', 'ascii'), pem);
    expect(sigStr).toBe(sigBuf);
    expect(verifyPayload('hello', sigStr, publicPem)).toBe(true);
  });

  it('fails verification when the message is tampered', () => {
    const sig = signPayload(Buffer.from('original', 'utf8'), pem);
    expect(verifyPayload(Buffer.from('tampered', 'utf8'), sig, publicPem)).toBe(false);
  });

  it('fails verification under a different (wrong) key', () => {
    const other = generateKeyPairSync('ed25519');
    const otherPub = other.publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const sig = signPayload('msg', pem);
    expect(verifyPayload('msg', sig, otherPub)).toBe(false);
  });

  it('returns false (never throws) on a malformed signature', () => {
    expect(verifyPayload('msg', 'not-a-real-signature', publicPem)).toBe(false);
  });

  it('returns false (never throws) when the public key is truthy but not a valid PEM', () => {
    // A non-empty garbage key passes the required-key guard, so createPublicKey
    // throws inside the try — the catch must swallow it and return false.
    expect(verifyPayload('msg', 'sig', 'not-a-valid-pem')).toBe(false);
  });

  it('requires keys', () => {
    expect(() => signPayload('x', '')).toThrow(/key/);
    expect(() => verifyPayload('x', 'sig', '')).toThrow(/key/);
  });
});
