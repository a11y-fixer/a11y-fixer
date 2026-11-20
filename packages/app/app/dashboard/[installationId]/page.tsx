// Repo view for one installation. Authorizes the viewer against their linked
// installations (defense in depth on top of RLS), then renders the per-repo
// table shaped by the unit-tested view-model.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSignedInUser } from '../../lib/auth.js';
import { serviceRoleStore } from '../../lib/supabase.js';
import { summarizeInstallation } from '../../../src/dashboard/aggregate.js';
import { installationView } from '../../../src/dashboard/view-model.js';
import { authorizeInstallationView } from '../../../src/auth/installations.js';

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

  const [repos, scans] = await Promise.all([store.listRepos(id), store.listScansByInstallation(id)]);
  const view = installationView(summarizeInstallation(repos, scans));

  return (
    <main className="container">
      <p className="muted">
        <Link href="/dashboard">← Organizations</Link>
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
        <h1>Repositories</h1>
        {!view.isEmpty && (
          <form method="post" action={`/api/installations/${id}/scan`}>
            <button type="submit">Scan all selected repos</button>
          </form>
        )}
      </div>
      <p className="muted">
        {view.scannedRepos}/{view.totalRepos} scanned · {view.coverage} coverage · {view.totalViolations} violations
      </p>
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
