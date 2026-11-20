// The persistence port the webhook handlers write through.
//
// Handlers depend on this interface, never on a concrete database, so they are
// unit-testable with the in-memory fake (`memory-store.ts`) and backed in
// production by `supabase-store.ts`. The shape mirrors db/schema.sql.

export interface InstallationRecord {
  /** GitHub installation id (primary key). */
  installationId: number;
  /** Account login the App is installed on (org or user). */
  account: string;
  /** Account's numeric GitHub id. */
  accountId: number;
  /** ISO-8601 when GitHub suspended the installation, else null. */
  suspendedAt: string | null;
}

export interface RepoRecord {
  /** GitHub repository id (primary key). */
  repoId: number;
  /** Owning installation. */
  installationId: number;
  /** `owner/name`. */
  fullName: string;
  /** Whether the repo is private. */
  isPrivate: boolean;
  /** Default branch name, if known. */
  defaultBranch: string | null;
  /** Whether this repo is selected in the installation's repo scope. */
  selected: boolean;
}

/** One ingested a11y-fixer scan (a completed Check Run). Mirrors `scans`. */
export interface ScanRecord {
  /** GitHub `check_run.id` — stable per run, the scan's primary key. */
  scanId: number;
  /** Owning installation, if the event carried one. */
  installationId: number | null;
  /** Repository the scan ran on. */
  repoId: number;
  /** `owner/name`, denormalized for dashboard queries. */
  fullName: string;
  /** PR head sha the Check Run attached to. */
  sha: string;
  /** PR number when the run was on a pull request, else null. */
  prNumber: number | null;
  /** `check` (gating) or `fix` (informational). */
  mode: string;
  /** Check Run conclusion: success | failure | neutral. */
  conclusion: string;
  /** Exact impact counts over the full violation set. */
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  total: number;
  /** True when the per-row violation list was capped below `total`. */
  truncated: boolean;
}

/** One violation row within a scan. Mirrors `violations`. */
export interface ViolationRecord {
  /** axe/ESLint rule id. */
  ruleId: string;
  wcagId: string;
  impact: string;
  description: string;
  helpUrl: string;
  /** Repo-relative source path, if the scan located one (URL scans don't). */
  path: string | null;
  line: number | null;
}

export interface Store {
  /**
   * Idempotency gate keyed by `X-GitHub-Delivery`. Returns true the first time
   * a delivery id is seen and false on every replay, so handlers run once.
   */
  recordEventOnce(deliveryId: string): Promise<boolean>;

  upsertInstallation(record: InstallationRecord): Promise<void>;
  removeInstallation(installationId: number): Promise<void>;
  setInstallationSuspended(installationId: number, suspendedAt: string | null): Promise<void>;

  upsertRepos(installationId: number, repos: RepoRecord[]): Promise<void>;
  removeRepos(installationId: number, repoIds: number[]): Promise<void>;

  /**
   * Persist one scan and its violation rows together, replacing any prior rows
   * for the same `scanId` (so a redelivered completion is idempotent at the data
   * layer, not just via the delivery ledger).
   */
  recordScan(scan: ScanRecord, violations: ViolationRecord[]): Promise<void>;
}
