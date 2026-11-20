// Trigger an accessibility scan across an installation's repos.
//
// This is the control plane's first write path: given an installation, mint ONE
// installation token, then for each selected repo discover its a11y-fixer
// workflow and dispatch it. Per-repo failures are collected, never fatal to the
// batch, so one repo without a workflow doesn't block the rest.
//
// SECURITY INVARIANT: the installation token stays in a local const. It is never
// written to a result row, a log, or a thrown Error. `dispatchWorkflow` and
// `listWorkflows` already sanitize their own throws.
import type { Store } from '../db/store.js';
import { getInstallationToken } from './installation-token.js';
import { listWorkflows, selectA11yWorkflow } from './list-workflows.js';
import { dispatchWorkflow } from './dispatch-workflow.js';

type FetchLike = typeof fetch;

export interface DispatchInstallationScanOptions {
  appId: string | number;
  privateKey: string;
  installationId: number;
  store: Store;
  /** Limit to these repo ids (per-repo "Scan now"); omit = all selected repos. */
  repoIds?: number[];
  /** Override the ref; default is each repo's defaultBranch ?? 'main'. */
  ref?: string;
  /** Optional workflow inputs passed through to every dispatch. */
  inputs?: Record<string, string>;
  /** Injectable for tests; defaults to the global `fetch`. */
  fetchImpl?: FetchLike;
  /** Override for GitHub Enterprise Server. */
  baseUrl?: string;
  /** Injectable clock passed through to JWT minting. */
  now?: Date;
}

export type RepoDispatchStatus = 'dispatched' | 'no_workflow' | 'ambiguous_workflow' | 'error';

export interface RepoDispatchResult {
  repoId: number;
  fullName: string;
  status: RepoDispatchStatus;
  /** Pre-sanitized detail for failures (never contains the token). */
  message?: string;
}

export interface ScanDispatchSummary {
  installationId: number;
  requested: number;
  dispatched: number;
  failed: number;
  results: RepoDispatchResult[];
}

/** Split an `owner/name` full name on the first slash. */
function splitFullName(fullName: string): { owner: string; repo: string } | null {
  const slash = fullName.indexOf('/');
  if (slash <= 0 || slash === fullName.length - 1) return null;
  return { owner: fullName.slice(0, slash), repo: fullName.slice(slash + 1) };
}

export async function dispatchInstallationScan(
  opts: DispatchInstallationScanOptions,
): Promise<ScanDispatchSummary> {
  const { appId, privateKey, installationId, store, repoIds, ref, inputs, fetchImpl, baseUrl, now } =
    opts;

  const { token } = await getInstallationToken({
    appId,
    privateKey,
    installationId,
    fetchImpl,
    now,
    baseUrl,
  });

  const all = await store.listRepos(installationId);
  const idFilter = repoIds ? new Set(repoIds) : null;
  // Only repos actually in this installation can match — defense against a
  // crafted repoId that belongs to another installation.
  const targets = all.filter(r => r.selected && (idFilter ? idFilter.has(r.repoId) : true));

  const results: RepoDispatchResult[] = [];
  for (const repo of targets) {
    const base: Pick<RepoDispatchResult, 'repoId' | 'fullName'> = {
      repoId: repo.repoId,
      fullName: repo.fullName,
    };
    try {
      const parts = splitFullName(repo.fullName);
      if (!parts) {
        results.push({ ...base, status: 'error', message: `Malformed repo name: ${repo.fullName}` });
        continue;
      }
      const workflows = await listWorkflows({
        token,
        owner: parts.owner,
        repo: parts.repo,
        fetchImpl,
        baseUrl,
      });
      const selection = selectA11yWorkflow(workflows);
      if (selection.workflow === null) {
        results.push({
          ...base,
          status: selection.reason === 'none' ? 'no_workflow' : 'ambiguous_workflow',
          message:
            selection.reason === 'none'
              ? 'No a11y-fixer workflow found in this repository.'
              : 'Multiple candidate workflows matched; none dispatched.',
        });
        continue;
      }
      await dispatchWorkflow({
        token,
        owner: parts.owner,
        repo: parts.repo,
        workflowId: selection.workflow.id,
        ref: ref ?? repo.defaultBranch ?? 'main',
        inputs,
        fetchImpl,
        baseUrl,
      });
      results.push({ ...base, status: 'dispatched' });
    } catch (err) {
      results.push({
        ...base,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  const dispatched = results.filter(r => r.status === 'dispatched').length;
  return {
    installationId,
    requested: results.length,
    dispatched,
    failed: results.length - dispatched,
    results,
  };
}
