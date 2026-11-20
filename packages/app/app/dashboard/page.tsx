// Org (installation) list for the signed-in user. Reads the user's visible
// installation ids, summarizes each, and links through to its repo view. All
// shaping is done by the unit-tested src/** helpers; this file just renders.
import Link from 'next/link';
import { getSignedInUser } from '../lib/auth.js';
import { serviceRoleStore } from '../lib/supabase.js';
import { summarizeInstallation } from '../../src/dashboard/aggregate.js';
import { installationView } from '../../src/dashboard/view-model.js';

export const dynamic = 'force-dynamic';

function accountOf(repoFullNames: string[]): string {
  const first = repoFullNames[0];
  return first ? first.split('/')[0] : 'Installation';
}

export default async function DashboardPage() {
  const user = await getSignedInUser();
  if (!user) {
    return (
      <main className="container">
        <h1>a11y-fixer</h1>
        <p className="muted">Accessibility coverage across your repositories.</p>
        <p className="panel">
          <a href="/auth/login">Sign in with GitHub</a> to see the organizations where the
          a11y-fixer GitHub App is installed.
        </p>
      </main>
    );
  }

  const store = serviceRoleStore();
  const installationIds = await store.listInstallationsForUser(user.id);

  const orgs = await Promise.all(
    installationIds.map(async id => {
      const [repos, scans] = await Promise.all([store.listRepos(id), store.listScansByInstallation(id)]);
      const view = installationView(summarizeInstallation(repos, scans));
      return { id, account: accountOf(repos.map(r => r.fullName)), view };
    }),
  );

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Organizations</h1>
        <Link href="/auth/sign-out" className="muted">
          Sign out
        </Link>
      </header>
      {orgs.length === 0 ? (
        <p className="panel muted">No installations yet. Install the a11y-fixer GitHub App on a repository.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
          {orgs.map(org => (
            <li key={org.id} className="panel">
              <Link href={`/dashboard/${org.id}`} style={{ fontWeight: 600, textDecoration: 'none' }}>
                {org.account}
              </Link>
              <div className="muted" style={{ marginTop: '0.35rem' }}>
                {org.view.scannedRepos}/{org.view.totalRepos} repos scanned · {org.view.coverage} coverage ·{' '}
                {org.view.totalViolations} violations
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
