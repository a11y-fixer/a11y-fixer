// Pure presentation mappers for the conformance (audit) pages.
//
// Mirrors src/dashboard/view-model.ts: no JSX, no I/O, so the audit pages stay
// thin Server Components and the label/tone logic is unit-testable.
import type { Tone } from '../dashboard/view-model.js';
import type { AuditStatus, VerdictSource, VerdictValue } from '../db/store.js';
import type { ReconciledCriterion } from './reconcile.js';
import type { AuditView } from './audit-service.js';

/** The verdicts a human reviewer may choose, in menu order. */
export const SELECTABLE_VERDICTS: readonly VerdictValue[] = [
  'supports',
  'partially_supports',
  'does_not_support',
  'not_applicable',
  'not_evaluated',
];

/** Human label + tone for a conformance verdict. */
export function verdictView(verdict: VerdictValue): { label: string; tone: Tone } {
  switch (verdict) {
    case 'supports':
      return { label: 'Supports', tone: 'good' };
    case 'partially_supports':
      return { label: 'Partially Supports', tone: 'warn' };
    case 'does_not_support':
      return { label: 'Does Not Support', tone: 'bad' };
    case 'not_applicable':
      return { label: 'Not Applicable', tone: 'neutral' };
    case 'not_evaluated':
      return { label: 'Not Evaluated', tone: 'neutral' };
  }
}

/** Label + tone for an audit's lifecycle status. */
export function statusView(status: AuditStatus): { label: string; tone: Tone } {
  switch (status) {
    case 'draft':
      return { label: 'Draft', tone: 'neutral' };
    case 'in_review':
      return { label: 'In review', tone: 'warn' };
    case 'published':
      return { label: 'Published', tone: 'good' };
  }
}

function sourceLabel(source: VerdictSource): string {
  return source === 'human' ? 'Reviewer' : 'Automated';
}

export interface CriterionRowView {
  wcagId: string;
  title: string;
  level: string;
  verdict: VerdictValue;
  verdictLabel: string;
  verdictTone: Tone;
  /** 'Automated' or 'Reviewer'. */
  source: string;
  remarks: string;
  needsHumanReview: boolean;
  /** True when this row blocks publishing (machine-only Supports). */
  blocksPublish: boolean;
}

export function criterionRow(r: ReconciledCriterion): CriterionRowView {
  const v = verdictView(r.verdict);
  return {
    wcagId: r.wcagId,
    title: r.title,
    level: r.level,
    verdict: r.verdict,
    verdictLabel: v.label,
    verdictTone: v.tone,
    source: sourceLabel(r.source),
    remarks: r.remarks,
    needsHumanReview: r.needsHumanReview,
    blocksPublish: r.verdict === 'supports' && r.source === 'machine',
  };
}

export interface AuditPageView {
  status: { label: string; tone: Tone };
  rows: CriterionRowView[];
  /** One-line readiness summary. */
  readiness: string;
  canPublish: boolean;
  reviewedCount: number;
  totalCount: number;
}

export function auditPageView(view: AuditView): AuditPageView {
  const rows = view.reconciled.map(criterionRow);
  const totalCount = rows.length;
  const reviewedCount = rows.filter(r => !r.needsHumanReview).length;
  const readiness = view.canPublish
    ? 'Ready to publish — every conformance claim has been reviewed.'
    : `Not ready to publish — ${view.blockers.length} criterion(s) claimed Supports still need reviewer confirmation.`;
  return {
    status: statusView(view.audit.status),
    rows,
    readiness,
    canPublish: view.canPublish,
    reviewedCount,
    totalCount,
  };
}
