// Narrow TypeScript types for the webhook payload fields the control plane
// actually reads. These are intentionally partial: GitHub sends far more, but
// typing only what we consume keeps the handlers honest about their inputs.

export interface WebhookAccount {
  id: number;
  login: string;
}

export interface WebhookRepository {
  id: number;
  full_name: string;
  private: boolean;
  /** Present on some events (e.g. installation), absent on the slim repo refs. */
  default_branch?: string;
}

export interface WebhookInstallation {
  id: number;
  account: WebhookAccount;
  /** ISO-8601 string when suspended; null/absent otherwise. */
  suspended_at?: string | null;
}

/** `installation` event: created | deleted | suspend | unsuspend | new_permissions_accepted */
export interface InstallationEvent {
  action: string;
  installation: WebhookInstallation;
  /** Repos in scope at install time (present on `created`). */
  repositories?: WebhookRepository[];
}

/** `installation_repositories` event: added | removed */
export interface InstallationRepositoriesEvent {
  action: string;
  installation: WebhookInstallation;
  repository_selection: 'all' | 'selected';
  repositories_added?: WebhookRepository[];
  repositories_removed?: WebhookRepository[];
}

/** A pull request reference as it appears nested in a check_run payload. */
export interface WebhookPullRequestRef {
  number: number;
}

/**
 * The check_run object the dashboard ingests. The Action posts a Check Run named
 * `a11y-fixer` (see github-action `report.ts`), so we read it straight off the
 * webhook with no extra API calls.
 *
 * `output.annotations_count` is the fallback violation count. The Action also
 * embeds a structured scan contract in `output.text` (buildScanReport); when
 * present it carries the exact count plus per-violation detail for the
 * `violations` table (see the check_run handler's parseScanReport).
 */
export interface WebhookCheckRun {
  id: number;
  name: string;
  head_sha: string;
  status: string;
  conclusion: string | null;
  completed_at?: string | null;
  output?: {
    title?: string | null;
    summary?: string | null;
    annotations_count?: number;
    /** JSON scan contract embedded by the Action (schema `a11y-fixer.scan/1`). */
    text?: string | null;
  };
  pull_requests?: WebhookPullRequestRef[];
}

/** `check_run` event: created | completed | rerequested | requested_action */
export interface CheckRunEvent {
  action: string;
  check_run: WebhookCheckRun;
  repository: WebhookRepository;
  installation?: { id: number };
}
