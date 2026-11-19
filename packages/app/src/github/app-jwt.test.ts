import { createVerify, generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { CLOCK_SKEW_SECONDS, MAX_JWT_LIFETIME_SECONDS, createAppJwt } from './app-jwt.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const privatePem = privateKey.export({ type: 'pkcs1', format: 'pem' }).toString();

function decodeSegment(seg: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(seg, 'base64url').toString('utf8'));
}

describe('createAppJwt', () => {
  const now = new Date('2026-01-01T00:00:00Z');

  it('produces a three-part JWT with an RS256 header', () => {
    const jwt = createAppJwt({ appId: 12345, privateKey: privatePem, now });
    const parts = jwt.split('.');
    expect(parts).toHaveLength(3);
    expect(decodeSegment(parts[0])).toEqual({ alg: 'RS256', typ: 'JWT' });
  });

  it('sets iss to the app id as a string, with skew-adjusted iat and 10m exp', () => {
    const jwt = createAppJwt({ appId: 12345, privateKey: privatePem, now });
    const payload = decodeSegment(jwt.split('.')[1]);
    const nowSec = Math.floor(now.getTime() / 1000);
    expect(payload.iss).toBe('12345');
    expect(payload.iat).toBe(nowSec - CLOCK_SKEW_SECONDS);
    expect(payload.exp).toBe(nowSec - CLOCK_SKEW_SECONDS + MAX_JWT_LIFETIME_SECONDS);
  });

  it('signs so the App public key verifies the token', () => {
    const jwt = createAppJwt({ appId: 'Iv1.abc', privateKey: privatePem, now });
    const [header, payload, signature] = jwt.split('.');
    const verifier = createVerify('RSA-SHA256').update(`${header}.${payload}`);
    expect(verifier.verify(publicKey, Buffer.from(signature, 'base64url'))).toBe(true);
  });

  it('throws without a private key', () => {
    expect(() => createAppJwt({ appId: 1, privateKey: '' })).toThrow(/private key/i);
  });
});
