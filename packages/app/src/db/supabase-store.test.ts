import { beforeEach, describe, expect, it } from 'vitest';
import { SupabaseStore, type SupabaseLike } from './supabase-store.js';

// A recording fake for the slice of supabase-js the store uses. Each call is
// pushed to `calls` so tests can assert the exact table, operation, payload,
// onConflict target, and filter the store sends. Reads return `selectData`;
// any write/read returns `error` when set, so we can exercise throwOn and the
// recordEventOnce idempotency gate (a duplicate insert surfaces as an error).
interface RecordedCall {
  table: string;
  op: 'upsert' | 'insert' | 'update' | 'delete' | 'select';
  values?: unknown;
  onConflict?: string;
  filterColumn?: string;
  filterValue?: unknown;
  filterIn?: unknown[];
  selectColumns?: string;
}

class FakeSupabase implements SupabaseLike {
  calls: RecordedCall[] = [];
  error: unknown = null;
  selectData: unknown[] | null = null;

  from(table: string) {
    const record = (call: Omit<RecordedCall, 'table'>) => {
      this.calls.push({ table, ...call });
    };
    return {
      upsert: async (values: unknown, options?: { onConflict?: string }) => {
        record({ op: 'upsert', values, onConflict: options?.onConflict });
        return { error: this.error };
      },
      insert: async (values: unknown) => {
        record({ op: 'insert', values });
        return { error: this.error };
      },
      update: (values: unknown) => ({
        eq: async (column: string, value: unknown) => {
          record({ op: 'update', values, filterColumn: column, filterValue: value });
          return { error: this.error };
        },
      }),
      delete: () => ({
        eq: async (column: string, value: unknown) => {
          record({ op: 'delete', filterColumn: column, filterValue: value });
          return { error: this.error };
        },
        in: async (column: string, values: unknown[]) => {
          record({ op: 'delete', filterColumn: column, filterIn: values });
          return { error: this.error };
        },
      }),
      select: (columns?: string) => ({
        eq: async (column: string, value: unknown) => {
          record({ op: 'select', selectColumns: columns, filterColumn: column, filterValue: value });
          return { data: this.selectData, error: this.error };
        },
      }),
    };
  }

  /** The single recorded call (asserts there was exactly one). */
  only(): RecordedCall {
    expect(this.calls).toHaveLength(1);
    return this.calls[0];
  }
}

describe('SupabaseStore.recordEventOnce (idempotency gate)', () => {
  it('inserts the delivery id and returns true when the insert succeeds', async () => {
    const db = new FakeSupabase();
    const store = new SupabaseStore(db);

    expect(await store.recordEventOnce('delivery-1')).toBe(true);
    expect(db.only()).toMatchObject({
      table: 'webhook_events',
      op: 'insert',
      values: { delivery_id: 'delivery-1' },
    });
  });

  it('returns false on a duplicate (UNIQUE-constraint error) so handlers run once', async () => {
    const db = new FakeSupabase();
    db.error = { code: '23505', message: 'duplicate key value violates unique constraint' };
    const store = new SupabaseStore(db);

    expect(await store.recordEventOnce('delivery-1')).toBe(false);
  });
});

