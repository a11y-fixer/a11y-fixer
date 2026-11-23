// Tests for the verdict route shell: the security-relevant wiring above the
// unit-tested cores (CSRF same-origin guard, auth, 404-not-403 enumeration
// defense, cross-tenant audit-ownership 404, verdict allow-list validation,
// 303 redirect). Mirrors ../../../scan/route.test.ts: the pure cores
// (isSameOrigin, authorizeInstallationView, auditBelongsTo, SELECTABLE_VERDICTS)
// run for real; only the env/auth/store/orchestrator boundaries are mocked.
//
// Value: protects=the verdict route's security wiring (CSRF 403, authz and
// cross-tenant 404s, allow-list 400, success 303); fails_when=the same-origin
// guard, installation authz, auditBelongsTo ownership check or verdict
// allow-list is removed or inverted; why_new=the route is new on this branch
// and no test exercised its shell (only the orchestrator core was covered);
// seam=none; no_claim=does not prove recordHumanVerdict's persistence (mocked);
// that is covered by audit-service.test.ts.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditRecord } from '../../../../../../../src/db/store.js';

const { getSignedInUser, listInstallationsForUser, getAudit, recordHumanVerdict } = vi.hoisted(() => ({
  getSignedInUser: vi.fn(),
  listInstallationsForUser: vi.fn(),
  getAudit: vi.fn(),
  recordHumanVerdict: vi.fn(),
}));

vi.mock('../../../../../../lib/env.js', () => ({
  env: { appBaseUrl: () => 'https://app.example.com' },
}));
vi.mock('../../../../../../lib/auth.js', () => ({ getSignedInUser }));
vi.mock('../../../../../../lib/supabase.js', () => ({
  serviceRoleStore: () => ({ listInstallationsForUser, getAudit }),
}));
vi.mock('../../../../../../../src/conformance/audit-service.js', () => ({ recordHumanVerdict }));

import { POST } from './route.js';

const params = (installationId: string, auditId: string) => ({
  params: Promise.resolve({ installationId, auditId }),
});

function auditRecord(installationId: number): AuditRecord {
  return {
    id: 'a1',
    repoId: 10,
    installationId,
    headSha: 'abc',
    basisCheckRunId: 500,
    status: 'in_review',
    createdAt: 't',
    publishedAt: null,
  };
}

function postRequest(opts: { origin?: string; fields?: Record<string, string> } = {}): Request {
  const form = new FormData();
  for (const [k, v] of Object.entries(opts.fields ?? {})) form.append(k, v);
  const headers: Record<string, string> = {};
  if (opts.origin !== undefined) headers['origin'] = opts.origin;
  return new Request('https://app.example.com/api/installations/42/audits/a1/verdict', {
    method: 'POST',
    headers,
    body: form,
  });
}

describe('POST /api/installations/[installationId]/audits/[auditId]/verdict', () => {
  beforeEach(() => {
    getSignedInUser.mockResolvedValue({ id: 'user-1' });
    listInstallationsForUser.mockResolvedValue([42]);
    getAudit.mockResolvedValue(auditRecord(42));
    recordHumanVerdict.mockResolvedValue(undefined);
  });
  afterEach(() => vi.clearAllMocks());

  it('returns 403 when the request is cross-origin (CSRF guard)', async () => {
    const res = await POST(postRequest({ origin: 'https://evil.example.com' }), params('42', 'a1'));
    expect(res.status).toBe(403);
    expect(getSignedInUser).not.toHaveBeenCalled();
  });

  it('returns 404 (not 403) when the user may not view the installation', async () => {
    listInstallationsForUser.mockResolvedValue([99]); // 42 not visible
    const res = await POST(
      postRequest({ origin: 'https://app.example.com', fields: { wcagId: '1.1.1', verdict: 'supports' } }),
      params('42', 'a1'),
    );
    expect(res.status).toBe(404);
    expect(recordHumanVerdict).not.toHaveBeenCalled();
  });

  it('returns 404 when the audit belongs to a different installation (cross-tenant guard)', async () => {
    getAudit.mockResolvedValue(auditRecord(999)); // audit owned by another installation
    const res = await POST(
      postRequest({ origin: 'https://app.example.com', fields: { wcagId: '1.1.1', verdict: 'supports' } }),
      params('42', 'a1'),
    );
    expect(res.status).toBe(404);
    expect(recordHumanVerdict).not.toHaveBeenCalled();
  });

  it('returns 400 for a verdict value outside the allow-list', async () => {
    const res = await POST(
      postRequest({ origin: 'https://app.example.com', fields: { wcagId: '1.1.1', verdict: 'totally_supports' } }),
      params('42', 'a1'),
    );
    expect(res.status).toBe(400);
    expect(recordHumanVerdict).not.toHaveBeenCalled();
  });

  it('returns 400 for a wcagId that is not a real catalog criterion', async () => {
    const res = await POST(
      postRequest({ origin: 'https://app.example.com', fields: { wcagId: '9.9.9', verdict: 'supports' } }),
      params('42', 'a1'),
    );
    expect(res.status).toBe(400);
    expect(recordHumanVerdict).not.toHaveBeenCalled();
  });

  it('returns 409 and does not mutate when the audit is already published', async () => {
    getAudit.mockResolvedValue({ ...auditRecord(42), status: 'published', publishedAt: 't2' });
    const res = await POST(
      postRequest({ origin: 'https://app.example.com', fields: { wcagId: '1.1.1', verdict: 'supports' } }),
      params('42', 'a1'),
    );
    expect(res.status).toBe(409);
    expect(recordHumanVerdict).not.toHaveBeenCalled();
  });

  it('records the verdict and 303-redirects to the criterion anchor on success', async () => {
    const res = await POST(
      postRequest({
        origin: 'https://app.example.com',
        fields: { wcagId: '1.4.3', verdict: 'partially_supports', remarks: 'needs work' },
      }),
      params('42', 'a1'),
    );
    expect(recordHumanVerdict).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        auditId: 'a1',
        wcagId: '1.4.3',
        verdict: 'partially_supports',
        remarks: 'needs work',
        authorId: 'user-1',
      }),
      expect.anything(),
    );
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(
      'https://app.example.com/dashboard/42/audits/a1#sc-143',
    );
  });
});
