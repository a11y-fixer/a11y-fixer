// The Conformance Ledger read-model for an installation: the signed, tamper-
// evident per-page conformance record. Thin Server Component over the Store; each
// subject's chain is re-verified on load and all shape logic lives in
// src/conformance/ledger-verify.ts.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSignedInUser } from '../../../lib/auth.js';
import { serviceRoleStore } from '../../../lib/supabase.js';
import { authorizeInstallationView } from '../../../../src/auth/installations.js';
import { conformanceKeyringFromEnv } from '../../../../src/conformance/keyring.js';
import { buildLedgerReadModel } from '../../../../src/conformance/ledger-verify.js';
import { repoIdOfSubjectKey, pathOfSubjectKey } from '../../../../src/conformance/claim.js';

export const dynamic = 'force-dynamic';

export default async function LedgerPage({
  params,
}: {
  params: Promise<{ installationId: string }>;
}) {
  const { installationId } = await params;
  const id = Number(installationId);
  if (!Number.isInteger(id)) notFound();

  const user = await getSignedInUser();
  if (!user) {
    return (
      <main className="container">
        <p className="panel">
          <a href="/auth/login">Sign in with GitHub</a> to view the conformance ledger.
        </p>
      </main>
    );
  }

  const store = serviceRoleStore();
  const viewableIds = await store.listInstallationsForUser(user.id);
  if (!authorizeInstallationView(viewableIds, id)) notFound();

  const keyring = conformanceKeyringFromEnv();
  if (Object.keys(keyring).length === 0) {
    return (
      <main className="container">
        <p className="muted">
          <Link href={`/dashboard/${id}`}>← Repositories</Link>
        </p>
        <h1>Conformance ledger</h1>
        <p className="panel tone-warn">
          Ledger signing/verification isn&apos;t configured yet — the CONFORMANCE public key
          environment variable isn&apos;t set, so chains can&apos;t be verified.
        </p>
      </main>
    );
  }

  const repos = await store.listRepos(id);
  const repoName = new Map(repos.map(r => [r.repoId, r.fullName]));
  const owned = new Set(repos.map(r => r.repoId));

  const allKeys = await store.listSubjectKeys();
  const keys = allKeys.filter(k => {
    const rid = repoIdOfSubjectKey(k);
    return rid !== null && owned.has(rid);
  });

  const model = await buildLedgerReadModel(store, keyring, keys);

  const stateOrder: SubjectState[] = [
    'pass',
    'fail',
    'not-applicable',
    'not-evaluated',
    'human-reviewed',
  ];
  const conformanceSummary = (counts: Record<SubjectState, number>): string =>
    stateOrder
      .filter(s => counts[s] > 0)
      .map(s => `${counts[s]} ${s}`)
      .join(' · ');

  return (
    <main className="container">
      <p className="muted">
        <Link href={`/dashboard/${id}`}>← Repositories</Link>
      </p>
      <h1>Conformance ledger</h1>
      <p className="muted">
        The signed, tamper-evident per-page conformance record. Each row&apos;s claim chain is
        re-verified on load, so a tampered subject can never masquerade as a clean conformance row.
      </p>

      <p className="muted">
        {model.subjects.length} subject{model.subjects.length === 1 ? '' : 's'}.
      </p>
      {!model.ok && (
        <p className="panel tone-warn" role="status">
          {model.subjects.filter(s => !s.verdict.ok).length} subject chain(s) FAILED verification —
          do not trust them.
        </p>
      )}

      {model.subjects.length === 0 ? (
        <p className="panel muted">No conformance claims recorded yet.</p>
      ) : (
        <div className="panel" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Repository</th>
                <th>Page</th>
                <th>Verified</th>
                <th>Claims</th>
                <th>Conformance</th>
              </tr>
            </thead>
            <tbody>
              {model.subjects.map(s => {
                const repo = repoName.get(repoIdOfSubjectKey(s.subjectKey) ?? -1) ?? 'repo …';
                const page = pathOfSubjectKey(s.subjectKey) ?? s.subjectKey;
                return (
                  <tr key={s.subjectKey}>
                    <td>{repo}</td>
                    <td className="muted">{page}</td>
                    {s.verdict.ok ? (
                      <td className="tone-good">✓ verified</td>
                    ) : (
                      <td className="tone-warn">✗ {s.verdict.reason}</td>
                    )}
                    <td>{s.claimCount}</td>
                    <td>{s.verdict.ok ? conformanceSummary(s.stateCounts) || '—' : '—'}</td>
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

type SubjectState = 'pass' | 'fail' | 'not-applicable' | 'not-evaluated' | 'human-reviewed';