describe('SupabaseStore writes: column mapping and onConflict', () => {
  let db: FakeSupabase;
  let store: SupabaseStore;

  beforeEach(() => {
    db = new FakeSupabase();
    store = new SupabaseStore(db);
  });

  it('upsertInstallation maps camelCase to snake_case on installation_id', async () => {
    await store.upsertInstallation({ installationId: 1, account: 'acme', accountId: 9, suspendedAt: null });
    expect(db.only()).toMatchObject({
      table: 'installations',
      op: 'upsert',
      onConflict: 'installation_id',
      values: { installation_id: 1, account: 'acme', account_id: 9, suspended_at: null },
    });
  });

  it('removeInstallation deletes by installation_id', async () => {
    await store.removeInstallation(1);
    expect(db.only()).toMatchObject({ table: 'installations', op: 'delete', filterColumn: 'installation_id', filterValue: 1 });
  });

  it('cancelSubscription soft-cancels by setting cancelled_at, keyed on account_id', async () => {
    await store.cancelSubscription(9, '2026-03-01T00:00:00Z');
    expect(db.only()).toMatchObject({
      table: 'subscriptions',
      op: 'update',
      values: { cancelled_at: '2026-03-01T00:00:00Z' },
      filterColumn: 'account_id',
      filterValue: 9,
    });
  });

  it('setInstallationSuspended updates suspended_at filtered by installation_id', async () => {
    await store.setInstallationSuspended(1, '2026-01-01T00:00:00Z');
    expect(db.only()).toMatchObject({
      table: 'installations',
      op: 'update',
      values: { suspended_at: '2026-01-01T00:00:00Z' },
      filterColumn: 'installation_id',
      filterValue: 1,
    });
  });

  it('upsertRepos maps every repo row and keys on repo_id', async () => {
    await store.upsertRepos(1, [
      { repoId: 10, installationId: 1, fullName: 'acme/web', isPrivate: true, defaultBranch: 'main', selected: true },
    ]);
    expect(db.only()).toMatchObject({
      table: 'repos',
      op: 'upsert',
      onConflict: 'repo_id',
      values: [
        { repo_id: 10, installation_id: 1, full_name: 'acme/web', private: true, default_branch: 'main', selected: true },
      ],
    });
  });

  it('removeRepos deletes by repo_id IN the given ids', async () => {
    await store.removeRepos(1, [10, 11]);
    expect(db.only()).toMatchObject({ table: 'repos', op: 'delete', filterColumn: 'repo_id', filterIn: [10, 11] });
  });

  it('upsertScan maps the scan row and keys on check_run_id', async () => {
    await store.upsertScan({
      checkRunId: 500,
      repoId: 10,
      installationId: 1,
      headSha: 'abc',
      prNumber: 7,
      conclusion: 'success',
      violationCount: 3,
      createdAt: '2026-01-01T00:00:00Z',
    });
    expect(db.only()).toMatchObject({
      table: 'scans',
      op: 'upsert',
      onConflict: 'check_run_id',
      values: {
        check_run_id: 500,
        repo_id: 10,
        installation_id: 1,
        head_sha: 'abc',
        pr_number: 7,
        conclusion: 'success',
        violation_count: 3,
        created_at: '2026-01-01T00:00:00Z',
      },
    });
  });

  it('upsertLicense maps the license row and keys on installation_id', async () => {
    await store.upsertLicense({ installationId: 1, sub: 'acme', token: 'p.s', issuedAt: 'i', expiresAt: 'e' });
    expect(db.only()).toMatchObject({
      table: 'licenses',
      op: 'upsert',
      onConflict: 'installation_id',
      values: { installation_id: 1, sub: 'acme', token: 'p.s', issued_at: 'i', expires_at: 'e' },
    });
  });

  it('upsertSubscription maps the subscription row and keys on account_id', async () => {
    await store.upsertSubscription({
      accountId: 9,
      account: 'acme',
      planId: 2,
      planName: 'pro',
      monthlyPriceInCents: 1000,
      unitCount: 5,
      onFreeTrial: true,
      freeTrialEndsOn: '2026-02-01',
      nextBillingDate: '2026-02-01',
      cancelledAt: null,
    });
    expect(db.only()).toMatchObject({
      table: 'subscriptions',
      op: 'upsert',
      onConflict: 'account_id',
      values: {
        account_id: 9,
        plan_id: 2,
        plan_name: 'pro',
        monthly_price_in_cents: 1000,
        unit_count: 5,
        on_free_trial: true,
        free_trial_ends_on: '2026-02-01',
        next_billing_date: '2026-02-01',
        cancelled_at: null,
      },
    });
  });

  it('upsertUser maps github fields and keys on id', async () => {
    await store.upsertUser({ userId: 'u1', githubLogin: 'octocat', githubUserId: 5 });
    expect(db.only()).toMatchObject({
      table: 'users',
      op: 'upsert',
      onConflict: 'id',
      values: { id: 'u1', github_login: 'octocat', github_user_id: 5 },
    });
  });

  it('linkUserInstallation upserts on the composite user_id,installation_id key', async () => {
    await store.linkUserInstallation('u1', 100);
    expect(db.only()).toMatchObject({
      table: 'user_installations',
      op: 'upsert',
      onConflict: 'user_id,installation_id',
      values: { user_id: 'u1', installation_id: 100 },
    });
  });

  it('upsertAudit maps the audit row and keys on id', async () => {
    await store.upsertAudit({
      id: 'a1',
      repoId: 10,
      installationId: 1,
      headSha: 'abc',
      basisCheckRunId: 500,
      status: 'draft',
      createdAt: '2026-01-01T00:00:00Z',
      publishedAt: null,
    });
    expect(db.only()).toMatchObject({
      table: 'audits',
      op: 'upsert',
      onConflict: 'id',
      values: {
        id: 'a1',
        repo_id: 10,
        installation_id: 1,
        head_sha: 'abc',
        basis_check_run_id: 500,
        status: 'draft',
        created_at: '2026-01-01T00:00:00Z',
        published_at: null,
      },
    });
  });

  it('setAuditStatus updates status + published_at filtered by id', async () => {
    await store.setAuditStatus('a1', 'published', '2026-02-02T00:00:00Z');
    expect(db.only()).toMatchObject({
      table: 'audits',
      op: 'update',
      values: { status: 'published', published_at: '2026-02-02T00:00:00Z' },
      filterColumn: 'id',
      filterValue: 'a1',
    });
  });

  it('upsertVerdict maps the verdict row and keys on the composite source key', async () => {
    await store.upsertVerdict({
      id: 'v1',
      auditId: 'a1',
      wcagId: '1.4.3',
      source: 'machine',
      verdict: 'partially_supports',
      remarks: 'found 2',
      evidence: { automated: true, violationCount: 2 },
      authorId: null,
      updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(db.only()).toMatchObject({
      table: 'criterion_verdicts',
      op: 'upsert',
      onConflict: 'audit_id,wcag_id,source',
      values: {
        id: 'v1',
        audit_id: 'a1',
        wcag_id: '1.4.3',
        source: 'machine',
        verdict: 'partially_supports',
        remarks: 'found 2',
        evidence: { automated: true, violationCount: 2 },
        author_id: null,
        updated_at: '2026-01-01T00:00:00Z',
      },
    });
  });
});

describe('SupabaseStore conformance reads: row mapping', () => {
  it('listViolationsByScan maps rows and defaults nullable source location', async () => {
    const db = new FakeSupabase();
    db.selectData = [
      {
        rule_id: 'image-alt',
        wcag_id: '1.1.1',
        impact: 'critical',
        description: 'img needs alt',
        help_url: 'https://help/image-alt',
        path: null,
        line: null,
      },
    ];
    const store = new SupabaseStore(db);
    expect(await store.listViolationsByScan(500)).toEqual([
      {
        ruleId: 'image-alt',
        wcagId: '1.1.1',
        impact: 'critical',
        description: 'img needs alt',
        helpUrl: 'https://help/image-alt',
        path: null,
        line: null,
      },
    ]);
    expect(db.only()).toMatchObject({ table: 'violations', op: 'select', filterColumn: 'check_run_id', filterValue: 500 });
  });

  it('getAudit maps a row and returns null when absent', async () => {
    const db = new FakeSupabase();
    db.selectData = [
      {
        id: 'a1',
        repo_id: 10,
        installation_id: 1,
        head_sha: 'abc',
        basis_check_run_id: null,
        status: 'in_review',
        created_at: 't',
        published_at: null,
      },
    ];
    const store = new SupabaseStore(db);
    expect(await store.getAudit('a1')).toEqual({
      id: 'a1',
      repoId: 10,
      installationId: 1,
      headSha: 'abc',
      basisCheckRunId: null,
      status: 'in_review',
      createdAt: 't',
      publishedAt: null,
    });

    db.selectData = [];
    expect(await store.getAudit('a1')).toBeNull();
  });

  it('listAuditsByInstallation maps every row', async () => {
    const db = new FakeSupabase();
    db.selectData = [
      { id: 'a1', repo_id: 10, installation_id: 1, head_sha: 'abc', basis_check_run_id: 7, status: 'draft', created_at: 't', published_at: null },
    ];
    const store = new SupabaseStore(db);
    const audits = await store.listAuditsByInstallation(1);
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ id: 'a1', basisCheckRunId: 7, status: 'draft' });
  });

  it('listVerdicts maps rows, defaulting evidence and author to null', async () => {
    const db = new FakeSupabase();
    db.selectData = [
      {
        id: 'v1',
        audit_id: 'a1',
        wcag_id: '1.1.1',
        source: 'human',
        verdict: 'supports',
        remarks: 'ok',
        evidence: null,
        author_id: 'u9',
        updated_at: 't',
      },
    ];
    const store = new SupabaseStore(db);
    expect(await store.listVerdicts('a1')).toEqual([
      {
        id: 'v1',
        auditId: 'a1',
        wcagId: '1.1.1',
        source: 'human',
        verdict: 'supports',
        remarks: 'ok',
        evidence: null,
        authorId: 'u9',
        updatedAt: 't',
      },
    ]);
  });
});

