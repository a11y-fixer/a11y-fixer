// Production Store backed by Supabase Postgres.
//
// This file is type-checked but NOT executed in CI (no network, no project yet)
// and is excluded from coverage thresholds. The real `@supabase/supabase-js`
// client is wired in M2 when the Supabase project is provisioned in an
// interactive session; until then we depend on a minimal STRUCTURAL type so the
// package installs and type-checks with zero extra dependencies. The real
// client returned by `createClient()` satisfies this shape.
import type { InstallationRecord, RepoRecord, ScanRecord, Store, ViolationRecord } from './store.js';

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

  async recordScan(scan: ScanRecord, violations: ViolationRecord[]): Promise<void> {
    // Upsert the scan, then replace its violation rows: delete any prior rows for
    // this scan_id before inserting, so a redelivered completion is idempotent.
    const { error: scanError } = await this.db.from('scans').upsert(
      {
        scan_id: scan.scanId,
        installation_id: scan.installationId,
        repo_id: scan.repoId,
        full_name: scan.fullName,
        sha: scan.sha,
        pr_number: scan.prNumber,
        mode: scan.mode,
        conclusion: scan.conclusion,
        critical: scan.critical,
        serious: scan.serious,
        moderate: scan.moderate,
        minor: scan.minor,
        total: scan.total,
        truncated: scan.truncated,
      },
      { onConflict: 'scan_id' },
    );
    throwOn(scanError, 'recordScan(scan)');

    const { error: delError } = await this.db.from('violations').delete().eq('scan_id', scan.scanId);
    throwOn(delError, 'recordScan(clear violations)');

    if (violations.length === 0) return;
    const { error: insError } = await this.db.from('violations').insert(
      violations.map(v => ({
        scan_id: scan.scanId,
        rule_id: v.ruleId,
        wcag_id: v.wcagId,
        impact: v.impact,
        description: v.description,
        help_url: v.helpUrl,
        path: v.path,
        line: v.line,
      })),
    );
    throwOn(insError, 'recordScan(violations)');
  }
}
