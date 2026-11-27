// Repo view for one installation. Authorizes the viewer against their linked
// installations (defense in depth on top of RLS), then renders the per-repo
// table shaped by the unit-tested view-model.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSignedInUser } from '../../lib/auth.js';
import { serviceRoleStore } from '../../lib/supabase.js';
import { env } from '../../lib/env.js';
import { summarizeInstallation } from '../../../src/dashboard/aggregate.js';
import { installationView, setupView, type SetupView } from '../../../src/dashboard/view-model.js';
import { authorizeInstallationView } from '../../../src/auth/installations.js';
import { getOrCreateInstallationLicense } from '../../../src/licensing/provision.js';
import type { Store } from '../../../src/db/store.js';
import { CopyButton } from '../CopyButton.js';

/**
 * The installation's free-tier license + setup instructions. Resilient: if the
 * signing key isn't configured yet (or minting fails), returns null so the rest
 * of the dashboard still renders rather than erroring the whole page.
 */
async function loadSetup(store: Store, installationId: number): Promise<SetupView | null> {
  try {
    const installation = await store.getInstallation(installationId);
    if (!installation) return null;
    const license = await getOrCreateInstallationLicense(store, {
      installationId,
      account: installation.account,
      signingKeyPem: env.licenseSigningKey(),
    });
    return setupView(license);
  } catch {
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function InstallationPage({
  params,
  searchParams,
}: {
  params: Promise<{ installationId: string }>;
  searchParams: Promise<{ scan?: string }>;
}) {
  const { installationId } = await params;
  const { scan } = await searchParams;
  const id = Number(installationId);
  if (!Number.isInteger(id)) notFound();

  const user = await getSignedInUser();
  if (!user) {
    return (
      <main className="container">
        <p className="panel">
          <a href="/auth/login">Sign in with GitHub</a> to view this organization.
        </p>
      </main>
    );
  }

  const store = serviceRoleStore();
  const viewableIds = await store.listInstallationsForUser(user.id);
  if (!authorizeInstallationView(viewableIds, id)) notFound();

  const [repos, scans, setup] = await Promise.all([
    store.listRepos(id),
    store.listScansByInstallation(id),
    loadSetup(store, id),
  ]);
  const view = installationView(summarizeInstallation(repos, scans));

  return (
    <main className="container">
      <p className="muted">
        <Link href="/dashboard">← Organizations</Link>
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
        <h1>Repositories</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href={`/dashboard/${id}/ledger`}>Conformance ledger →</Link>
          <Link href={`/dashboard/${id}/audits`}>Conformance audits →</Link>
          {!view.isEmpty && (
            <form method="post" action={`/api/installations/${id}/scan`}>
              <button type="submit">Scan all selected repos</button>
            </form>
          )}
        </div>
      </div>
      <p className="muted">
        {view.scannedRepos}/{view.totalRepos} scanned · {view.coverage} coverage · {view.totalViolations} violations
      </p>
      {setup && (
        <details className="panel" open={view.scannedRepos === 0}>
          <summary>
            <strong>Set up scanning</strong> <span className="muted">— free plan · key valid through {setup.expiresOn}</span>
          </summary>
          <ol>
            <li>
              Add this repository (or organization) secret named <code>{setup.secretName}</code>:
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', margin: '0.5rem 0' }}>
                <input
                  type="text"
                  readOnly
                  value={setup.licenseKey}
                  aria-label="License key"
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
                <CopyButton value={setup.licenseKey} label="Copy key" />
              </div>
              <span className="muted">Public repos run free without a key; private repos need it.</span>
            </li>
            <li style={{ marginTop: '0.75rem' }}>
              Commit this workflow as <code>{setup.workflowPath}</code>:
              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0.5rem 0' }}>
                <CopyButton value={setup.workflowYaml} label="Copy workflow" />
              </div>
              <pre style={{ overflowX: 'auto' }}>
                <code>{setup.workflowYaml}</code>
              </pre>
            </li>
          </ol>
        </details>
      )}
      {scan && (
        <p className="panel" role="status">
          Scan requested — dispatched {scan} selected repositories. Results appear here as each
          workflow completes.
        </p>
      )}
      {view.isEmpty ? (
        <p className="panel muted">No repositories in this installation yet.</p>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Repository</th>
                <th>Status</th>
                <th>Violations</th>
                <th>Trend</th>
                <th>Last scan</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map(row => (
                <tr key={row.repoId}>
                  <td>
                    {row.fullName} <span className="muted">· {row.visibility}</span>
                  </td>
                  <td className={`tone-${row.conclusion.tone}`}>{row.conclusion.label}</td>
                  <td>{row.violations}</td>
                  <td className={`tone-${row.trend.tone}`}>
                    {row.trend.symbol} {row.trend.label}
                  </td>
                  <td className="muted">{row.lastScan}</td>
                  <td>
                    <form method="post" action={`/api/installations/${id}/scan`}>
                      <input type="hidden" name="repoId" value={row.repoId} />
                      <button type="submit">Scan</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
