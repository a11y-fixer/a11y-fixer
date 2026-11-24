// Reviewer view for one conformance audit: the reconciled criteria table where
// a tester records a verdict per success criterion, plus the publish gate.
// Thin Server Component; reconciliation + labels come from src/conformance/*.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SUCCESS_CRITERIA } from '@a11y-fixer/core/wcag';
import { getSignedInUser } from '../../../../lib/auth.js';
import { serviceRoleStore } from '../../../../lib/supabase.js';
import { env } from '../../../../lib/env.js';
import { authorizeInstallationView } from '../../../../../src/auth/installations.js';
import { auditBelongsTo, scopeRevisionsToInstallation } from '../../../../../src/conformance/audit-authz.js';
import { loadAuditView } from '../../../../../src/conformance/audit-service.js';
import { auditPageView, verdictView, SELECTABLE_VERDICTS } from '../../../../../src/conformance/view-model.js';

export const dynamic = 'force-dynamic';

export default async function AuditDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ installationId: string; auditId: string }>;
  searchParams: Promise<{ published?: string; blocked?: string }>;
}) {
  const { installationId, auditId } = await params;
  const { published, blocked } = await searchParams;
  const id = Number(installationId);
  if (!Number.isInteger(id)) notFound();

  const user = await getSignedInUser();
  if (!user) {
    return (
      <main className="container">
        <p className="panel">
          <a href="/auth/login">Sign in with GitHub</a> to review this audit.
        </p>
      </main>
    );
  }

  const store = serviceRoleStore();
  const viewableIds = await store.listInstallationsForUser(user.id);
  if (!authorizeInstallationView(viewableIds, id)) notFound();

  const audit = await store.getAudit(auditId);
  if (!auditBelongsTo(audit, id)) notFound();

  const view = await loadAuditView(store, SUCCESS_CRITERIA, auditId);
  if (!view) notFound();
  const page = auditPageView(view);
  const verdictPost = `/api/installations/${id}/audits/${auditId}/verdict`;
  const docBase = `/api/installations/${id}/audits/${auditId}/document`;
  // A published audit is a finalized conformance record: it is read-only, so no
  // verdict forms or publish button render (the routes enforce this too).
  const isPublished = audit.status === 'published';

  // Published revision (for the public permalink) + the repo's revision history,
  // scoped and renumbered per-installation (see scopeRevisionsToInstallation: the
  // service-role store bypasses RLS, and a repo keeps its repo_id across an org
  // transfer, so both the rows and the version numbers are scoped here).
  const revision = isPublished ? await store.getRevisionByAudit(auditId) : null;
  const history = scopeRevisionsToInstallation(await store.listRevisionsByRepo(audit.repoId), id);
  const publicUrl = revision ? `${env.appBaseUrl()}/statement/${revision.publicSlug}` : null;
  const revisionDisplay = revision ? history.find(h => h.revision.id === revision.id)?.displayVersion : undefined;
  // A published audit whose revision snapshot never landed (a rare concurrent-publish
  // race, or a transient DB error swallowed by the publish route) has no public link.
  // Re-POSTing publish is idempotent and recreates the revision, so offer that retry.
  const publicLinkPending = isPublished && !revision;

  return (
    <main className="container">
      <p className="muted">
        <Link href={`/dashboard/${id}/audits`}>← Audits</Link>
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
        <h1>Conformance audit</h1>
        <span className={`tone-${page.status.tone}`}>{page.status.label}</span>
      </div>
      <p className="muted">
        Commit {audit.headSha.slice(0, 7)} · {page.reviewedCount}/{page.totalCount} criteria reviewed
      </p>

      {published && (
        <p className="panel tone-good" role="status">
          Audit published. No Supports claim rests on automated evidence alone.
        </p>
      )}
      {blocked && (
        <p className="panel tone-bad" role="status">
          Can&apos;t publish yet: {blocked} criterion(s) claimed Supports still need reviewer confirmation
          (highlighted below).
        </p>
      )}

      {!isPublished && (
        <section className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <span className={page.canPublish ? 'tone-good' : 'tone-warn'}>{page.readiness}</span>
          <form method="post" action={`/api/installations/${id}/audits/${auditId}/publish`}>
            <button type="submit" disabled={!page.canPublish}>
              Publish
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <h2 style={{ marginTop: 0 }}>Documents</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {isPublished
            ? 'Published conformance documents for this audit.'
            : 'Draft previews — exports are watermarked “not for distribution” until the audit is published.'}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <strong>VPAT / ACR</strong>{' '}
            <a href={`${docBase}?doc=acr&format=html`} target="_blank" rel="noopener">HTML</a> ·{' '}
            <a href={`${docBase}?doc=acr&format=pdf`}>PDF</a> ·{' '}
            <a href={`${docBase}?doc=acr&format=docx`}>DOCX</a>
          </li>
          <li>
            <strong>Accessibility Statement</strong>{' '}
            <a href={`${docBase}?doc=statement&format=html`} target="_blank" rel="noopener">HTML</a> ·{' '}
            <a href={`${docBase}?doc=statement&format=pdf`}>PDF</a> ·{' '}
            <a href={`${docBase}?doc=statement&format=docx`}>DOCX</a>
          </li>
          <li>
            <strong>Remediation Roadmap</strong>{' '}
            <a href={`${docBase}?doc=roadmap&format=html`} target="_blank" rel="noopener">HTML</a> ·{' '}
            <a href={`${docBase}?doc=roadmap&format=pdf`}>PDF</a> ·{' '}
            <a href={`${docBase}?doc=roadmap&format=docx`}>DOCX</a>
          </li>
          <li>
            <strong>Conformance Letter</strong>{' '}
            <a href={`${docBase}?doc=letter&format=html`} target="_blank" rel="noopener">HTML</a> ·{' '}
            <a href={`${docBase}?doc=letter&format=pdf`}>PDF</a> ·{' '}
            <a href={`${docBase}?doc=letter&format=docx`}>DOCX</a>
          </li>
        </ul>
      </section>

      {publicUrl && revision && (
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Public link</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Anyone with this link can read the published accessibility statement (revision {revisionDisplay ?? 1}).
            It serves a frozen snapshot, so it never changes. The ACR, roadmap, and letter are reachable from the
            same link with <code>?doc=acr</code>, <code>?doc=roadmap</code>, or <code>?doc=letter</code>.
          </p>
          <p>
            <a href={publicUrl} target="_blank" rel="noopener">
              {publicUrl}
            </a>
          </p>
        </section>
      )}

      {publicLinkPending && (
        <section className="panel tone-warn" role="status">
          <h2 style={{ marginTop: 0 }}>Public link pending</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            This audit is published, but its shareable snapshot did not finish saving. Retry to generate the
            public link; publishing is idempotent, so this will not change the audit.
          </p>
          <form method="post" action={`/api/installations/${id}/audits/${auditId}/publish`}>
            <button type="submit">Retry public link</button>
          </form>
        </section>
      )}

      {history.length > 0 && (
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>Published revisions</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Every published audit for this repository, newest first. Each revision is immutable.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {history.map(({ revision: rev, displayVersion }) => (
              <li key={rev.id}>
                <strong>Revision {displayVersion}</strong> · {rev.publishedAt.slice(0, 10)} · commit{' '}
                {rev.headSha.slice(0, 7)}
                {rev.auditId === auditId && <span className="muted"> · this audit</span>}{' '}
                <a href={`/statement/${rev.publicSlug}`} target="_blank" rel="noopener">
                  public link
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="panel" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Level</th>
              <th>Verdict</th>
              <th>Source</th>
              <th>Reviewer verdict</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map(row => (
              <tr
                key={row.wcagId}
                id={`sc-${row.wcagId.replace(/\./g, '')}`}
                className={row.blocksPublish ? 'tone-bad' : undefined}
              >
                <td>
                  <strong>{row.wcagId}</strong> {row.title}
                  {row.remarks && (
                    <div className="muted" style={{ fontSize: '0.85em', marginTop: '0.25rem' }}>
                      {row.remarks}
                    </div>
                  )}
                </td>
                <td>{row.level}</td>
                <td className={`tone-${row.verdictTone}`}>
                  {row.verdictLabel}
                  {row.needsHumanReview && <span className="muted"> · unreviewed</span>}
                </td>
                <td className="muted">{row.source}</td>
                <td>
                  {isPublished ? (
                    <span className="muted">{verdictView(row.verdict).label}</span>
                  ) : (
                    <form
                      method="post"
                      action={verdictPost}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                    >
                      <input type="hidden" name="wcagId" value={row.wcagId} />
                      <select name="verdict" defaultValue={row.source === 'human' ? row.verdict : ''} aria-label={`Verdict for ${row.wcagId}`}>
                        <option value="" disabled>
                          Choose…
                        </option>
                        {SELECTABLE_VERDICTS.map(v => (
                          <option key={v} value={v}>
                            {verdictView(v).label}
                          </option>
                        ))}
                      </select>
                      <input type="text" name="remarks" placeholder="Remarks (optional)" aria-label={`Remarks for ${row.wcagId}`} />
                      <button type="submit">Save</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
