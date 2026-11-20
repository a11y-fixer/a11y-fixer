import { describe, expect, it, vi } from 'vitest';
import { listWorkflows, selectA11yWorkflow, type WorkflowSummary } from './list-workflows.js';

function jsonResponse(body: unknown, init: { ok: boolean; status: number; statusText: string }): Response {
  return {
    ok: init.ok,
    status: init.status,
    statusText: init.statusText,
    json: async () => body,
  } as Response;
}

const wf = (id: number, name: string, path: string): WorkflowSummary => ({
  id,
  name,
  path,
  state: 'active',
});

describe('listWorkflows', () => {
  it('fetches and parses the repo workflows', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(
        {
          workflows: [
            { id: 1, name: 'a11y-fixer demo', path: '.github/workflows/a11y-demo.yml', state: 'active' },
            { id: 2, name: 'CI', path: '.github/workflows/ci.yml', state: 'active' },
            { id: 3, name: 'bad' }, // dropped: wrong shape
          ],
        },
        { ok: true, status: 200, statusText: 'OK' },
      ),
    );

    const result = await listWorkflows({
      token: 'ghs_x',
      owner: 'acme',
      repo: 'web',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result).toHaveLength(2);
    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/acme/web/actions/workflows?per_page=100',
    );
  });

  it('throws on a non-2xx without leaking the token', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({}, { ok: false, status: 403, statusText: 'Forbidden' }),
    );
    const promise = listWorkflows({
      token: 'ghs_secret',
      owner: 'o',
      repo: 'r',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    await expect(promise).rejects.toThrow(/403 Forbidden/);
    await expect(promise).rejects.not.toThrow(/ghs_secret/);
  });

  it('returns [] when the body has no workflows array', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({}, { ok: true, status: 200, statusText: 'OK' }));
    const result = await listWorkflows({
      token: 't',
      owner: 'o',
      repo: 'r',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result).toEqual([]);
  });
});

describe('selectA11yWorkflow', () => {
  it('selects the single matching workflow by name', () => {
    const selection = selectA11yWorkflow([wf(1, 'a11y-fixer demo', 'x.yml'), wf(2, 'CI', 'ci.yml')]);
    expect(selection).toEqual({ workflow: wf(1, 'a11y-fixer demo', 'x.yml') });
  });

  it('matches by file path when the name does not', () => {
    const selection = selectA11yWorkflow([wf(5, 'Accessibility', '.github/workflows/a11y.yml')]);
    expect(selection).toEqual({ workflow: wf(5, 'Accessibility', '.github/workflows/a11y.yml') });
  });

  it('returns none when nothing matches', () => {
    expect(selectA11yWorkflow([wf(2, 'CI', 'ci.yml')])).toEqual({ workflow: null, reason: 'none' });
  });

  it('returns ambiguous when more than one matches', () => {
    const selection = selectA11yWorkflow([
      wf(1, 'a11y-fixer', 'a.yml'),
      wf(2, 'a11y check', 'b.yml'),
    ]);
    expect(selection).toEqual({ workflow: null, reason: 'ambiguous' });
  });
});
