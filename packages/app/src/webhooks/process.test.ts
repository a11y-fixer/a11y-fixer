import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { MemoryStore } from '../db/memory-store.js';
import { processWebhook } from './process.js';

const SECRET = 'whsec';

function sign(body: string): string {
  return `sha256=${createHmac('sha256', SECRET).update(body).digest('hex')}`;
}

function delivery(body: object, event: string, id: string) {
  const raw = JSON.stringify(body);
  return { secret: SECRET, rawBody: raw, eventName: event, deliveryId: id, signature: sign(raw) };
}

const installationCreated = {
  action: 'created',
  installation: { id: 100, account: { id: 7, login: 'acme' }, suspended_at: null },
  repositories: [{ id: 1, full_name: 'acme/web', private: false, default_branch: 'main' }],
};

describe('processWebhook', () => {
  it('verifies, routes, and persists an installation event', async () => {
    const store = new MemoryStore();
    const result = await processWebhook({ ...delivery(installationCreated, 'installation', 'd1'), store });
    expect(result).toBe('ok');
    expect(store.installations.has(100)).toBe(true);
    expect(store.repos.has(1)).toBe(true);
  });

  it('rejects an invalid signature before parsing or persisting', async () => {
    const store = new MemoryStore();
    const d = delivery(installationCreated, 'installation', 'd1');
    const result = await processWebhook({ ...d, signature: 'sha256=deadbeef', store });
    expect(result).toBe('invalid_signature');
    expect(store.installations.size).toBe(0);
    expect(store.deliveries.size).toBe(0);
  });

  it('skips a replayed delivery id (idempotency)', async () => {
    const store = new MemoryStore();
    const d = delivery(installationCreated, 'installation', 'dup');
    expect(await processWebhook({ ...d, store })).toBe('ok');
    expect(await processWebhook({ ...d, store })).toBe('duplicate');
    expect(store.installations.size).toBe(1);
  });

  it('returns bad_request for a missing event name or delivery id', async () => {
    const store = new MemoryStore();
    const raw = JSON.stringify(installationCreated);
    expect(
      await processWebhook({ secret: SECRET, rawBody: raw, eventName: null, deliveryId: 'd', signature: sign(raw), store }),
    ).toBe('bad_request');
    expect(
      await processWebhook({ secret: SECRET, rawBody: raw, eventName: 'installation', deliveryId: null, signature: sign(raw), store }),
    ).toBe('bad_request');
  });

  it('returns bad_request for an unparseable body with a valid signature', async () => {
    const store = new MemoryStore();
    const raw = '{not json';
    const result = await processWebhook({
      secret: SECRET,
      rawBody: raw,
      eventName: 'installation',
      deliveryId: 'd',
      signature: sign(raw),
      store,
    });
    expect(result).toBe('bad_request');
  });

  it('routes an installation_repositories delivery to its handler', async () => {
    const store = new MemoryStore();
    const body = {
      action: 'added',
      installation: { id: 100, account: { id: 7, login: 'acme' }, suspended_at: null },
      repository_selection: 'selected',
      repositories_added: [{ id: 2, full_name: 'acme/api', private: true }],
    };
    const result = await processWebhook({ ...delivery(body, 'installation_repositories', 'd2'), store });
    expect(result).toBe('ok');
    expect(store.repos.has(2)).toBe(true);
  });

  it('acknowledges an unknown event without persisting anything', async () => {
    const store = new MemoryStore();
    const result = await processWebhook({ ...delivery({ action: 'x' }, 'star', 'd9'), store });
    expect(result).toBe('ok');
    expect(store.installations.size).toBe(0);
  });
});
