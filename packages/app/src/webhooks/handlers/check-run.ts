// `check_run` webhook handler — the dashboard's primary data source.
//
// The composite Action posts a Check Run named `a11y-fixer` from customer CI
// (github-action `report.ts` → postCheckRun). Subscribing to `check_run` lets
// the control plane record every scan with ZERO Action changes and no phone
// home: we persist only what GitHub already sends us about that Check Run.
//
// We act on `completed` runs named `a11y-fixer` only; every other action or
// Check Run name is ignored. The violation count is the Check Run's annotation
// count (per-annotation detail is a later API fetch, not on the webhook).
import type { CheckRunEvent } from '../events.js';
import type { ScanRecord, Store } from '../../db/store.js';

/** The Check Run name the Action posts; must match github-action `report.ts`. */
export const A11Y_FIXER_CHECK_NAME = 'a11y-fixer';

export async function handleCheckRun(
  event: CheckRunEvent,
  store: Store,
  now: () => Date = () => new Date(),
): Promise<void> {
  if (event.action !== 'completed') return;

  const run = event.check_run;
  if (run.name !== A11Y_FIXER_CHECK_NAME) return;

  const installationId = event.installation?.id;
  if (installationId === undefined) return;

  const record: ScanRecord = {
    checkRunId: run.id,
    repoId: event.repository.id,
    installationId,
    headSha: run.head_sha,
    prNumber: run.pull_requests?.[0]?.number ?? null,
    conclusion: run.conclusion,
    violationCount: run.output?.annotations_count ?? 0,
    createdAt: run.completed_at ?? now().toISOString(),
  };

  await store.upsertScan(record);
}
