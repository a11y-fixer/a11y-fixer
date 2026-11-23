// Tests for the create-audit route shell: the security wiring (CSRF same-origin
// 403, auth, 404-not-403 enumeration defense), repoId validation (400), and the
// no-scan vs created redirect branch. Mirrors the sibling verdict/publish route
// tests: latestScanByRepo runs for real; only env/auth/store/orchestrator
// boundaries are mocked.
//
// Value: protects=the create-audit route's security wiring, repoId validation,
// and the no-scan vs created redirect; fails_when=the same-origin guard or
// installation authz is removed or inverted, repoId validation is dropped, or a
// cross-tenant repoId (no installation-scoped scan) is allowed to draft instead
// of redirecting; why_new=the route is new on this branch and had no shell test
// (only createDraftAudit's core was covered); seam=none; no_claim=does not prove
// createDraftAudit's derivation (mocked); that is covered by audit-service.test.ts.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getSignedInUser, listInstallationsForUser, listScansByInstallation, createDraftAudit } =
  vi.hoisted(() => ({
    getSignedInUser: vi.fn(),
    listInstallationsForUser: vi.fn(),
    listScansByInstallation: vi.fn(),
    createDraftAudit: vi.fn(),
  }));

vi.mock('../../../../lib/env.js', () => ({
  env: { appBaseUrl: () => 'https://app.example.com' },
}));
vi.mock('../../../../lib/auth.js', () => ({ getSignedInUser }));
vi.mock('../../../../lib/supabase.js', () => ({
  serviceRoleStore: () => ({ listInstallationsForUser, listScansByInstallation }),
}));
vi.mock('../../../../../src/conformance/audit-service.js', () => ({ createDraftAudit }));

import { POST } from './route.js';

const params = (installationId: string) => ({ params: Promise.resolve({ installationId }) });

// A scan the repo's latest-scan lookup (latestScanByRepo) will resolve for repo 10.
const scan = { repoId: 10, checkRunId: 500, headSha: 'abc', createdAt: '2026-01-01T00:00:00Z' };

function postRequest(opts: { origin?: string; repoId?: string } = {}): Request {
  const form = new FormData();
  if (opts.repoId !== undefined) form.append('repoId', opts.repoId);
  const headers: Record<string, string> = {};
  if (opts.origin !== undefined) headers['origin'] = opts.origin;
  return new Request('https://app.example.com/api/installations/42/audits', {
    method: 'POST',
    headers,
    body: form,
  });
}

describe('POST /api/installations/[installationId]/audits', () => {
  beforeEach(() => {
    getSignedInUser.mockResolvedValue({ id: 'user-1' });
    listInstallationsForUser.mockResolvedValue([42]);
    listScansByInstallation.mockResolvedValue([scan]);
    createDraftAudit.mockResolvedValue({ id: 'new-audit' });
  });
  afterEach(() => vi.clearAllMocks());

  it('returns 403 when the request is cross-origin (CSRF guard)', async () => {
    const res = await POST(postRequest({ origin: 'https://evil.example.com', repoId: '10' }), params('42'));
    expect(res.status).toBe(403);
    expect(getSignedInUser).not.toHaveBeenCalled();
  });

  it('returns 404 (not 403) when the user may not view the installation', async () => {
    listInstallationsForUser.mockResolvedValue([99]);
    const res = await POST(postRequest({ origin: 'https://app.example.com', repoId: '10' }), params('42'));
    expect(res.status).toBe(404);
    expect(createDraftAudit).not.toHaveBeenCalled();
  });

  it('returns 400 when repoId is not a number', async () => {
    const res = await POST(postRequest({ origin: 'https://app.example.com', repoId: 'abc' }), params('42'));
    expect(res.status).toBe(400);
    expect(createDraftAudit).not.toHaveBeenCalled();
  });

  it('303-redirects with ?error=no-scan when the repo has no scan to draft from', async () => {
    const res = await POST(postRequest({ origin: 'https://app.example.com', repoId: '77' }), params('42'));
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://app.example.com/dashboard/42/audits?error=no-scan');
    expect(createDraftAudit).not.toHaveBeenCalled();
  });

  it('creates the draft and 303-redirects to the new audit on success', async () => {
    const res = await POST(postRequest({ origin: 'https://app.example.com', repoId: '10' }), params('42'));
    expect(createDraftAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ repoId: 10, installationId: 42, headSha: 'abc', checkRunId: 500 }),
      expect.anything(),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://app.example.com/dashboard/42/audits/new-audit');
  });
});
