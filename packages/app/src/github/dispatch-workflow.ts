// Trigger a scan by dispatching a customer repo's `workflow_dispatch` workflow.
//
// The control plane does not scan; it asks the customer's own CI to run the
// composite Action (`a11y-fixer/a11y-fixer`). This calls GitHub's
// `POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches`, which the App's
// `actions: write` permission authorizes.
//
// SECURITY INVARIANT (inherited from installation-token.ts): the installation
// token passed in lives in request memory only. It is never written to the
// database, a log line, or an error message. Do not add the token to any thrown
// Error.

type FetchLike = typeof fetch;

export interface DispatchWorkflowOptions {
  /** The `ghs_*` installation token. Never persist or log this value. */
  token: string;
  /** Repository owner (org or user login). */
  owner: string;
  /** Repository name (without the owner). */
  repo: string;
  /** Numeric workflow id (preferred) or workflow file name (`a11y.yml`). */
  workflowId: string | number;
  /** Branch or tag the workflow runs on (must exist on the default branch). */
  ref: string;
  /** Optional workflow inputs; omitted entirely when empty (undeclared inputs → 422). */
  inputs?: Record<string, string>;
  /** Injectable for tests; defaults to the global `fetch`. */
  fetchImpl?: FetchLike;
  /** Override for GitHub Enterprise Server. */
  baseUrl?: string;
}

/**
 * Dispatches the workflow. Resolves on GitHub's 204 No Content. Throws on a
 * non-2xx response WITHOUT including the token or any credential in the message.
 */
export async function dispatchWorkflow(opts: DispatchWorkflowOptions): Promise<void> {
  const {
    token,
    owner,
    repo,
    workflowId,
    ref,
    inputs,
    fetchImpl = fetch,
    baseUrl = 'https://api.github.com',
  } = opts;

  const body: { ref: string; inputs?: Record<string, string> } = { ref };
  if (inputs && Object.keys(inputs).length > 0) body.inputs = inputs;

  const res = await fetchImpl(
    `${baseUrl}/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw new Error(
      `Failed to dispatch workflow for ${owner}/${repo}: ${res.status} ${res.statusText}`,
    );
  }
}
