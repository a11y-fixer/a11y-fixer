// Remediation roadmap builder: the outstanding accessibility work for an audit,
// derived from the same reconciled record as the VPAT/ACR. Pure and unit-tested.
//
// Honesty posture: the roadmap lists only real gaps, grouped by what kind of work
// each one is. A criterion that nothing evaluated is reported as "not evaluated"
// (never as passing), and a machine-only pass is reported as "pending review"
// (never as confirmed). A clean audit produces an empty roadmap that says so.
import type { ReconciledCriterion } from '../reconcile.js';
import { verdictView } from '../view-model.js';
import type { DocumentMeta, RemediationRoadmapDocument, RoadmapGroup, RoadmapItem } from './model.js';

export interface BuildRoadmapParams {
  meta: DocumentMeta;
  reconciled: readonly ReconciledCriterion[];
}

function item(r: ReconciledCriterion, status: string): RoadmapItem {
  return { wcagId: r.wcagId, title: r.title, level: r.level, status, remark: r.remarks.trim() };
}

/**
 * Build a remediation roadmap. Three groups, each only present when it has
 * entries: confirmed failures (fix these), criteria awaiting human review
 * (confirm these), and criteria never evaluated (evaluate these).
 */
export function buildRoadmap(params: BuildRoadmapParams): RemediationRoadmapDocument {
  const { meta, reconciled } = params;

  const failures = reconciled
    .filter(r => r.verdict === 'partially_supports' || r.verdict === 'does_not_support')
    .map(r => item(r, verdictView(r.verdict).label));

  // Machine-only passes: a verdict that is not a failure and not "not evaluated",
  // still flagged for review. Claiming these as done would overstate conformance.
  const pending = reconciled
    .filter(
      r =>
        r.needsHumanReview &&
        r.verdict !== 'not_evaluated' &&
        r.verdict !== 'partially_supports' &&
        r.verdict !== 'does_not_support',
    )
    .map(r => item(r, 'Pending review'));

  const notEvaluated = reconciled
    .filter(r => r.verdict === 'not_evaluated')
    .map(r => item(r, 'Not evaluated'));

  const groups: RoadmapGroup[] = [];
  if (failures.length > 0) {
    groups.push({
      id: 'failures',
      heading: 'Confirmed failures to remediate',
      note: 'These criteria were evaluated and do not fully support the target standard. Fixing them is the priority remediation work.',
      items: failures,
    });
  }
  if (pending.length > 0) {
    groups.push({
      id: 'pending-review',
      heading: 'Awaiting human review',
      note: 'These criteria passed automated checks but have not been confirmed by a reviewer. No conformance is claimed until that review is done.',
      items: pending,
    });
  }
  if (notEvaluated.length > 0) {
    groups.push({
      id: 'not-evaluated',
      heading: 'Not yet evaluated',
      note: 'Automated tools cannot assess these criteria and a reviewer has not yet done so. They need manual evaluation before any conformance can be claimed.',
      items: notEvaluated,
    });
  }

  const intro =
    groups.length === 0
      ? 'No outstanding accessibility work: every applicable success criterion is supported and has been reviewed. This roadmap is intentionally empty.'
      : `This roadmap lists the accessibility work remaining for ${meta.productName}, as of commit ${meta.headSha}. Items are grouped by the kind of work each one needs.`;

  return { kind: 'roadmap', meta, intro, groups };
}
