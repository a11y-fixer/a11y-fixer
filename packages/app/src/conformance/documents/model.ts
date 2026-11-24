// Document model: the serializable, framework-free shape of a conformance
// document. Pure builders (vpat.ts, statement.ts) produce it from a reconciled
// audit; the HTML/PDF/DOCX renderers consume it. One model means every output
// format states the same facts — the honesty posture holds regardless of format.

/** Shared header metadata every conformance document carries. */
export interface DocumentMeta {
  /** Product/subject name, e.g. 'owner/repo'. */
  productName: string;
  /** Vendor/author — the installation account the audit belongs to. */
  vendor: string;
  /** Commit the evaluation is "as of". */
  headSha: string;
  /** ISO calendar date (YYYY-MM-DD) the document represents. */
  date: string;
  /**
   * Whether the underlying audit is published. A draft document is explicitly
   * watermarked "not for distribution" so an in-progress export can never be
   * mistaken for a final conformance claim.
   */
  published: boolean;
  /** Human-readable evaluation-methods statement. */
  evaluationMethods: string;
  /** Conformance target, e.g. 'WCAG 2.2 Level AA'. */
  conformanceTarget: string;
}

/** One criterion row in a VPAT/ACR conformance table. */
export interface AcrRow {
  wcagId: string;
  title: string;
  /** Conformance level of the criterion itself: 'A' | 'AA' | 'AAA'. */
  level: string;
  /** Conformance claim label: 'Supports', 'Partially Supports', … */
  conformance: string;
  /** Remarks and explanations, already carrying any honesty annotations. */
  remarks: string;
}

/** A labelled group of criterion rows (a VPAT report table). */
export interface AcrTable {
  /** Stable slug, e.g. 'wcag-a', 'wcag-aa', 'section-508', 'en-301-549'. */
  id: string;
  title: string;
  /** Optional explanatory note rendered above the table. */
  note?: string;
  rows: AcrRow[];
}

/** A VPAT 2.x Accessibility Conformance Report (INT edition, Chapter-level). */
export interface AcrDocument {
  kind: 'acr';
  meta: DocumentMeta;
  /** The standard VPAT intro key/value summary (product, date, methods, …). */
  summary: { label: string; value: string }[];
  tables: AcrTable[];
}

/** One section of a public accessibility statement. */
export interface StatementSection {
  heading: string;
  /** Prose paragraphs. */
  paragraphs: string[];
  /** Optional bullet list rendered after the paragraphs. */
  items?: string[];
}

/** A public-facing accessibility statement derived from the same record. */
export interface StatementDocument {
  kind: 'statement';
  meta: DocumentMeta;
  sections: StatementSection[];
}

/** One outstanding-work item in a remediation roadmap. */
export interface RoadmapItem {
  wcagId: string;
  title: string;
  level: string;
  /** Short status label, e.g. 'Does Not Support', 'Pending review'. */
  status: string;
  /** Remediation detail / reviewer remark (may be empty). */
  remark: string;
}

/** A labelled group of roadmap items (failures, pending review, not evaluated). */
export interface RoadmapGroup {
  /** Stable slug, e.g. 'failures', 'pending-review', 'not-evaluated'. */
  id: string;
  heading: string;
  /** Explanatory note rendered above the group. */
  note: string;
  items: RoadmapItem[];
}

/**
 * A remediation roadmap: the outstanding accessibility work derived from the same
 * reconciled record. It lists only real gaps — failures, criteria awaiting human
 * review, and criteria never evaluated — never dressing any of them up as done.
 */
export interface RemediationRoadmapDocument {
  kind: 'roadmap';
  meta: DocumentMeta;
  intro: string;
  groups: RoadmapGroup[];
}

/**
 * A formal conformance letter: a short attestation suitable for procurement. The
 * conformance claim is computed from the verdicts, never asserted blindly — full
 * conformance is stated only when every criterion supports and a person reviewed
 * it, matching the statement and ACR.
 */
export interface ConformanceLetterDocument {
  kind: 'letter';
  meta: DocumentMeta;
  /** Attestation body paragraphs, in order. */
  paragraphs: string[];
  /** Signature block lines (vendor, date). */
  signature: string[];
}

export type ConformanceDocument =
  | AcrDocument
  | StatementDocument
  | RemediationRoadmapDocument
  | ConformanceLetterDocument;

/** The document kinds a caller may request. */
export type DocumentKind = ConformanceDocument['kind'];

/** The output formats each document can be rendered to. */
export type DocumentFormat = 'html' | 'pdf' | 'docx';
