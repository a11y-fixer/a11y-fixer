import { describe, expect, it } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { MemoryStore } from '../db/memory-store.js';
import { getOrCreateInstallationLicense, RENEW_WITHIN_DAYS } from './provision.js';

const { privateKey: signingKeyPem } = generateKeyPairSync('ed25519', {
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});

const DAY_MS = 86_400_000;

describe('getOrCreateInstallationLicense', () => {
  it('mints and persists a license when none exists', async () => {
    const store = new MemoryStore();
    const rec = await getOrCreateInstallationLicense(store, { installationId: 7, account: 'acme', signingKeyPem });
    expect(rec.installationId).toBe(7);
    expect(rec.sub).toBe('acme');
    expect(await store.getLicense(7)).toEqual(rec);
  });

  it('returns the stored key unchanged while it is still valid', async () => {
    const store = new MemoryStore();
    const first = await getOrCreateInstallationLicense(store, { installationId: 7, account: 'acme', signingKeyPem });
    const second = await getOrCreateInstallationLicense(store, { installationId: 7, account: 'acme', signingKeyPem });
    expect(second.token).toBe(first.token);
  });

  it('re-mints when the stored key is within the renewal window', async () => {
    const store = new MemoryStore();
    const now = new Date('2026-01-01T00:00:00.000Z');
    const first = await getOrCreateInstallationLicense(store, { installationId: 7, account: 'acme', signingKeyPem, now });

    const nearExpiry = new Date(new Date(first.expiresAt).getTime() - (RENEW_WITHIN_DAYS - 1) * DAY_MS);
    const renewed = await getOrCreateInstallationLicense(store, {
      installationId: 7,
      account: 'acme',
      signingKeyPem,
      now: nearExpiry,
    });

    expect(renewed.token).not.toBe(first.token);
    expect(renewed.issuedAt).toBe(nearExpiry.toISOString());
    expect(await store.getLicense(7)).toEqual(renewed);
  });
});
