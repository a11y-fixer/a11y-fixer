// Compose a conformance document for an audit: load the reconciled record, build
// the shared DocumentMeta from the installation + repo, and hand off to the pure
// VPAT/statement builders. Store-backed but format-agnostic — the route picks
// the output format (html/pdf/docx) from the returned model.
import type { SuccessCriterion } from '@a11y-fixer/core';
import type { Store } from '../../db/store.js';
import { loadAuditView } from '../audit-service.js';
import { buildAcr } from './vpat.js';
import { buildStatement } from './statement.js';
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

export interface BuildAuditDocumentParams {
  installationId: number;
  auditId: string;
  kind: DocumentKind;
}

/**
 * Build the requested conformance document for an audit, or null if the audit is
 * unknown or does not belong to the installation. The caller is responsible for
 * authorizing the viewer before calling.
 */
export async function buildAuditDocument(
  store: Store,
  criteria: readonly SuccessCriterion[],
  params: BuildAuditDocumentParams,
): Promise<ConformanceDocument | null> {
  const view = await loadAuditView(store, criteria, params.auditId);
  if (!view || view.audit.installationId !== params.installationId) return null;

  const [installation, repos] = await Promise.all([
    store.getInstallation(params.installationId),
    store.listRepos(params.installationId),
  ]);
  const vendor = installation?.account ?? `installation ${params.installationId}`;
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

  if (params.kind === 'acr') {
    return buildAcr({ meta, reconciled: view.reconciled });
  }
  return buildStatement({
    meta,
    reconciled: view.reconciled,
    feedbackContact: installation ? `https://github.com/${installation.account}` : 'the vendor',
  });
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
