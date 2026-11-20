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

/** The Check Run fields the control plane reads (the rest of the payload is ignored). */
export interface WebhookCheckRun {
  id: number;
  name: string;
  head_sha: string;
  conclusion: string | null;
  /** `output.text` carries the a11y-fixer scan contract (see check-run handler). */
  output?: { title?: string | null; summary?: string | null; text?: string | null };
  /** PRs GitHub associated with the head sha, when any. */
  pull_requests?: Array<{ number: number }>;
}

/** `check_run` event: created | completed | rerequested | requested_action */
export interface CheckRunEvent {
  action: string;
  check_run: WebhookCheckRun;
  repository: WebhookRepository;
  /** Present on App webhooks; absent on some legacy deliveries. */
  installation?: { id: number };
}
