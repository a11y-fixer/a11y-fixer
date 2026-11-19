import { describe, it, expect } from 'vitest';
import { createPublicKey, generateKeyPairSync, verify as cryptoVerify } from 'node:crypto';
import { verifyLicenseKey } from './license.js';
// The real signing path the product ships: scripts/issue-license.mjs re-exports
// @a11y-fixer/licensing's `signLicense` (the single source of truth). Testing
// the Action's verifier against THIS — not a re-implementation — means any drift
// in the shared minting algorithm (payload shape, encoding, signing bytes) fails
// here instead of silently shipping tokens the Action rejects. The exhaustive
// format/behavior cases live in packages/licensing/src/sign.test.ts; this file
// pins the cross-boundary contract between minting and the Action's offline verify.
import { signLicense } from '../../../scripts/issue-license.mjs';

describe('minting ↔ Action verify contract', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();

  it('mints a token whose shape passes every structural gate verifyLicenseKey applies', () => {
    const { token } = signLicense({ sub: 'customer@example.com', days: 365, pem });
    const [payloadB64, sigB64] = token.split('.');

    // Two segments, base64url, no padding — the wire format the verifier splits on.
    expect(token.split('.')).toHaveLength(2);
    expect(token).not.toMatch(/[+/=]/);

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    expect(payload.v === 1 && typeof payload.sub === 'string' && typeof payload.exp === 'number').toBe(true);
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));

    // Signs the ASCII bytes of the payload segment (what license.ts verifies).
    const ok = cryptoVerify(
      null,
      Buffer.from(payloadB64, 'ascii'),
      createPublicKey(publicPem),
      Buffer.from(sigB64, 'base64url'),
    );
    expect(ok).toBe(true);
  });

  it('is rejected by the production-pinned verifier when signed with a foreign key', () => {
    // Confirms verifyLicenseKey trusts the signature, not just the shape: a
    // well-formed token signed with a throwaway key must not validate against
    // the Action's embedded production public key.
    const { token } = signLicense({ sub: 'customer@example.com', days: 365, pem });
    expect(verifyLicenseKey(token).valid).toBe(false);
  });
});
