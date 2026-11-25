// Compose a conformance document for an audit: load the reconciled record, build
// the shared DocumentMeta from the installation + repo, and hand off to the pure
// builders (vpat/statement/roadmap/letter). Store-backed but format-agnostic —
// the route picks the output format (html/pdf/docx) from the returned model.
//
// Immutability: when an audit is published, `createRevisionForAudit` freezes the
// document context (meta + reconciled criteria) into an `audit_revisions` row.
// Published audits then render from that frozen snapshot, so a finalized document
// never drifts if the WCAG catalog or repo metadata later changes in code. The
// public permalink serves the snapshot directly (buildDocumentFromRevision).
import type { SuccessCriterion } from '@a11y-fixer/core';
import type { AuditRecord, AuditRevisionRecord, Store } from '../../db/store.js';
import { RevisionVersionConflictError } from '../../db/store.js';
import type { ReconciledCriterion } from '../reconcile.js';
import { forPublication } from '../reconcile.js';
import { loadAuditView } from '../audit-service.js';
import { buildAcr } from './vpat.js';
import { buildStatement } from './statement.js';
import { buildRoadmap } from './roadmap.js';
import { buildLetter } from './letter.js';
import type { ConformanceDocument, DocumentFormat, DocumentKind, DocumentMeta } from './model.js';

const CONFORMANCE_TARGET = 'WCAG 2.2 Level AA';
const EVALUATION_METHODS =
  'Automated testing with a11y-fixer (axe-core and eslint-plugin-jsx-a11y) combined with manual review by the vendor’s reviewers. Automated checks can only detect a subset of failures; criteria not confirmed by a person are marked as such.';

