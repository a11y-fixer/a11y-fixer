// Conformance audits for an installation: list existing audits and start a new
// draft from a repo's latest scan. Thin Server Component over the Store; all
// label/shape logic lives in src/conformance/*.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSignedInUser } from '../../../lib/auth.js';
import { serviceRoleStore } from '../../../lib/supabase.js';
import { authorizeInstallationView } from '../../../../src/auth/installations.js';
import { latestScanByRepo } from '../../../../src/conformance/audit-authz.js';
import { statusView } from '../../../../src/conformance/view-model.js';

export const dynamic = 'force-dynamic';

export default async function AuditsPage({
  params,
  searchParams,
}: {
  params: Promise<{ installationId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { installationId } = await params;
  const { error } = await searchParams;
  const id = Number(installationId);
  if (!Number.isInteger(id)) notFound();

  const user = await getSignedInUser();
  if (!user) {
    return (
      <main className="container">
        <p className="panel">
          <a href="/auth/login">Sign in with GitHub</a> to view conformance audits.
        </p>
      </main>
    );
  }

  const store = serviceRoleStore();
  const viewableIds = await store.listInstallationsForUser(user.id);
  if (!authorizeInstallationView(viewableIds, id)) notFound();

  const [audits, repos, scans] = await Promise.all([
    store.listAuditsByInstallation(id),
    store.listRepos(id),
    store.listScansByInstallation(id),
  ]);
  const latest = latestScanByRepo(scans);
  const repoName = new Map(repos.map(r => [r.repoId, r.fullName]));
  const scannableRepos = repos.filter(r => latest.has(r.repoId));
  const sortedAudits = [...audits].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <main className="container">
      <p className="muted">
        <Link href={`/dashboard/${id}`}>← Repositories</Link>
      </p>
      <h1>Conformance audits</h1>
      <p className="muted">
        A VPAT/ACR draft from a repo&apos;s latest scan. Automated results pre-fill the machine-testable
        criteria; a reviewer confirms the rest before publishing.
      </p>

      {error === 'no-scan' && (
        <p className="panel tone-warn" role="status">
          That repository has no completed scan yet. Scan it first, then start an audit.
        </p>
      )}

      <section className="panel">
        <h2>Start a new audit</h2>
        {scannableRepos.length === 0 ? (
          <p className="muted">No repository has a completed scan yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {scannableRepos.map(r => (
              <li
                key={r.repoId}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.25rem 0' }}
              >
                <span>{r.fullName}</span>
                <form method="post" action={`/api/installations/${id}/audits`}>
                  <input type="hidden" name="repoId" value={r.repoId} />
                  <button type="submit">New audit</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sortedAudits.length === 0 ? (
        <p className="panel muted">No audits yet.</p>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Repository</th>
                <th>Commit</th>
                <th>Status</th>
                <th>Created</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAudits.map(a => {
                const status = statusView(a.status);
                return (
                  <tr key={a.id}>
                    <td>{repoName.get(a.repoId) ?? `repo ${a.repoId}`}</td>
                    <td className="muted">{a.headSha.slice(0, 7)}</td>
                    <td className={`tone-${status.tone}`}>{status.label}</td>
                    <td className="muted">{a.createdAt.slice(0, 10)}</td>
                    <td>
                      <Link href={`/dashboard/${id}/audits/${a.id}`}>Open</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
