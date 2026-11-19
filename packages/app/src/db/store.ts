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

export interface ScanRecord {
  /** The Action's Check Run id (primary key). */
  checkRunId: number;
  /** Repo the scan ran against. */
  repoId: number;
  /** Owning installation. */
  installationId: number;
  /** Commit the Check Run ran on. */
  headSha: string;
  /** PR number if the run was for a pull request, else null. */
  prNumber: number | null;
  /** Check Run conclusion (`success`, `failure`, `neutral`, …), or null. */
  conclusion: string | null;
  /** Number of accessibility violations (from the Check Run annotation count). */
  violationCount: number;
  /** ISO-8601 completion time. */
  createdAt: string;
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

  /** Record (or replace by check_run id) a completed scan. */
  upsertScan(record: ScanRecord): Promise<void>;

  /** Dashboard reads: repos and scans for one installation. */
  listRepos(installationId: number): Promise<RepoRecord[]>;
  listScansByInstallation(installationId: number): Promise<ScanRecord[]>;
}
