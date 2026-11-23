// VPAT 2.x / ACR builder: turns a reconciled audit into the document model the
// renderers consume. Pure and unit-tested. No I/O, no framework.
//
// Honesty posture carried into the document:
//   - An unreviewed machine verdict is annotated so a reader knows no person
//     confirmed it (automated tools detect failures, they cannot prove success).
//   - A "Not Evaluated" row says so plainly rather than implying conformance.
import type { SuccessCriterion } from '@a11y-fixer/core';
import { SECTION_508_INCORPORATION } from '@a11y-fixer/core/wcag';
import type { ReconciledCriterion } from '../reconcile.js';
import { verdictView } from '../view-model.js';
import type { AcrDocument, AcrRow, AcrTable, DocumentMeta } from './model.js';

export interface BuildAcrParams {
  meta: DocumentMeta;
  /** The reconciled result for every catalog criterion, in catalog order. */
  reconciled: readonly ReconciledCriterion[];
}

/**
 * Compose the "Remarks and Explanations" cell for one criterion. Starts from the
 * reviewer's/deriver's own remarks, then appends the honesty annotation the
 * posture requires so no format can hide it.
 */
function remarksFor(r: ReconciledCriterion): string {
  const parts: string[] = [];
  if (r.remarks.trim()) parts.push(r.remarks.trim());
  if (r.verdict === 'not_evaluated') {
    parts.push('This criterion was not evaluated.');
  } else if (r.needsHumanReview) {
    // source === 'machine': an automated verdict no person has confirmed.
    parts.push('Automated detection only — not confirmed by manual review.');
  }
  return parts.join(' ');
}

function toRow(r: ReconciledCriterion): AcrRow {
  return {
    wcagId: r.wcagId,
    title: r.title,
    level: r.level,
    conformance: verdictView(r.verdict).label,
    remarks: remarksFor(r),
  };
}

/**
 * Build a VPAT 2.x Accessibility Conformance Report (INT edition). Produces the
 * WCAG Level A and AA tables (plus a AAA table only when AAA criteria were
 * actually evaluated), then the Revised Section 508 and EN 301 549 reports,
 * which incorporate the same WCAG results by reference.
 */
export function buildAcr(params: BuildAcrParams): AcrDocument {
  const { meta, reconciled } = params;
  const rowsByLevel = (level: SuccessCriterion['level']): AcrRow[] =>
    reconciled.filter(r => r.level === level).map(toRow);

  const levelA = rowsByLevel('A');
  const levelAA = rowsByLevel('AA');
  const levelAAA = rowsByLevel('AAA');

  const tables: AcrTable[] = [
    {
      id: 'wcag-a',
      title: 'Table 1: Success Criteria, Level A',
      rows: levelA,
    },
    {
      id: 'wcag-aa',
      title: 'Table 2: Success Criteria, Level AA',
      rows: levelAA,
    },
  ];

  // Only report AAA when at least one AAA criterion was actually evaluated: a
  // VPAT targets Level AA, so an empty AAA table would mislead.
  if (levelAAA.length > 0) {
    tables.push({
      id: 'wcag-aaa',
      title: 'Table 3: Success Criteria, Level AAA (partial)',
      note: 'Only the Level AAA criteria a11y-fixer evaluates are listed; AAA is not a VPAT conformance target.',
      rows: levelAAA,
    });
  }

  tables.push({
    id: 'section-508',
    title: 'Revised Section 508 Report',
    note:
      `Revised Section 508 (${SECTION_508_INCORPORATION.web}) incorporates WCAG 2.0 Level A and AA by ` +
      'reference. The applicable conformance results are the WCAG Level A and AA tables above.',
    rows: [],
  });

  tables.push({
    id: 'en-301-549',
    title: 'EN 301 549 Report — Chapter 9 (Web)',
    note:
      'EN 301 549 Chapter 9 maps clause 9.x directly to the corresponding WCAG success criterion. ' +
      'Each clause takes the conformance result of its WCAG criterion in the tables above.',
    // EN 301 549 Chapter 9 incorporates only WCAG Level A and AA; there is no EN
    // web clause for a Level AAA criterion, so AAA rows must not appear here (the
    // catalog carries a few AAA criteria for detector coverage).
    rows: reconciled
      .filter(r => r.level === 'A' || r.level === 'AA')
      .map(r => ({
        ...toRow(r),
        // Present the EN clause number in place of the bare SC id.
        wcagId: `9.${r.wcagId}`,
      })),
  });

  const summary = [
    { label: 'Product', value: meta.productName },
    { label: 'Report date', value: meta.date },
    { label: 'Evaluated version', value: meta.headSha },
    { label: 'Vendor', value: meta.vendor },
    { label: 'Conformance target', value: meta.conformanceTarget },
    { label: 'Evaluation methods', value: meta.evaluationMethods },
  ];

  return { kind: 'acr', meta, summary, tables };
}
