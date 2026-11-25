// Internal, author-only telemetry analytics. Gated by a GitHub-login allowlist
// (ADMIN_GITHUB_LOGINS); non-admins get a 404 (no existence oracle). All shaping
// is done by the unit-tested src/** helpers; this file authenticates and renders.
import { notFound } from 'next/navigation';
import { getSignedInUser } from '../../lib/auth.js';
import { serviceRoleStore } from '../../lib/supabase.js';
import { env } from '../../lib/env.js';
import { isAdminLogin, parseAdminLogins } from '../../../src/admin/access.js';
import { summarizeActionRuns } from '../../../src/dashboard/telemetry.js';

export const dynamic = 'force-dynamic';

// Upper bound on rows pulled for the summary. The totals say "(last N)" when the
// table is larger; raise this or add a server-side aggregate if it ever matters.
const FETCH_LIMIT = 5000;

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel" style={{ flex: '1 1 8rem' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</div>
      <div className="muted" style={{ fontSize: '0.85rem' }}>{label}</div>
    </div>
  );
}

export default async function TelemetryPage() {
  const user = await getSignedInUser();
  if (!user) {
    return (
      <main className="container">
        <h1>a11y-fixer</h1>
        <p className="panel">
          <a href="/auth/login">Sign in with GitHub</a> to continue.
        </p>
      </main>
    );
  }

  const store = serviceRoleStore();
  const record = await store.getUser(user.id);
  const allowed = parseAdminLogins(env.adminGithubLogins());
  if (!isAdminLogin(record?.githubLogin, allowed)) {
    // Signed in, but not an allowlisted author: behave as if the page is absent.
    notFound();
  }

  const rows = await store.listRecentActionRuns(FETCH_LIMIT);
  const summary = summarizeActionRuns(rows, FETCH_LIMIT);
  const totalLabel = summary.capped ? `Runs (last ${FETCH_LIMIT})` : 'Total runs';

  return (
    <main className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>Action telemetry</h1>
        <a href="/dashboard" className="muted" style={{ textDecoration: 'none' }}>
          ← Dashboard
        </a>
      </header>
      <p className="muted">
        Anonymous, opt-in usage events (<code>telemetry: on</code>). No repo, owner, or identity is
        recorded — these are run counts, not people.
      </p>

      {summary.total === 0 ? (
        <p className="panel muted">
          No telemetry yet. Events arrive once a run sets <code>telemetry: on</code> on a released
          version of the Action.
        </p>
      ) : (
        <>
          <section style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <Tile label={totalLabel} value={summary.total} />
            <Tile label="Licensed runs" value={summary.licensedRuns} />
            <Tile label="Public-tier runs" value={summary.publicRuns} />
            <Tile label="Fixes applied" value={summary.totalFixesApplied} />
          </section>

          <section style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', marginTop: '1rem' }}>
            <div className="panel">
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>By mode</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {summary.byMode.map(m => (
                  <li key={m.mode} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{m.mode}</span>
                    <span className="muted">{m.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel">
              <h2 style={{ marginTop: 0, fontSize: '1rem' }}>By day</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {summary.byDay.slice(0, 14).map(d => (
                  <li key={d.day} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{d.day}</span>
                    <span className="muted">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="panel" style={{ marginTop: '1rem', overflowX: 'auto' }}>
            <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Recent runs</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>When</th>
                  <th>Mode</th>
                  <th>Tier</th>
                  <th>Before→After</th>
                  <th>Fixes</th>
                  <th>Version</th>
                  <th>OS</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent.map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border, #333)' }}>
                    <td>{r.createdAt ? r.createdAt.replace('T', ' ').slice(0, 16) : '—'}</td>
                    <td>{r.mode}</td>
                    <td>{r.licensed ? 'licensed' : r.publicRepo ? 'public' : '—'}</td>
                    <td>{r.violationsBefore}→{r.violationsAfter}</td>
                    <td>{r.fixesApplied}</td>
                    <td>{r.actionVersion ?? '—'}</td>
                    <td className="muted">{r.platform}/{r.arch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}