/** MIME type + file extension for each output format. */
export const FORMAT_META: Record<DocumentFormat, { contentType: string; ext: string }> = {
  html: { contentType: 'text/html; charset=utf-8', ext: 'html' },
  pdf: { contentType: 'application/pdf', ext: 'pdf' },
  docx: { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' },
};

/**
 * The resolved inputs every document builder needs. This is exactly what a
 * published revision freezes as its `snapshot`, so a snapshot can be replayed
 * through `buildDocument` to reproduce the published document byte-for-byte.
 */
export interface DocumentContext {
  meta: DocumentMeta;
  feedbackContact: string;
  reconciled: readonly ReconciledCriterion[];
}

/** Build any document kind from a resolved context. */
export function buildDocument(ctx: DocumentContext, kind: DocumentKind): ConformanceDocument {
  switch (kind) {
    case 'acr':
      return buildAcr({ meta: ctx.meta, reconciled: ctx.reconciled });
    case 'statement':
      return buildStatement({ meta: ctx.meta, reconciled: ctx.reconciled, feedbackContact: ctx.feedbackContact });
    case 'roadmap':
      return buildRoadmap({ meta: ctx.meta, reconciled: ctx.reconciled });
    case 'letter':
      return buildLetter({ meta: ctx.meta, reconciled: ctx.reconciled });
    default: {
      // Exhaustiveness: a new DocumentKind must get a builder here.
      const _never: never = kind;
      throw new Error(`unhandled document kind: ${String(_never)}`);
    }
  }
}

/** Resolve an audit's live document context from current verdicts + metadata. */
async function resolveLiveContext(
  store: Store,
  criteria: readonly SuccessCriterion[],
  auditId: string,
): Promise<{ audit: AuditRecord; ctx: DocumentContext } | null> {
  const view = await loadAuditView(store, criteria, auditId);
  if (!view) return null;

  const [installation, repos] = await Promise.all([
    store.getInstallation(view.audit.installationId),
    store.listRepos(view.audit.installationId),
  ]);
  const vendor = installation?.account ?? `installation ${view.audit.installationId}`;
  const productName = repos.find(r => r.repoId === view.audit.repoId)?.fullName ?? `repo ${view.audit.repoId}`;

  const meta: DocumentMeta = {
    productName,
    vendor,
    headSha: view.audit.headSha,
    date: (view.audit.publishedAt ?? view.audit.createdAt).slice(0, 10),
    published: view.audit.status === 'published',
    evaluationMethods: EVALUATION_METHODS,
    conformanceTarget: CONFORMANCE_TARGET,
  };
  const feedbackContact = installation ? `https://github.com/${installation.account}` : 'the vendor';
  // The honesty posture: downgrade any unconfirmed machine `supports` to
  // `not_evaluated` for the document (and the frozen snapshot), so a published
  // conformance document never claims conformance no person verified. The
  // reviewer UI reads `view.reconciled` directly and still sees the machine draft.
  const reconciled = forPublication(view.reconciled);
  return { audit: view.audit, ctx: { meta, feedbackContact, reconciled } };
}

export interface BuildAuditDocumentParams {
  installationId: number;
  auditId: string;
  kind: DocumentKind;
}

/**
 * Build the requested conformance document for an audit, or null if the audit is
 * unknown or does not belong to the installation. A published audit renders from
 * its frozen revision snapshot (so authenticated downloads match the public,
 * immutable document); a draft renders live from current verdicts. The caller is
 * responsible for authorizing the viewer before calling.
 */
export async function buildAuditDocument(
  store: Store,
  criteria: readonly SuccessCriterion[],
  params: BuildAuditDocumentParams,
): Promise<ConformanceDocument | null> {
  const resolved = await resolveLiveContext(store, criteria, params.auditId);
  if (!resolved || resolved.audit.installationId !== params.installationId) return null;

  if (resolved.audit.status === 'published') {
    const revision = await store.getRevisionByAudit(params.auditId);
    if (revision) return buildDocumentFromRevision(revision, params.kind);
  }
  return buildDocument(resolved.ctx, params.kind);
}

/** Build a document kind from a published revision's frozen snapshot. */
export function buildDocumentFromRevision(
  revision: AuditRevisionRecord,
  kind: DocumentKind,
): ConformanceDocument {
  return buildDocument(revision.snapshot as DocumentContext, kind);
}

/** Injected id/slug/clock sources for revision creation (deterministic in tests). */
export interface RevisionDeps {
  newId: () => string;
  /** An unguessable, URL-safe public permalink token. */
  newSlug: () => string;
  now: () => string;
}

/**
 * Freeze a published audit's current document context into an immutable revision.
 * Idempotent: if the audit already has a revision, returns it unchanged (a
 * published revision is never rewritten). Returns null if the audit is unknown.
 * Call this only after the audit's status is `published`.
 */
export async function createRevisionForAudit(
  store: Store,
  criteria: readonly SuccessCriterion[],
  auditId: string,
  deps: RevisionDeps,
): Promise<AuditRevisionRecord | null> {
  const existing = await store.getRevisionByAudit(auditId);
  if (existing) return existing;

  const resolved = await resolveLiveContext(store, criteria, auditId);
  if (!resolved) return null;
  const { audit, ctx } = resolved;

  // The per-repo version is computed from a read, so two audits in the same repo
  // published at once can pick the same next version and collide on
  // unique(repo_id, version). Recompute and retry on that specific conflict rather
  // than letting it propagate (the publish has already committed). A few attempts
  // cover any realistic contention; it is not a hot path.
  for (let attempt = 0; attempt < 5; attempt++) {
    // Next version is max(version)+1, not count+1: a future per-audit delete would
    // leave a gap that count+1 could re-pick forever, colliding on every retry.
    const prior = await store.listRevisionsByRepo(audit.repoId);
    const nextVersion = prior.reduce((max, r) => Math.max(max, r.version), 0) + 1;
    const record: AuditRevisionRecord = {
      id: deps.newId(),
      auditId,
      repoId: audit.repoId,
      installationId: audit.installationId,
      version: nextVersion,
      publicSlug: deps.newSlug(),
      snapshot: ctx,
      headSha: audit.headSha,
      publishedAt: audit.publishedAt ?? deps.now(),
    };
    try {
      await store.insertRevision(record);
    } catch (err) {
      if (err instanceof RevisionVersionConflictError) {
        // A concurrent publish took this version; another may have been for this
        // same audit, so re-check audit_id before recomputing.
        const won = await store.getRevisionByAudit(auditId);
        if (won) return won;
        continue;
      }
      throw err;
    }
    // Re-read: a concurrent publish may have won the unique(audit_id) race, in
    // which case insert was a no-op and the winner's revision is the real one.
    return (await store.getRevisionByAudit(auditId)) ?? record;
  }
  // Exhausted retries under sustained contention: the publish still succeeded, so
  // return any revision that now exists; the next publish/view recreates a missing one.
  return store.getRevisionByAudit(auditId);
}

/** Build a download filename like `acr-owner-repo-abc1234.pdf`. */
export function documentFilename(doc: ConformanceDocument, format: DocumentFormat): string {
  const slug = doc.meta.productName.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
  // headSha is a GitHub commit SHA (hex) today, but it rides into a response
  // header, so strip it to safe chars too — a future non-git source cannot then
  // inject CR/LF or quotes into Content-Disposition.
  const sha = doc.meta.headSha.slice(0, 7).replace(/[^a-z0-9]/gi, '');
  return `${doc.kind}-${slug}-${sha}.${FORMAT_META[format].ext}`;
}
