// List a repo's Actions workflows and pick the a11y-fixer one to dispatch.
//
// The control plane can't assume a fixed workflow filename — the one concrete
// customer example is named "a11y-fixer demo" in `a11y-demo.yml`. So we list the
// repo's workflows and match by name/path heuristic, dispatching the result's
// numeric id (more robust than a filename guess).
//
// SECURITY INVARIANT: the installation token passed in lives in request memory
// only — never persisted, logged, or placed in a thrown Error.

type FetchLike = typeof fetch;

export interface WorkflowSummary {
  id: number;
  name: string;
  /** Repo-relative path, e.g. `.github/workflows/a11y-demo.yml`. */
  path: string;
  /** `active`, `disabled_manually`, etc. */
  state: string;
}

export interface ListWorkflowsOptions {
  /** The `ghs_*` installation token. Never persist or log this value. */
  token: string;
  owner: string;
  repo: string;
  /** Injectable for tests; defaults to the global `fetch`. */
  fetchImpl?: FetchLike;
  /** Override for GitHub Enterprise Server. */
  baseUrl?: string;
}

interface WorkflowListResponse {
  workflows?: unknown;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toSummary(raw: unknown): WorkflowSummary | null {
  if (
    isObject(raw) &&
    typeof raw.id === 'number' &&
    typeof raw.name === 'string' &&
    typeof raw.path === 'string' &&
    typeof raw.state === 'string'
  ) {
    return { id: raw.id, name: raw.name, path: raw.path, state: raw.state };
  }
  return null;
}

/**
 * Fetches the repo's workflows (first page, up to 100 — far beyond any real
 * repo's workflow count). Throws sanitized on a non-2xx response.
 */
export async function listWorkflows(opts: ListWorkflowsOptions): Promise<WorkflowSummary[]> {
  const { token, owner, repo, fetchImpl = fetch, baseUrl = 'https://api.github.com' } = opts;

  const res = await fetchImpl(`${baseUrl}/repos/${owner}/${repo}/actions/workflows?per_page=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to list workflows for ${owner}/${repo}: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as WorkflowListResponse;
  if (!Array.isArray(body.workflows)) return [];
  return body.workflows.map(toSummary).filter((w): w is WorkflowSummary => w !== null);
}

/** Matches an a11y-fixer workflow by name or file path. */
const A11Y_WORKFLOW = /a11y[-_ ]?fixer|a11y/i;

export type WorkflowSelection =
  | { workflow: WorkflowSummary }
  | { workflow: null; reason: 'none' | 'ambiguous' };

/**
 * Pure: pick the single a11y-fixer workflow from a repo's workflows. Returns
 * `none` when nothing matches and `ambiguous` when more than one does — we never
 * guess which of several to run.
 */
export function selectA11yWorkflow(workflows: WorkflowSummary[]): WorkflowSelection {
  const matches = workflows.filter(w => A11Y_WORKFLOW.test(w.name) || A11Y_WORKFLOW.test(w.path));
  if (matches.length === 1) return { workflow: matches[0] };
  return { workflow: null, reason: matches.length === 0 ? 'none' : 'ambiguous' };
}