describe('SupabaseStore.replaceViolations (delete-then-insert)', () => {
  it('clears existing rows then inserts the mapped replacements', async () => {
    const db = new FakeSupabase();
    const store = new SupabaseStore(db);

    await store.replaceViolations(500, [
      {
        ruleId: 'link-name',
        wcagId: 'wcag244',
        impact: 'serious',
        description: 'Links must have discernible text',
        helpUrl: 'https://example.com',
        path: 'src/App.tsx',
        line: 12,
      },
    ]);

    expect(db.calls).toHaveLength(2);
    expect(db.calls[0]).toMatchObject({ table: 'violations', op: 'delete', filterColumn: 'check_run_id', filterValue: 500 });
    expect(db.calls[1]).toMatchObject({
      table: 'violations',
      op: 'insert',
      values: [
        {
          check_run_id: 500,
          rule_id: 'link-name',
          wcag_id: 'wcag244',
          impact: 'serious',
          description: 'Links must have discernible text',
          help_url: 'https://example.com',
          path: 'src/App.tsx',
          line: 12,
        },
      ],
    });
  });

  it('skips the insert entirely when there are no violations', async () => {
    const db = new FakeSupabase();
    const store = new SupabaseStore(db);

    await store.replaceViolations(500, []);

    expect(db.calls).toHaveLength(1);
    expect(db.calls[0]).toMatchObject({ table: 'violations', op: 'delete' });
  });
});

