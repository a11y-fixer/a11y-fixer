// Tests for the publish route shell: the security wiring above the publishAudit
// core (CSRF same-origin 403, auth, 404-not-403 enumeration defense, cross-tenant
// audit-ownership 404) and the success path (publish → ?published=1 → freeze a
// revision). Mirrors ../verdict/route.test.ts: the pure guards run for real; only
// env/auth/store/orchestrator boundaries are mocked.
//
// Value: protects=the publish route's security wiring and the publish→redirect→
// revision path; fails_when=the same-origin guard, installation authz or
// auditBelongsTo ownership check is removed or inverted, or the published redirect
// changes; why_new=the publish route is new on this branch and had no shell test
// (only publishAudit's core was covered); seam=none; no_claim=does not prove the
// render-time Supports downgrade (that is covered by reconcile/audit-document tests).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditRecord } from '../../../../../../../src/db/store.js';

const { getSignedInUser, listInstallationsForUser, getAudit, publishAudit, createRevisionForAudit } =
  vi.hoisted(() => ({
    getSignedInUser: vi.fn(),
    listInstallationsForUser: vi.fn(),
    getAudit: vi.fn(),
    publishAudit: vi.fn(),
    createRevisionForAudit: vi.fn(),
  }));

vi.mock('../../../../../../lib/env.js', () => ({
  env: { appBaseUrl: () => 'https://app.example.com' },
}));
vi.mock('../../../../../../lib/auth.js', () => ({ getSignedInUser }));
vi.mock('../../../../../../lib/supabase.js', () => ({
  serviceRoleStore: () => ({ listInstallationsForUser, getAudit }),
}));
vi.mock('../../../../../../../src/conformance/audit-service.js', () => ({ publishAudit }));
vi.mock('../../../../../../../src/conformance/documents/audit-document.js', () => ({
  createRevisionForAudit,
}));

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

function postRequest(origin?: string): Request {
  const headers: Record<string, string> = {};
  if (origin !== undefined) headers['origin'] = origin;
  return new Request('https://app.example.com/api/installations/42/audits/a1/publish', {
    method: 'POST',
    headers,
  });
}

describe('POST /api/installations/[installationId]/audits/[auditId]/publish', () => {
  beforeEach(() => {
    getSignedInUser.mockResolvedValue({ id: 'user-1' });
    listInstallationsForUser.mockResolvedValue([42]);
    getAudit.mockResolvedValue(auditRecord(42));
    publishAudit.mockResolvedValue({ published: true });
    createRevisionForAudit.mockResolvedValue(null);
  });
  afterEach(() => vi.clearAllMocks());

  it('returns 403 when the request is cross-origin (CSRF guard)', async () => {
    const res = await POST(postRequest('https://evil.example.com'), params('42', 'a1'));
    expect(res.status).toBe(403);
    expect(getSignedInUser).not.toHaveBeenCalled();
  });

  it('returns 404 (not 403) when the user may not view the installation', async () => {
    listInstallationsForUser.mockResolvedValue([99]); // 42 not visible
    const res = await POST(postRequest('https://app.example.com'), params('42', 'a1'));
    expect(res.status).toBe(404);
    expect(publishAudit).not.toHaveBeenCalled();
  });

  it('returns 404 when the audit belongs to a different installation (cross-tenant guard)', async () => {
    getAudit.mockResolvedValue(auditRecord(999));
    const res = await POST(postRequest('https://app.example.com'), params('42', 'a1'));
    expect(res.status).toBe(404);
    expect(publishAudit).not.toHaveBeenCalled();
  });

  it('303-redirects with ?published=1 when the honesty gate passes', async () => {
    const res = await POST(postRequest('https://app.example.com'), params('42', 'a1'));
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(
      'https://app.example.com/dashboard/42/audits/a1?published=1',
    );
  });

  it('freezes an immutable revision when the publish succeeds', async () => {
    await POST(postRequest('https://app.example.com'), params('42', 'a1'));
    expect(createRevisionForAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'a1',
      expect.objectContaining({ newSlug: expect.any(Function) }),
    );
  });

  it('still 303-redirects published (not 500) when the revision snapshot write fails', async () => {
    // The publish already committed; a revision-write failure must not surface as a
    // 500 that misleads the user into thinking publish failed.
    createRevisionForAudit.mockRejectedValue(new Error('db down'));
    const res = await POST(postRequest('https://app.example.com'), params('42', 'a1'));
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(
      'https://app.example.com/dashboard/42/audits/a1?published=1',
    );
  });
});
