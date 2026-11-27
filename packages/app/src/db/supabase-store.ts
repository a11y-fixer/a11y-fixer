// Production Store backed by Supabase Postgres.
//
// This file is type-checked but NOT executed in CI (no network, no project yet)
// and is excluded from coverage thresholds. The real `@supabase/supabase-js`
// client is wired in M2 when the Supabase project is provisioned in an
// interactive session; until then we depend on a minimal STRUCTURAL type so the
// package installs and type-checks with zero extra dependencies. The real
// client returned by `createClient()` satisfies this shape.
import type {
  ActionRunRecord,
  AuditRecord,
  AuditRevisionRecord,
  AuditStatus,
  CriterionVerdictRecord,
  InstallationRecord,
  LicenseRecord,
  RepoRecord,
  ScanRecord,
  Store,
  SubscriptionRecord,
  UserRecord,
  ViolationRecord,
} from './store.js';
import { RevisionVersionConflictError } from './store.js';

/** The slice of the supabase-js client this store uses. */
export interface SupabaseLike {
  from(table: string): {
    upsert(values: unknown, options?: { onConflict?: string; ignoreDuplicates?: boolean }): Promise<{ error: unknown }>;
    delete(): {
      eq(column: string, value: unknown): Promise<{ error: unknown }>;
      in(column: string, values: unknown[]): Promise<{ error: unknown }>;
    };
    update(values: unknown): {
      eq(column: string, value: unknown): Promise<{ error: unknown }>;
    };
    insert(values: unknown): Promise<{ error: unknown }>;
    select(columns?: string): {
      eq(column: string, value: unknown): Promise<{ data: unknown[] | null; error: unknown }> & {
        order(column: string, options?: { ascending?: boolean }): Promise<{ data: unknown[] | null; error: unknown }>;
      };
      order(column: string, options?: { ascending?: boolean }): {
        limit(count: number): Promise<{ data: unknown[] | null; error: unknown }>;
      };
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

  async recordActionRun(event: ActionRunRecord): Promise<void> {
    const { error } = await this.db.from('action_runs').insert({
      action_version: event.actionVersion,
      mode: event.mode,
      licensed: event.licensed,
      public_repo: event.publicRepo,
      violations_before: event.violationsBefore,
      violations_after: event.violationsAfter,
      fixes_applied: event.fixesApplied,
      fixes_reverted: event.fixesReverted,
      regressions: event.regressions,
      used_url: event.usedUrl,
      used_html: event.usedHtml,
      used_markdown: event.usedMarkdown,
      used_components: event.usedComponents,
      platform: event.platform,
      arch: event.arch,
      node_version: event.nodeVersion,
    });
    throwOn(error, 'recordActionRun');
  }

  async listRecentActionRuns(limit: number): Promise<ActionRunRecord[]> {
    const { data, error } = await this.db
      .from('action_runs')
      .select()
      .order('created_at', { ascending: false })
      .limit(limit);
    throwOn(error, 'listRecentActionRuns');
    return (data ?? []).map(raw => {
      const row = raw as Record<string, unknown>;
      return {
        actionVersion: (row.action_version as string | null) ?? null,
        mode: row.mode as string,
        licensed: Boolean(row.licensed),
        publicRepo: Boolean(row.public_repo),
        violationsBefore: (row.violations_before as number) ?? 0,
        violationsAfter: (row.violations_after as number) ?? 0,
        fixesApplied: (row.fixes_applied as number) ?? 0,
        fixesReverted: (row.fixes_reverted as number) ?? 0,
        regressions: (row.regressions as number) ?? 0,
        usedUrl: Boolean(row.used_url),
        usedHtml: Boolean(row.used_html),
        usedMarkdown: Boolean(row.used_markdown),
        usedComponents: Boolean(row.used_components),
        platform: (row.platform as string) ?? 'unknown',
        arch: (row.arch as string) ?? 'unknown',
        nodeVersion: (row.node_version as string) ?? 'unknown',
        createdAt: (row.created_at as string | null) ?? null,
      };
    });
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

  async listViolationsByScan(checkRunId: number): Promise<ViolationRecord[]> {
    const { data, error } = await this.db.from('violations').select().eq('check_run_id', checkRunId);
    throwOn(error, 'listViolationsByScan');
    return (data ?? []).map(row => {
      const r = row as Record<string, unknown>;
      return {
        ruleId: r.rule_id as string,
        wcagId: r.wcag_id as string,
        impact: r.impact as string,
        description: r.description as string,
        helpUrl: r.help_url as string,
        path: (r.path as string | null) ?? null,
        line: (r.line as number | null) ?? null,
      };
    });
  }

  async upsertAudit(record: AuditRecord): Promise<void> {
    const { error } = await this.db.from('audits').upsert(
      {
        id: record.id,
        repo_id: record.repoId,
        installation_id: record.installationId,
        head_sha: record.headSha,
        basis_check_run_id: record.basisCheckRunId,
        status: record.status,
        created_at: record.createdAt,
        published_at: record.publishedAt,
      },
      { onConflict: 'id' },
    );
    throwOn(error, 'upsertAudit');
  }

  async getAudit(auditId: string): Promise<AuditRecord | null> {
    const { data, error } = await this.db.from('audits').select().eq('id', auditId);
    throwOn(error, 'getAudit');
    const row = (data ?? [])[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    return this.toAuditRecord(row);
  }

  async listAuditsByInstallation(installationId: number): Promise<AuditRecord[]> {
    const { data, error } = await this.db.from('audits').select().eq('installation_id', installationId);
    throwOn(error, 'listAuditsByInstallation');
    return (data ?? []).map(row => this.toAuditRecord(row as Record<string, unknown>));
  }

  private toAuditRecord(r: Record<string, unknown>): AuditRecord {
    return {
      id: r.id as string,
      repoId: r.repo_id as number,
      installationId: r.installation_id as number,
      headSha: r.head_sha as string,
      basisCheckRunId: (r.basis_check_run_id as number | null) ?? null,
      status: r.status as AuditStatus,
      createdAt: r.created_at as string,
      publishedAt: (r.published_at as string | null) ?? null,
    };
  }

  async setAuditStatus(auditId: string, status: AuditStatus, publishedAt: string | null): Promise<void> {
    const { error } = await this.db
      .from('audits')
      .update({ status, published_at: publishedAt })
      .eq('id', auditId);
    throwOn(error, 'setAuditStatus');
  }

  async upsertVerdict(record: CriterionVerdictRecord): Promise<void> {
    const { error } = await this.db.from('criterion_verdicts').upsert(
      {
        id: record.id,
        audit_id: record.auditId,
        wcag_id: record.wcagId,
        source: record.source,
        verdict: record.verdict,
        remarks: record.remarks,
        evidence: record.evidence,
        author_id: record.authorId,
        updated_at: record.updatedAt,
      },
      { onConflict: 'audit_id,wcag_id,source' },
    );
    throwOn(error, 'upsertVerdict');
  }

  async listVerdicts(auditId: string): Promise<CriterionVerdictRecord[]> {
    const { data, error } = await this.db.from('criterion_verdicts').select().eq('audit_id', auditId);
    throwOn(error, 'listVerdicts');
    return (data ?? []).map(row => {
      const r = row as Record<string, unknown>;
      return {
        id: r.id as string,
        auditId: r.audit_id as string,
        wcagId: r.wcag_id as string,
        source: r.source as CriterionVerdictRecord['source'],
        verdict: r.verdict as CriterionVerdictRecord['verdict'],
        remarks: r.remarks as string,
        evidence: r.evidence ?? null,
        authorId: (r.author_id as string | null) ?? null,
        updatedAt: r.updated_at as string,
      };
    });
  }

  async insertRevision(record: AuditRevisionRecord): Promise<void> {
    // Idempotent on audit_id (a published revision is immutable): ignore a
    // conflicting insert rather than overwriting the frozen snapshot.
    const { error } = await this.db.from('audit_revisions').upsert(
      {
        id: record.id,
        audit_id: record.auditId,
        repo_id: record.repoId,
        installation_id: record.installationId,
        version: record.version,
        public_slug: record.publicSlug,
        snapshot: record.snapshot,
        head_sha: record.headSha,
        published_at: record.publishedAt,
      },
      { onConflict: 'audit_id', ignoreDuplicates: true },
    );
    // The audit_id conflict is ignored (idempotent). A remaining unique violation
    // (Postgres 23505) is the unique(repo_id, version) collision from a concurrent
    // same-repo publish: surface it as the typed error so the caller recomputes the
    // version and retries, instead of 500ing a publish that already committed.
    const code = (error as { code?: string } | null)?.code;
    if (code === '23505') throw new RevisionVersionConflictError(record.repoId, record.version);
    throwOn(error, 'insertRevision');
  }

  private toRevisionRecord(r: Record<string, unknown>): AuditRevisionRecord {
    return {
      id: r.id as string,
      auditId: r.audit_id as string,
      repoId: r.repo_id as number,
      installationId: r.installation_id as number,
      version: r.version as number,
      publicSlug: r.public_slug as string,
      snapshot: r.snapshot ?? null,
      headSha: r.head_sha as string,
      publishedAt: r.published_at as string,
    };
  }

  async getRevisionByAudit(auditId: string): Promise<AuditRevisionRecord | null> {
    const { data, error } = await this.db.from('audit_revisions').select().eq('audit_id', auditId);
    throwOn(error, 'getRevisionByAudit');
    const row = (data ?? [])[0] as Record<string, unknown> | undefined;
    return row ? this.toRevisionRecord(row) : null;
  }

  async getRevisionBySlug(publicSlug: string): Promise<AuditRevisionRecord | null> {
    const { data, error } = await this.db.from('audit_revisions').select().eq('public_slug', publicSlug);
    throwOn(error, 'getRevisionBySlug');
    const row = (data ?? [])[0] as Record<string, unknown> | undefined;
    return row ? this.toRevisionRecord(row) : null;
  }

  async listRevisionsByRepo(repoId: number): Promise<AuditRevisionRecord[]> {
    const { data, error } = await this.db
      .from('audit_revisions')
      .select()
      .eq('repo_id', repoId)
      .order('version', { ascending: false });
    throwOn(error, 'listRevisionsByRepo');
    return (data ?? []).map(row => this.toRevisionRecord(row as Record<string, unknown>));
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

  async getUser(userId: string): Promise<UserRecord | null> {
    const { data, error } = await this.db.from('users').select().eq('id', userId);
    throwOn(error, 'getUser');
    const row = (data ?? [])[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      userId: row.id as string,
      githubLogin: row.github_login as string,
      githubUserId: row.github_user_id as number,
    };
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
