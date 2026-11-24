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

/** Lifecycle of a conformance audit. */
export type AuditStatus = 'draft' | 'in_review' | 'published';

/** The VPAT/ACR conformance vocabulary for a single success criterion. */
export type VerdictValue =
  | 'supports'
  | 'partially_supports'
  | 'does_not_support'
  | 'not_applicable'
  | 'not_evaluated';

/** Who produced a verdict: the automated deriver or a human reviewer. */
export type VerdictSource = 'machine' | 'human';

/**
 * A conformance audit: a VPAT/ACR evaluation of one repo at a point in time. It
 * opens as a machine-derived draft (see src/conformance/derive.ts) and is then
 * reviewed by human testers before being published.
 */
export interface AuditRecord {
  /** Opaque audit id (uuid). */
  id: string;
  repoId: number;
  installationId: number;
  /** Commit the audit evaluates. */
  headSha: string;
  /** The scan the machine draft was derived from, or null. */
  basisCheckRunId: number | null;
  status: AuditStatus;
  /** ISO-8601 creation time. */
  createdAt: string;
  /** ISO-8601 time the audit was published, else null. */
  publishedAt: string | null;
}

/**
 * One verdict for one success criterion within an audit. There is at most one
 * `machine` row and one `human` row per criterion (unique on audit+wcag+source);
 * reconciliation (Phase 2) decides which wins for a published document.
 */
export interface CriterionVerdictRecord {
  /** Opaque verdict id (uuid). */
  id: string;
  auditId: string;
  /** Dotted WCAG success-criterion number, e.g. '1.4.3'. */
  wcagId: string;
  source: VerdictSource;
  verdict: VerdictValue;
  remarks: string;
  /** App-owned JSON evidence (violation refs, impact counts, screenshots, AT). */
  evidence: unknown;
  /** Reviewing user's id for human verdicts; null for machine verdicts. */
  authorId: string | null;
  /** ISO-8601 last-updated time. */
  updatedAt: string;
}

/**
 * An immutable published revision of an audit's conformance documents. Created
 * when an audit is published: it freezes the document `snapshot` (the reconciled
 * record + metadata the renderers need) so a published document never changes if
 * the WCAG catalog or repo metadata later changes in code. The `publicSlug` is an
 * unguessable capability token for the public, unauthenticated statement link.
 * `version` increments per repo across the repo's published audits.
 */
export interface AuditRevisionRecord {
  /** Opaque revision id (uuid). */
  id: string;
  /** The audit this revision was published from (one revision per audit). */
  auditId: string;
  repoId: number;
  installationId: number;
  /** Per-repo revision number, 1-based. */
  version: number;
  /** Unguessable URL-safe token for the public permalink. */
  publicSlug: string;
  /** Frozen document context (meta + reconciled criteria); app-owned JSON shape. */
  snapshot: unknown;
  /** Commit the revision's audit evaluated. */
  headSha: string;
  /** ISO-8601 publication time. */
  publishedAt: string;
}

/**
 * Thrown by `insertRevision` when a revision collides with an existing one on
 * `(repo_id, version)` — two audits in the same repo published concurrently can
 * compute the same next version. Callers recompute the version and retry; it is
 * distinct from the idempotent `audit_id` conflict, which is a silent no-op.
 */
export class RevisionVersionConflictError extends Error {
  constructor(repoId: number, version: number) {
    super(`revision version ${version} already exists for repo ${repoId}`);
    this.name = 'RevisionVersionConflictError';
  }
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

/**
 * The free-tier license key issued for an installation. One per installation.
 * The token is the Ed25519 `<payload>.<sig>` the Action verifies offline (see
 * packages/licensing/src/sign.mjs and the Action's verifyLicenseKey); we persist
 * it so the dashboard shows a stable key and we re-mint only when it expires.
 */
export interface LicenseRecord {
  /** Installation the key belongs to (primary key). */
  installationId: number;
  /** License subject (`sub`) — the account login the key was minted for. */
  sub: string;
  /** The signed `<payload>.<sig>` token. */
  token: string;
  /** ISO-8601 issuance time. */
  issuedAt: string;
  /** ISO-8601 expiry (mirrors the token's `exp`). */
  expiresAt: string;
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
  /** Fetch one installation (for its account login), or null if unknown. */
  getInstallation(installationId: number): Promise<InstallationRecord | null>;

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
  /** The per-violation detail rows recorded for a scan (empty if none). */
  listViolationsByScan(checkRunId: number): Promise<ViolationRecord[]>;

  /** Create (or replace by id) a conformance audit. */
  upsertAudit(record: AuditRecord): Promise<void>;
  /** Fetch one audit by id, or null if unknown. */
  getAudit(auditId: string): Promise<AuditRecord | null>;
  /** Audits for one installation (most recent first is the caller's concern). */
  listAuditsByInstallation(installationId: number): Promise<AuditRecord[]>;
  /** Move an audit through its lifecycle; sets published_at when publishing. */
  setAuditStatus(auditId: string, status: AuditStatus, publishedAt: string | null): Promise<void>;

  /** Create or replace a verdict (conflict on audit_id + wcag_id + source). */
  upsertVerdict(record: CriterionVerdictRecord): Promise<void>;
  /** All verdicts (machine and human) for an audit. */
  listVerdicts(auditId: string): Promise<CriterionVerdictRecord[]>;

  /**
   * Persist a published revision. Idempotent on `auditId`: if a revision already
   * exists for the audit, this is a no-op (a published revision is immutable).
   */
  insertRevision(record: AuditRevisionRecord): Promise<void>;
  /** The published revision for an audit, or null if it has none. */
  getRevisionByAudit(auditId: string): Promise<AuditRevisionRecord | null>;
  /** Resolve a public permalink slug to its revision, or null if unknown. */
  getRevisionBySlug(publicSlug: string): Promise<AuditRevisionRecord | null>;
  /** A repo's published revisions, most recent (highest version) first. */
  listRevisionsByRepo(repoId: number): Promise<AuditRevisionRecord[]>;

  /** Record (or replace by account id) a Marketplace subscription. */
  upsertSubscription(record: SubscriptionRecord): Promise<void>;
  /** Soft-cancel a subscription: set its cancelled timestamp, keep the row. */
  cancelSubscription(accountId: number, cancelledAt: string): Promise<void>;

  /** The installation's free-tier license, or null if one hasn't been issued. */
  getLicense(installationId: number): Promise<LicenseRecord | null>;
  /** Store (or replace by installation id) the issued license. */
  upsertLicense(record: LicenseRecord): Promise<void>;

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
