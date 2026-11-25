import { describe, it, expect } from 'vitest';
import type { ReconciledCriterion } from './reconcile.js';
import type { AuditView } from './audit-service.js';
import type { AuditRecord } from '../db/store.js';
import { verdictView, statusView, criterionRow, auditPageView } from './view-model.js';

function reconciled(partial: Partial<ReconciledCriterion>): ReconciledCriterion {
  return {
    wcagId: '1.1.1',
    title: 'Non-text Content',
    level: 'A',
    verdict: 'supports',
    source: 'machine',
    remarks: '',
    evidence: null,
    needsHumanReview: true,
    ...partial,
  };
}

const audit: AuditRecord = {
  id: 'a1',
  repoId: 10,
  installationId: 1,
  headSha: 'abc',
  basisCheckRunId: 500,
  status: 'in_review',
  createdAt: 't',
  publishedAt: null,
};

describe('verdictView / statusView', () => {
  it('maps verdicts to labels and tones', () => {
    expect(verdictView('supports')).toEqual({ label: 'Supports', tone: 'good' });
    expect(verdictView('does_not_support')).toEqual({ label: 'Does Not Support', tone: 'bad' });
    expect(verdictView('not_evaluated').tone).toBe('neutral');
  });

  it('maps statuses to labels and tones', () => {
    expect(statusView('draft').label).toBe('Draft');
    expect(statusView('published')).toEqual({ label: 'Published', tone: 'good' });
  });
});

describe('criterionRow', () => {
  it('flags a machine-only supports as downgrading and needing review', () => {
    const row = criterionRow(reconciled({ verdict: 'supports', source: 'machine' }));
    expect(row.willDowngrade).toBe(true);
    expect(row.needsHumanReview).toBe(true);
    expect(row.source).toBe('Automated');
  });

  it('does not flag a human-confirmed supports', () => {
    const row = criterionRow(reconciled({ verdict: 'supports', source: 'human', needsHumanReview: false }));
    expect(row.willDowngrade).toBe(false);
    expect(row.source).toBe('Reviewer');
  });

  it('does not flag a machine partially_supports', () => {
    expect(criterionRow(reconciled({ verdict: 'partially_supports', source: 'machine' })).willDowngrade).toBe(false);
  });
});

describe('auditPageView', () => {
  it('summarizes reviewed count and flags unconfirmed machine supports', () => {
    const view: AuditView = {
      audit,
      reconciled: [
        reconciled({ wcagId: '1.1.1', verdict: 'supports', source: 'machine', needsHumanReview: true }),
        reconciled({ wcagId: '1.4.3', verdict: 'supports', source: 'human', needsHumanReview: false }),
      ],
      unconfirmed: [reconciled({ wcagId: '1.1.1' })],
    };
    const page = auditPageView(view);
    expect(page.totalCount).toBe(2);
    expect(page.reviewedCount).toBe(1);
    expect(page.unconfirmedCount).toBe(1);
    // Always publishable, but the copy warns about the downgrade.
    expect(page.readiness).toMatch(/ready to publish/i);
    expect(page.readiness).toMatch(/not evaluated/i);
    expect(page.status.label).toBe('In review');
  });

  it('reports a clean ready state when nothing is unconfirmed', () => {
    const view: AuditView = {
      audit: { ...audit, status: 'in_review' },
      reconciled: [reconciled({ verdict: 'supports', source: 'human', needsHumanReview: false })],
      unconfirmed: [],
    };
    const page = auditPageView(view);
    expect(page.unconfirmedCount).toBe(0);
    expect(page.readiness).toMatch(/ready to publish/i);
    expect(page.readiness).not.toMatch(/not evaluated/i);
  });
});
