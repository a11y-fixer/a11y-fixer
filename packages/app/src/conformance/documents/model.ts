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

export type ConformanceDocument = AcrDocument | StatementDocument;

/** The document kinds a caller may request. */
export type DocumentKind = ConformanceDocument['kind'];

/** The output formats each document can be rendered to. */
export type DocumentFormat = 'html' | 'pdf' | 'docx';
