// Tests for the scan-trigger route shell: the security-relevant wiring that
// sits above the unit-tested cores (id validation, CSRF same-origin guard,
// auth, 404-not-403 enumeration defense, repoId parsing, 303 redirect). The
// pure cores (isSameOrigin, authorizeInstallationView) are used for real; only
// the env/auth/store/orchestrator boundaries are mocked.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getSignedInUser, listInstallationsForUser, dispatchInstallationScan } = vi.hoisted(() => ({
  getSignedInUser: vi.fn(),
  listInstallationsForUser: vi.fn(),
  dispatchInstallationScan: vi.fn(),
}));

vi.mock('../../../../lib/env.js', () => ({
  env: {
    appBaseUrl: () => 'https://app.example.com',
    githubAppId: () => '123',
    githubAppPrivateKey: () => 'pk',
  },
}));
vi.mock('../../../../lib/auth.js', () => ({ getSignedInUser }));
vi.mock('../../../../lib/supabase.js', () => ({
  serviceRoleStore: () => ({ listInstallationsForUser }),
}));
vi.mock('../../../../../src/github/scan-orchestrator.js', () => ({ dispatchInstallationScan }));

import { POST } from './route.js';

const params = (installationId: string) => ({ params: Promise.resolve({ installationId }) });

function postRequest(opts: { origin?: string; repoIds?: string[] } = {}): Request {
  const form = new FormData();
  for (const id of opts.repoIds ?? []) form.append('repoId', id);
  const headers: Record<string, string> = {};
  if (opts.origin !== undefined) headers['origin'] = opts.origin;
  return new Request('https://app.example.com/api/installations/42/scan', {
    method: 'POST',
    headers,
    body: form,
  });
}

describe('POST /api/installations/[installationId]/scan', () => {
  beforeEach(() => {
    getSignedInUser.mockResolvedValue({ id: 'user-1', githubToken: 'gh' });
    listInstallationsForUser.mockResolvedValue([42]);
    dispatchInstallationScan.mockResolvedValue({ dispatched: 1, requested: 1 });
  });
  afterEach(() => vi.clearAllMocks());

  it('returns 404 for a non-integer installation id (before any other work)', async () => {
    const res = await POST(postRequest({ origin: 'https://app.example.com' }), params('not-a-number'));
    expect(res.status).toBe(404);
    expect(getSignedInUser).not.toHaveBeenCalled();
  });

  it('returns 403 when the request is cross-origin (CSRF guard)', async () => {
    const res = await POST(postRequest({ origin: 'https://evil.example.com' }), params('42'));
    expect(res.status).toBe(403);
    expect(getSignedInUser).not.toHaveBeenCalled();
  });

  it('returns 403 when the Origin header is missing', async () => {
    const res = await POST(postRequest({}), params('42'));
    expect(res.status).toBe(403);
  });

  it('returns 401 when there is no signed-in user', async () => {
    getSignedInUser.mockResolvedValue(null);
    const res = await POST(postRequest({ origin: 'https://app.example.com' }), params('42'));
    expect(res.status).toBe(401);
    expect(dispatchInstallationScan).not.toHaveBeenCalled();
  });

  it('returns 404 (not 403) when the user may not view the installation', async () => {
    listInstallationsForUser.mockResolvedValue([99]); // 42 not visible
    const res = await POST(postRequest({ origin: 'https://app.example.com' }), params('42'));
    expect(res.status).toBe(404);
    expect(dispatchInstallationScan).not.toHaveBeenCalled();
  });

  it('dispatches the whole installation (no repoId scope) and 303-redirects to the dashboard', async () => {
    const res = await POST(postRequest({ origin: 'https://app.example.com' }), params('42'));

    expect(dispatchInstallationScan).toHaveBeenCalledWith(expect.objectContaining({ installationId: 42, repoIds: undefined }));
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://app.example.com/dashboard/42?scan=1/1');
  });

  it('parses and filters repoId form fields, passing only valid integers', async () => {
    dispatchInstallationScan.mockResolvedValue({ dispatched: 2, requested: 2 });
    const res = await POST(
      postRequest({ origin: 'https://app.example.com', repoIds: ['10', 'bad', '11'] }),
      params('42'),
    );

    expect(dispatchInstallationScan).toHaveBeenCalledWith(expect.objectContaining({ repoIds: [10, 11] }));
    expect(res.headers.get('location')).toBe('https://app.example.com/dashboard/42?scan=2/2');
  });
});
