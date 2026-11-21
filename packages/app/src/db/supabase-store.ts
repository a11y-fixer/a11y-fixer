// Production Store backed by Supabase Postgres.
//
// This file is type-checked but NOT executed in CI (no network, no project yet)
// and is excluded from coverage thresholds. The real `@supabase/supabase-js`
// client is wired in M2 when the Supabase project is provisioned in an
// interactive session; until then we depend on a minimal STRUCTURAL type so the
// package installs and type-checks with zero extra dependencies. The real
// client returned by `createClient()` satisfies this shape.
import type {
  InstallationRecord,
  LicenseRecord,
  RepoRecord,
  ScanRecord,
  Store,
  SubscriptionRecord,
  UserRecord,
  ViolationRecord,
} from './store.js';

/** The slice of the supabase-js client this store uses. */
export interface SupabaseLike {
  from(table: string): {
    upsert(values: unknown, options?: { onConflict?: string }): Promise<{ error: unknown }>;
    delete(): {
      eq(column: string, value: unknown): Promise<{ error: unknown }>;
      in(column: string, values: unknown[]): Promise<{ error: unknown }>;
    };
    update(values: unknown): {
      eq(column: string, value: unknown): Promise<{ error: unknown }>;
    };
    insert(values: unknown): Promise<{ error: unknown }>;
    select(columns?: string): {
      eq(column: string, value: unknown): Promise<{ data: unknown[] | null; error: unknown }>;
    };
  };
}

function throwOn(error: unknown, context: string): void {
  if (error) throw new Error(`supabase ${context} failed: ${JSON.stringify(error)}`);
}

export class SupabaseStore implements Store {
  constructor(private readonly db: SupabaseLike) {}

  async recordEventOnce(deliveryId: string): Promise<boolean> {
    // Relies on a UNIQUE constraint on webhook_events.delivery_id: a duplicate
    // insert errors, which we read as "already seen".
    const { error } = await this.db.from('webhook_events').insert({ delivery_id: deliveryId });
    return !error;
  }

  async upsertInstallation(record: InstallationRecord): Promise<void> {
    const { error } = await this.db.from('installations').upsert(
      {
        installation_id: record.installationId,
        account: record.account,
        account_id: record.accountId,
        suspended_at: record.suspendedAt,
      },
      { onConflict: 'installation_id' },
    );
    throwOn(error, 'upsertInstallation');
  }

  async removeInstallation(installationId: number): Promise<void> {
    const { error } = await this.db.from('installations').delete().eq('installation_id', installationId);
    throwOn(error, 'removeInstallation');
  }

  async setInstallationSuspended(installationId: number, suspendedAt: string | null): Promise<void> {
    const { error } = await this.db
      .from('installations')
      .update({ suspended_at: suspendedAt })
      .eq('installation_id', installationId);
    throwOn(error, 'setInstallationSuspended');
  }

  async getInstallation(installationId: number): Promise<InstallationRecord | null> {
    const { data, error } = await this.db
      .from('installations')
      .select()
      .eq('installation_id', installationId);
    throwOn(error, 'getInstallation');
    const row = (data ?? [])[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      installationId: row.installation_id as number,
      account: row.account as string,
      accountId: row.account_id as number,
      suspendedAt: (row.suspended_at as string | null) ?? null,
    };
  }

  async upsertRepos(_installationId: number, repos: RepoRecord[]): Promise<void> {
    const { error } = await this.db.from('repos').upsert(
      repos.map(repo => ({
        repo_id: repo.repoId,
        installation_id: repo.installationId,
        full_name: repo.fullName,
        private: repo.isPrivate,
        default_branch: repo.defaultBranch,
        selected: repo.selected,
      })),
      { onConflict: 'repo_id' },
    );
    throwOn(error, 'upsertRepos');
  }

  async removeRepos(_installationId: number, repoIds: number[]): Promise<void> {
    const { error } = await this.db.from('repos').delete().in('repo_id', repoIds);
    throwOn(error, 'removeRepos');
  }

  async upsertScan(record: ScanRecord): Promise<void> {
    const { error } = await this.db.from('scans').upsert(
      {
        check_run_id: record.checkRunId,
        repo_id: record.repoId,
        installation_id: record.installationId,
        head_sha: record.headSha,
        pr_number: record.prNumber,
        conclusion: record.conclusion,
        violation_count: record.violationCount,
        created_at: record.createdAt,
      },
      { onConflict: 'check_run_id' },
    );
    throwOn(error, 'upsertScan');
  }

