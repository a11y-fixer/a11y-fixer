import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { getInstallationToken } from './installation-token.js';

const privatePem = generateKeyPairSync('rsa', { modulusLength: 2048 })
  .privateKey.export({ type: 'pkcs1', format: 'pem' })
  .toString();

function jsonResponse(body: unknown, init: { ok: boolean; status: number; statusText: string }): Response {
  return {
    ok: init.ok,
    status: init.status,
    statusText: init.statusText,
    json: async () => body,
  } as Response;
}

describe('getInstallationToken', () => {
  it('mints a JWT and returns the installation token + expiry', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(
        { token: 'ghs_secret', expires_at: '2026-01-01T01:00:00Z' },
        { ok: true, status: 201, statusText: 'Created' },
      ),
    );

    const result = await getInstallationToken({
      appId: 42,
      privateKey: privatePem,
      installationId: 999,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result).toEqual({ token: 'ghs_secret', expiresAt: '2026-01-01T01:00:00Z' });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.github.com/app/installations/999/access_tokens');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toMatch(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/);
  });

  it('honors a custom baseUrl (GHES)', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ token: 't', expires_at: 'x' }, { ok: true, status: 201, statusText: 'Created' }),
    );
    await getInstallationToken({
      appId: 1,
      privateKey: privatePem,
      installationId: 7,
      baseUrl: 'https://ghe.example.com/api/v3',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(fetchImpl.mock.calls[0][0]).toBe('https://ghe.example.com/api/v3/app/installations/7/access_tokens');
  });

  it('throws on a non-2xx response without leaking the JWT', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({}, { ok: false, status: 401, statusText: 'Unauthorized' }),
    );
    await expect(
      getInstallationToken({
        appId: 1,
        privateKey: privatePem,
        installationId: 7,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/401 Unauthorized/);
  });
});
