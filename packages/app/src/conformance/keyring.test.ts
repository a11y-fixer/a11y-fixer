import { describe, it, expect } from 'vitest';
import { conformanceSigningConfigFromEnv, conformanceKeyringFromEnv } from './keyring.js';

describe('conformanceSigningConfigFromEnv', () => {
  it('returns undefined when either key or id is missing (ledger off)', () => {
    expect(conformanceSigningConfigFromEnv({})).toBeUndefined();
    expect(conformanceSigningConfigFromEnv({ CONFORMANCE_SIGNING_KEY: 'pem' })).toBeUndefined();
    expect(conformanceSigningConfigFromEnv({ CONFORMANCE_KEY_ID: 'k' })).toBeUndefined();
  });

  it('returns the config when both are present', () => {
    expect(
      conformanceSigningConfigFromEnv({ CONFORMANCE_SIGNING_KEY: 'pem', CONFORMANCE_KEY_ID: 'conformance-2026' }),
    ).toEqual({ signingKeyPem: 'pem', keyId: 'conformance-2026' });
  });
});

describe('conformanceKeyringFromEnv', () => {
  it('is empty when nothing is configured (verification fails closed)', () => {
    expect(conformanceKeyringFromEnv({})).toEqual({});
  });

  it('builds a single-key ring from KEY_ID + PUBLIC_KEY', () => {
    expect(
      conformanceKeyringFromEnv({ CONFORMANCE_KEY_ID: 'k1', CONFORMANCE_PUBLIC_KEY: 'pub1' }),
    ).toEqual({ k1: 'pub1' });
  });

  it('parses a full multi-key ring from CONFORMANCE_KEYRING JSON', () => {
    const ring = conformanceKeyringFromEnv({
      CONFORMANCE_KEYRING: JSON.stringify({ k1: 'pub1', k2: 'pub2' }),
    });
    expect(ring).toEqual({ k1: 'pub1', k2: 'pub2' });
  });

  it('falls back to the single key when the ring JSON is malformed', () => {
    expect(
      conformanceKeyringFromEnv({
        CONFORMANCE_KEYRING: '{bad json',
        CONFORMANCE_KEY_ID: 'k1',
        CONFORMANCE_PUBLIC_KEY: 'pub1',
      }),
    ).toEqual({ k1: 'pub1' });
  });

  it('ignores non-string values in the ring JSON', () => {
    expect(
      conformanceKeyringFromEnv({ CONFORMANCE_KEYRING: JSON.stringify({ k1: 'pub1', bad: 42 }) }),
    ).toEqual({ k1: 'pub1' });
  });
});
