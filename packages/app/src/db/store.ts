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
  /**
   * Number of accessibility violations. Exact (the scan contract's total) when
   * the Action embedded one; otherwise the Check Run's annotation count.
   */
  violationCount: number;
  /** ISO-8601 completion time. */
  createdAt: string;
}

/**
 * One per-violation detail row for a scan, parsed from the scan contract the
 * Action embeds in `check_run.output.text`. Optional enrichment on top of the
 * scan row: the dashboard's counts work off `ScanRecord.violationCount` without
 * it, so an older Action that emits no contract simply records no detail rows.
 */
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

/**
 * A dashboard end user, identified by their Supabase Auth id. The GitHub fields
 * are captured at login so the UI can show who is signed in and reconcile the
 * user's visible installations from GitHub's `GET /user/installations`.
 */
export interface UserRecord {
  /** Supabase Auth user id (`auth.uid()`), the primary key. */
  userId: string;
  /** GitHub login captured at OAuth time. */
  githubLogin: string;
  /** GitHub numeric user id. */
  githubUserId: number;
}

/**
 * A GitHub Marketplace subscription for an account (org or user). Keyed on the
 * purchasing account id, which mirrors `InstallationRecord.accountId`, so a
 * subscription joins to installations without one having to exist first. A
 * cancelled subscription is kept (soft-cancel via `cancelledAt`) for history.
 */
export interface SubscriptionRecord {
  /** Purchasing account's numeric GitHub id (primary key). */
  accountId: number;
  /** Purchasing account login (org or user). */
  account: string;
  /** Marketplace plan id. */
  planId: number;
  /** Marketplace plan name. */
  planName: string;
  /** Plan price per month, in cents. */
  monthlyPriceInCents: number;
  /** Seats purchased. */
  unitCount: number;
  onFreeTrial: boolean;
  /** ISO-8601 date the free trial ends, else null. */
  freeTrialEndsOn: string | null;
  /** ISO-8601 date of next billing, else null. */
  nextBillingDate: string | null;
  /** ISO-8601 when the subscription was cancelled, else null (active). */
  cancelledAt: string | null;
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

  /**
   * Replace the per-violation detail rows for a scan (delete-then-insert by
   * check_run id), so a redelivered completion is idempotent at the data layer.
   */
  replaceViolations(checkRunId: number, violations: ViolationRecord[]): Promise<void>;

  /** Dashboard reads: repos and scans for one installation. */
  listRepos(installationId: number): Promise<RepoRecord[]>;
  listScansByInstallation(installationId: number): Promise<ScanRecord[]>;

  /** Record (or replace by account id) a Marketplace subscription. */
  upsertSubscription(record: SubscriptionRecord): Promise<void>;
  /** Soft-cancel a subscription: set its cancelled timestamp, keep the row. */
  cancelSubscription(accountId: number, cancelledAt: string): Promise<void>;

  /** Record (or update) a signed-in dashboard user. */
  upsertUser(record: UserRecord): Promise<void>;
  /**
   * Link a user to an installation they can view (idempotent). Called at login
   * after reconciling GitHub's `GET /user/installations`.
   */
  linkUserInstallation(userId: string, installationId: number): Promise<void>;
  /** The installation ids a user is allowed to view. */
  listInstallationsForUser(userId: string): Promise<number[]>;
}
