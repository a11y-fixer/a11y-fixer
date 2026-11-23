// Audit service: the store-backed orchestration behind the reviewer UI.
//
// Pure helpers (derive, reconcile) stay dependency-free; this module wires them
// to a `Store`. The catalog is injected (not imported as a value) so this layer
// — and its tests — never depend on @a11y-fixer/core being built. Clock and id
// generation are injected too, keeping every function deterministic under test.
import type { SuccessCriterion } from '@a11y-fixer/core';
import type { AuditRecord, CriterionVerdictRecord, Store, VerdictValue } from '../db/store.js';
import { deriveMachineVerdicts } from './derive.js';
import { reconcile, canPublish, publishBlockers, type ReconciledCriterion } from './reconcile.js';

/** Injected side-effect sources, so callers (and tests) control time and ids. */
export interface AuditDeps {
  /** Returns the current time as ISO-8601. */
  now: () => string;
  /** Returns a fresh unique id (uuid in production). */
  newId: () => string;
}

export interface CreateDraftParams {
  repoId: number;
  installationId: number;
  headSha: string;
  /** The scan (Check Run) the machine draft is derived from. */
  checkRunId: number;
}

/**
 * Create a draft audit for a scan: derive machine verdicts from the scan's
 * violations crossed with the catalog, and persist the audit + one machine
 * verdict per criterion. Returns the new audit record.
 */
export async function createDraftAudit(
  store: Store,
  criteria: readonly SuccessCriterion[],
  params: CreateDraftParams,
  deps: AuditDeps,
): Promise<AuditRecord> {
  const violations = await store.listViolationsByScan(params.checkRunId);
  const machine = deriveMachineVerdicts(criteria, violations);
  const createdAt = deps.now();

  const audit: AuditRecord = {
    id: deps.newId(),
    repoId: params.repoId,
    installationId: params.installationId,
    headSha: params.headSha,
    basisCheckRunId: params.checkRunId,
    status: 'draft',
    createdAt,
    publishedAt: null,
  };
  await store.upsertAudit(audit);

  for (const m of machine) {
    await store.upsertVerdict({
      id: deps.newId(),
      auditId: audit.id,
      wcagId: m.wcagId,
      source: 'machine',
      verdict: m.verdict,
      remarks: m.remarks,
      evidence: m.evidence,
      authorId: null,
      updatedAt: createdAt,
    });
  }
  return audit;
}

export interface HumanVerdictParams {
  auditId: string;
  wcagId: string;
  verdict: VerdictValue;
  remarks: string;
  evidence?: unknown;
  /** Reviewing user's id. */
  authorId: string;
}

/** Thrown when a mutation targets an audit that is already published (read-only). */
export class AuditPublishedError extends Error {
  constructor(auditId: string) {
    super(`audit ${auditId} is published and cannot be modified`);
    this.name = 'AuditPublishedError';
  }
}

/**
 * Record (or replace) a human reviewer's verdict for one criterion. Moves a
 * `draft` audit to `in_review` on the first human verdict; leaves `in_review`
 * audits' status untouched. A `published` audit is a finalized conformance
 * record and is immutable: this throws `AuditPublishedError` rather than
 * silently rewriting a published claim.
 */
export async function recordHumanVerdict(
  store: Store,
  params: HumanVerdictParams,
  deps: AuditDeps,
): Promise<void> {
  const audit = await store.getAudit(params.auditId);
  if (!audit) throw new Error(`audit ${params.auditId} not found`);
  if (audit.status === 'published') throw new AuditPublishedError(params.auditId);

  await store.upsertVerdict({
    id: deps.newId(),
    auditId: params.auditId,
    wcagId: params.wcagId,
    source: 'human',
    verdict: params.verdict,
    remarks: params.remarks,
    evidence: params.evidence ?? null,
    authorId: params.authorId,
    updatedAt: deps.now(),
  });

  if (audit.status === 'draft') {
    await store.setAuditStatus(params.auditId, 'in_review', null);
  }
}

/** An audit plus its reconciled criteria and publish-readiness, for the UI. */
export interface AuditView {
  audit: AuditRecord;
  reconciled: ReconciledCriterion[];
  canPublish: boolean;
  /** Criteria blocking publish (machine-only `supports`). */
  blockers: ReconciledCriterion[];
}

/** Load an audit with its reconciled criteria, or null if the audit is unknown. */
export async function loadAuditView(
  store: Store,
  criteria: readonly SuccessCriterion[],
  auditId: string,
): Promise<AuditView | null> {
  const audit = await store.getAudit(auditId);
  if (!audit) return null;
  const verdicts = await store.listVerdicts(auditId);
  const reconciled = reconcile(criteria, verdicts);
  return {
    audit,
    reconciled,
    canPublish: canPublish(reconciled),
    blockers: publishBlockers(reconciled),
  };
}

export interface PublishResult {
  published: boolean;
  /** WCAG ids still blocking publish when `published` is false. */
  blockers: string[];
}

/**
 * Publish an audit — but only if no criterion is claimed `supports` on machine
 * evidence alone. Returns the blocking WCAG ids instead of publishing otherwise.
 */
export async function publishAudit(
  store: Store,
  criteria: readonly SuccessCriterion[],
  auditId: string,
  deps: AuditDeps,
): Promise<PublishResult> {
  const audit = await store.getAudit(auditId);
  if (!audit) throw new Error(`audit ${auditId} not found`);

  // Idempotent: a published audit is finalized. Re-publishing must not rewrite
  // its publishedAt (the recorded publication time of a conformance document).
  if (audit.status === 'published') return { published: true, blockers: [] };

  const verdicts = await store.listVerdicts(auditId);
  const reconciled = reconcile(criteria, verdicts);
  const blockers = publishBlockers(reconciled);
  if (blockers.length > 0) {
    return { published: false, blockers: blockers.map(b => b.wcagId) };
  }

  await store.setAuditStatus(auditId, 'published', deps.now());
  return { published: true, blockers: [] };
}
