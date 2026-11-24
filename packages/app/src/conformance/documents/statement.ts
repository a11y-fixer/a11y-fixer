// Accessibility Statement builder: a shorter, public-facing document derived
// from the same reconciled audit as the VPAT/ACR. Pure and unit-tested.
//
// The overall conformance phrasing is computed from the verdicts, never asserted
// blindly: "fully conformant" is claimed only when every criterion supports (or
// is not applicable) AND every one has been reviewed by a person. Anything else
// is "partially conformant", with the gaps listed under Known limitations.
import type { ReconciledCriterion } from '../reconcile.js';
import { summarizeReconciled } from '../reconcile.js';
import { verdictView } from '../view-model.js';
import type { DocumentMeta, StatementDocument, StatementSection } from './model.js';

export interface BuildStatementParams {
  meta: DocumentMeta;
  reconciled: readonly ReconciledCriterion[];
  /** Contact point for accessibility feedback (email or URL). */
  feedbackContact: string;
}

/** Conformance phrasing, honest about both failures and unreviewed criteria. */
export function conformanceStatus(
  reconciled: readonly ReconciledCriterion[],
): { label: string; sentence: string; fullyConformant: boolean } {
  const counts = summarizeReconciled(reconciled);
  const hasFailures = counts.partially_supports > 0 || counts.does_not_support > 0;
  const hasUnreviewed = counts.needsHumanReview > 0 || counts.not_evaluated > 0;
  if (!hasFailures && !hasUnreviewed) {
    return {
      label: 'Fully conformant',
      sentence: 'The content fully conforms to the target standard: every applicable success criterion is supported and has been reviewed by a person.',
      fullyConformant: true,
    };
  }
  return {
    label: 'Partially conformant',
    sentence: 'The content partially conforms to the target standard: some parts do not yet fully conform, or have not yet been reviewed by a person. These are listed below.',
    fullyConformant: false,
  };
}

/**
 * Build a public accessibility statement from the reconciled audit. Sections
 * follow the common W3C/EN 301 549 statement structure: conformance status,
 * known limitations, assessment approach, and a feedback channel.
 */
export function buildStatement(params: BuildStatementParams): StatementDocument {
  const { meta, reconciled, feedbackContact } = params;
  const status = conformanceStatus(reconciled);

  // Known limitations: criteria that fail or were not confirmed as supporting.
  // A reader deserves the specifics, not just the headline.
  const limitations = reconciled
    .filter(r => r.verdict === 'partially_supports' || r.verdict === 'does_not_support')
    .map(r => {
      const label = verdictView(r.verdict).label;
      const detail = r.remarks.trim() ? ` — ${r.remarks.trim()}` : '';
      return `${r.wcagId} ${r.title} (${label})${detail}`;
    });

  // Split machine-checked-but-unconfirmed from never-evaluated. Claiming a
  // not_evaluated criterion was "checked automatically" would overstate coverage
  // (most WCAG criteria are not machine-testable, so they are never checked at
  // all) and contradict the ACR, which renders them "not evaluated" — the exact
  // dishonesty this feature exists to prevent.
  const machineChecked = reconciled.filter(
    r =>
      r.needsHumanReview &&
      r.verdict !== 'not_evaluated' &&
      r.verdict !== 'partially_supports' &&
      r.verdict !== 'does_not_support',
  ).length;
  const notEvaluated = reconciled.filter(r => r.verdict === 'not_evaluated').length;

  const sections: StatementSection[] = [
    {
      heading: 'Conformance status',
      paragraphs: [
        `${meta.vendor} is committed to making ${meta.productName} accessible, in line with ${meta.conformanceTarget}.`,
        status.sentence,
      ],
    },
  ];

  if (limitations.length > 0) {
    sections.push({
      heading: 'Known limitations',
      paragraphs: ['The following areas have known accessibility limitations:'],
      items: limitations,
    });
  }

  if (machineChecked > 0) {
    sections.push({
      heading: 'Criteria pending review',
      paragraphs: [
        `${machineChecked} success criterion(s) passed automated checks but have not yet been confirmed by a human reviewer. A conformance claim for these is not asserted until that review is complete.`,
      ],
    });
  }

  if (notEvaluated > 0) {
    sections.push({
      heading: 'Criteria not evaluated',
      paragraphs: [
        `${notEvaluated} success criterion(s) have not been evaluated. Automated tools cannot assess them and a reviewer has not yet done so, so no conformance is claimed for them.`,
      ],
    });
  }

  sections.push({
    heading: 'Assessment approach',
    paragraphs: [
      `This statement was prepared on ${meta.date}, based on an evaluation of commit ${meta.headSha}.`,
      meta.evaluationMethods,
    ],
  });

  sections.push({
    heading: 'Feedback',
    paragraphs: [
      'We welcome your feedback on the accessibility of this product. Please contact us if you encounter barriers:',
    ],
    items: [feedbackContact],
  });

  return { kind: 'statement', meta, sections };
}
