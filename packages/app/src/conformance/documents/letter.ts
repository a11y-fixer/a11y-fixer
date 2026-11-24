// Conformance letter builder: a short formal attestation over the same reconciled
// record. Pure and unit-tested.
//
// Honesty posture: the letter never asserts more than the verdicts support. Full
// conformance is attested only when conformanceStatus reports it (every criterion
// supported AND reviewed by a person); otherwise the letter states partial
// conformance and points to the ACR and roadmap for the specifics. A letter can
// never overclaim what the ACR it accompanies would contradict.
import type { ReconciledCriterion } from '../reconcile.js';
import type { ConformanceLetterDocument, DocumentMeta } from './model.js';
import { conformanceStatus } from './statement.js';

export interface BuildLetterParams {
  meta: DocumentMeta;
  reconciled: readonly ReconciledCriterion[];
}

/** Build a formal conformance letter from the reconciled audit. */
export function buildLetter(params: BuildLetterParams): ConformanceLetterDocument {
  const { meta, reconciled } = params;
  const status = conformanceStatus(reconciled);

  const paragraphs: string[] = [
    'To whom it may concern,',
    `${meta.vendor} has evaluated ${meta.productName}, as of commit ${meta.headSha}, against ${meta.conformanceTarget}. ${meta.evaluationMethods}`,
  ];

  if (status.fullyConformant) {
    paragraphs.push(
      `Based on this evaluation, we attest that ${meta.productName} conforms to ${meta.conformanceTarget}: every applicable success criterion is supported and has been confirmed by a human reviewer.`,
    );
  } else {
    paragraphs.push(
      `Based on this evaluation, ${meta.productName} partially conforms to ${meta.conformanceTarget}. Some criteria do not yet fully conform or have not yet been confirmed by a human reviewer. The specific gaps are documented in the accompanying Accessibility Conformance Report and remediation roadmap; this letter does not claim full conformance.`,
    );
  }

  paragraphs.push(
    `This letter reflects the state of ${meta.productName} as of ${meta.date} and is a statement of evaluation results, not a warranty of future conformance.`,
  );

  return {
    kind: 'letter',
    meta,
    paragraphs,
    signature: [meta.vendor, meta.date],
  };
}