describe('SupabaseStore reads: row mapping and null handling', () => {
  it('getInstallation maps a snake_case row to a record', async () => {
    const db = new FakeSupabase();
    db.selectData = [{ installation_id: 1, account: 'acme', account_id: 9, suspended_at: null }];
    const store = new SupabaseStore(db);

    expect(await store.getInstallation(1)).toEqual({ installationId: 1, account: 'acme', accountId: 9, suspendedAt: null });
    expect(db.only()).toMatchObject({ table: 'installations', op: 'select', filterColumn: 'installation_id', filterValue: 1 });
  });

  it('getInstallation returns null when no row matches', async () => {
    const db = new FakeSupabase();
    db.selectData = [];
    const store = new SupabaseStore(db);
    expect(await store.getInstallation(1)).toBeNull();
  });

  it('getInstallation returns null when data is null', async () => {
    const db = new FakeSupabase();
    db.selectData = null;
    const store = new SupabaseStore(db);
    expect(await store.getInstallation(1)).toBeNull();
  });

  it('getLicense maps a row and returns null when absent', async () => {
    const db = new FakeSupabase();
    db.selectData = [{ installation_id: 1, sub: 'acme', token: 'p.s', issued_at: 'i', expires_at: 'e' }];
    const store = new SupabaseStore(db);
    expect(await store.getLicense(1)).toEqual({ installationId: 1, sub: 'acme', token: 'p.s', issuedAt: 'i', expiresAt: 'e' });

    db.selectData = [];
    expect(await store.getLicense(1)).toBeNull();
  });

  it('listRepos maps every row filtered by installation_id', async () => {
    const db = new FakeSupabase();
    db.selectData = [
      { repo_id: 10, installation_id: 1, full_name: 'acme/web', private: false, default_branch: null, selected: true },
    ];
    const store = new SupabaseStore(db);

    expect(await store.listRepos(1)).toEqual([
      { repoId: 10, installationId: 1, fullName: 'acme/web', isPrivate: false, defaultBranch: null, selected: true },
    ]);
  });

  it('listScansByInstallation maps rows and defaults nullable columns', async () => {
    const db = new FakeSupabase();
    db.selectData = [
      {
        check_run_id: 500,
        repo_id: 10,
        installation_id: 1,
        head_sha: 'abc',
        pr_number: null,
        conclusion: null,
        violation_count: 0,
        created_at: 't',
      },
    ];
    const store = new SupabaseStore(db);

    expect(await store.listScansByInstallation(1)).toEqual([
      {
        checkRunId: 500,
        repoId: 10,
        installationId: 1,
        headSha: 'abc',
        prNumber: null,
        conclusion: null,
        violationCount: 0,
        createdAt: 't',
      },
    ]);
  });

  it('listInstallationsForUser extracts installation ids, empty when none', async () => {
    const db = new FakeSupabase();
    db.selectData = [{ installation_id: 100 }, { installation_id: 200 }];
    const store = new SupabaseStore(db);
    expect(await store.listInstallationsForUser('u1')).toEqual([100, 200]);
    expect(db.only()).toMatchObject({ table: 'user_installations', op: 'select', selectColumns: 'installation_id' });

    db.selectData = null;
    expect(await store.listInstallationsForUser('u1')).toEqual([]);
  });
});

describe('SupabaseStore error propagation (throwOn)', () => {
  let db: FakeSupabase;
  let store: SupabaseStore;

  beforeEach(() => {
    db = new FakeSupabase();
    db.error = { message: 'boom' };
    store = new SupabaseStore(db);
  });

  it('throws with context on a failed write', async () => {
    await expect(store.upsertInstallation({ installationId: 1, account: 'a', accountId: 1, suspendedAt: null })).rejects.toThrow(
      /supabase upsertInstallation failed/,
    );
  });

  it('throws with context on a failed read', async () => {
    await expect(store.getInstallation(1)).rejects.toThrow(/supabase getInstallation failed/);
  });

  it('throws from the clear step of replaceViolations before inserting', async () => {
    await expect(store.replaceViolations(500, [])).rejects.toThrow(/supabase replaceViolations\(clear\) failed/);
  });
});