  async replaceViolations(checkRunId: number, violations: ViolationRecord[]): Promise<void> {
    // Delete-then-insert so a redelivered completion replaces (not duplicates)
    // this scan's detail rows.
    const { error: delError } = await this.db.from('violations').delete().eq('check_run_id', checkRunId);
    throwOn(delError, 'replaceViolations(clear)');

    if (violations.length === 0) return;
    const { error: insError } = await this.db.from('violations').insert(
      violations.map(v => ({
        check_run_id: checkRunId,
        rule_id: v.ruleId,
        wcag_id: v.wcagId,
        impact: v.impact,
        description: v.description,
        help_url: v.helpUrl,
        path: v.path,
        line: v.line,
      })),
    );
    throwOn(insError, 'replaceViolations(insert)');
  }

  async listRepos(installationId: number): Promise<RepoRecord[]> {
    const { data, error } = await this.db.from('repos').select().eq('installation_id', installationId);
    throwOn(error, 'listRepos');
    return (data ?? []).map(row => {
      const r = row as Record<string, unknown>;
      return {
        repoId: r.repo_id as number,
        installationId: r.installation_id as number,
        fullName: r.full_name as string,
        isPrivate: r.private as boolean,
        defaultBranch: (r.default_branch as string | null) ?? null,
        selected: r.selected as boolean,
      };
    });
  }

  async listScansByInstallation(installationId: number): Promise<ScanRecord[]> {
    const { data, error } = await this.db.from('scans').select().eq('installation_id', installationId);
    throwOn(error, 'listScansByInstallation');
    return (data ?? []).map(row => {
      const r = row as Record<string, unknown>;
      return {
        checkRunId: r.check_run_id as number,
        repoId: r.repo_id as number,
        installationId: r.installation_id as number,
        headSha: r.head_sha as string,
        prNumber: (r.pr_number as number | null) ?? null,
        conclusion: (r.conclusion as string | null) ?? null,
        violationCount: r.violation_count as number,
        createdAt: r.created_at as string,
      };
    });
  }

  async upsertSubscription(record: SubscriptionRecord): Promise<void> {
    const { error } = await this.db.from('subscriptions').upsert(
      {
        account_id: record.accountId,
        account: record.account,
        plan_id: record.planId,
        plan_name: record.planName,
        monthly_price_in_cents: record.monthlyPriceInCents,
        unit_count: record.unitCount,
        on_free_trial: record.onFreeTrial,
        free_trial_ends_on: record.freeTrialEndsOn,
        next_billing_date: record.nextBillingDate,
        cancelled_at: record.cancelledAt,
      },
      { onConflict: 'account_id' },
    );
    throwOn(error, 'upsertSubscription');
  }

  async cancelSubscription(accountId: number, cancelledAt: string): Promise<void> {
    const { error } = await this.db
      .from('subscriptions')
      .update({ cancelled_at: cancelledAt })
      .eq('account_id', accountId);
    throwOn(error, 'cancelSubscription');
  }

  async getLicense(installationId: number): Promise<LicenseRecord | null> {
    const { data, error } = await this.db
      .from('licenses')
      .select()
      .eq('installation_id', installationId);
    throwOn(error, 'getLicense');
    const row = (data ?? [])[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      installationId: row.installation_id as number,
      sub: row.sub as string,
      token: row.token as string,
      issuedAt: row.issued_at as string,
      expiresAt: row.expires_at as string,
    };
  }

  async upsertLicense(record: LicenseRecord): Promise<void> {
    const { error } = await this.db.from('licenses').upsert(
      {
        installation_id: record.installationId,
        sub: record.sub,
        token: record.token,
        issued_at: record.issuedAt,
        expires_at: record.expiresAt,
      },
      { onConflict: 'installation_id' },
    );
    throwOn(error, 'upsertLicense');
  }

  async upsertUser(record: UserRecord): Promise<void> {
    const { error } = await this.db.from('users').upsert(
      {
        id: record.userId,
        github_login: record.githubLogin,
        github_user_id: record.githubUserId,
      },
      { onConflict: 'id' },
    );
    throwOn(error, 'upsertUser');
  }

  async linkUserInstallation(userId: string, installationId: number): Promise<void> {
    const { error } = await this.db.from('user_installations').upsert(
      { user_id: userId, installation_id: installationId },
      { onConflict: 'user_id,installation_id' },
    );
    throwOn(error, 'linkUserInstallation');
  }

  async listInstallationsForUser(userId: string): Promise<number[]> {
    const { data, error } = await this.db.from('user_installations').select('installation_id').eq('user_id', userId);
    throwOn(error, 'listInstallationsForUser');
    return (data ?? []).map(row => (row as Record<string, unknown>).installation_id as number);
  }
}
