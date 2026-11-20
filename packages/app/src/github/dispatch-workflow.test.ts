import { describe, expect, it, vi } from 'vitest';
import { dispatchWorkflow } from './dispatch-workflow.js';

function response(init: { ok: boolean; status: number; statusText: string }): Response {
  return {
    ok: init.ok,
    status: init.status,
    statusText: init.statusText,
    json: async () => {
      throw new Error('json() must not be called on a 204 dispatch response');
    },
  } as unknown as Response;
}

const TOKEN = 'ghs_secret_token';

describe('dispatchWorkflow', () => {
  it('POSTs to the dispatches endpoint and resolves on 204', async () => {
    const fetchImpl = vi.fn(async () => response({ ok: true, status: 204, statusText: 'No Content' }));

    await dispatchWorkflow({
      token: TOKEN,
      owner: 'acme',
      repo: 'web',
      workflowId: 1234,
      ref: 'main',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.github.com/repos/acme/web/actions/workflows/1234/dispatches');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
    expect(JSON.parse(init.body as string)).toEqual({ ref: 'main' });
  });

  it('includes inputs only when non-empty', async () => {
    const fetchImpl = vi.fn(async () => response({ ok: true, status: 204, statusText: 'No Content' }));

    await dispatchWorkflow({
      token: TOKEN,
      owner: 'acme',
      repo: 'web',
      workflowId: 'a11y.yml',
      ref: 'dev',
      inputs: { mode: 'check' },
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({ ref: 'dev', inputs: { mode: 'check' } });
  });

  it('honors a custom baseUrl (GHES)', async () => {
    const fetchImpl = vi.fn(async () => response({ ok: true, status: 204, statusText: 'No Content' }));

    await dispatchWorkflow({
      token: TOKEN,
      owner: 'o',
      repo: 'r',
      workflowId: 9,
      ref: 'main',
      baseUrl: 'https://ghe.example.com/api/v3',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://ghe.example.com/api/v3/repos/o/r/actions/workflows/9/dispatches',
    );
  });

  it.each([
    [404, 'Not Found'],
    [403, 'Forbidden'],
    [422, 'Unprocessable Entity'],
  ])('throws on %i without leaking the token', async (status, statusText) => {
    const fetchImpl = vi.fn(async () => response({ ok: false, status, statusText }));

    const promise = dispatchWorkflow({
      token: TOKEN,
      owner: 'acme',
      repo: 'web',
      workflowId: 1,
      ref: 'main',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    await expect(promise).rejects.toThrow(new RegExp(`${status} ${statusText}`));
    await expect(promise).rejects.not.toThrow(new RegExp(TOKEN));
  });
});
