import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { handleWebhookRequest, resultToStatus } from './webhook-request.js';
import { MemoryStore } from '../db/memory-store.js';

const SECRET = 'test-webhook-secret';

function sign(body: string): string {
  return `sha256=${createHmac('sha256', SECRET).update(body).digest('hex')}`;
}

function request(body: string, headers: Record<string, string>): Request {
  return new Request('https://app.example.com/api/webhooks/github', {
    method: 'POST',
    body,
    headers,
  });
}

describe('resultToStatus', () => {
  it('maps each result to its status', () => {
    expect(resultToStatus('ok')).toBe(202);
    expect(resultToStatus('duplicate')).toBe(200);
    expect(resultToStatus('invalid_signature')).toBe(401);
    expect(resultToStatus('bad_request')).toBe(400);
  });
});

describe('handleWebhookRequest', () => {
  const body = JSON.stringify({ action: 'created', installation: { id: 1, account: { login: 'acme', id: 9 } } });

  function validHeaders(delivery = 'd1'): Record<string, string> {
    return {
      'content-type': 'application/json',
      'x-github-event': 'installation',
      'x-github-delivery': delivery,
      'x-hub-signature-256': sign(body),
    };
  }

  it('accepts a verified delivery with 202', async () => {
    const store = new MemoryStore();
    const res = await handleWebhookRequest(request(body, validHeaders()), store, SECRET);
    expect(res.status).toBe(202);
    expect(store.deliveries.has('d1')).toBe(true);
  });

  it('returns 200 on a replayed delivery id', async () => {
    const store = new MemoryStore();
    await handleWebhookRequest(request(body, validHeaders('dup')), store, SECRET);
    const res = await handleWebhookRequest(request(body, validHeaders('dup')), store, SECRET);
    expect(res.status).toBe(200);
  });

  it('rejects a forged signature with 401 and records nothing', async () => {
    const store = new MemoryStore();
    const headers = { ...validHeaders(), 'x-hub-signature-256': 'sha256=deadbeef' };
    const res = await handleWebhookRequest(request(body, headers), store, SECRET);
    expect(res.status).toBe(401);
    expect(store.deliveries.size).toBe(0);
  });

  it('returns 400 when the delivery id header is missing', async () => {
    const store = new MemoryStore();
    const headers = validHeaders();
    delete headers['x-github-delivery'];
    const res = await handleWebhookRequest(request(body, headers), store, SECRET);
    expect(res.status).toBe(400);
  });

  it('returns 400 on an unparseable (but correctly signed) body', async () => {
    const store = new MemoryStore();
    const bad = 'not json';
    const headers = {
      'x-github-event': 'installation',
      'x-github-delivery': 'd2',
      'x-hub-signature-256': `sha256=${createHmac('sha256', SECRET).update(bad).digest('hex')}`,
    };
    const res = await handleWebhookRequest(request(bad, headers), store, SECRET);
    expect(res.status).toBe(400);
  });
});
