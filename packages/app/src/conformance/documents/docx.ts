// DOCX renderer for conformance documents. Procurement teams redline the Word
// version, so this mirrors the HTML content exactly in a .docx the `docx` lib
// packs to a Buffer. Model in, bytes out — the same model the HTML renderer uses.
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import type { AcrDocument, ConformanceDocument, DocumentMeta, StatementDocument } from './model.js';

function draftNotice(meta: DocumentMeta): Paragraph[] {
  if (meta.published) return [];
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: 'DRAFT — not for distribution. This conformance document reflects an unpublished audit and may change.',
          bold: true,
          color: '7A4F01',
        }),
      ],
      spacing: { after: 200 },
    }),
  ];
}

function cell(text: string, opts: { bold?: boolean; width?: number } = {}): TableCell {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, bold: opts.bold })] })],
  });
}

function acrChildren(doc: AcrDocument): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    new Paragraph({ text: 'Accessibility Conformance Report', heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [new TextRun({ text: 'VPAT 2.5 (INT) — based on the Voluntary Product Accessibility Template', italics: true })],
      spacing: { after: 200 },
    }),
    ...draftNotice(doc.meta),
  ];

  for (const s of doc.summary) {
    out.push(new Paragraph({ children: [new TextRun({ text: `${s.label}: `, bold: true }), new TextRun({ text: s.value })] }));
  }

  for (const t of doc.tables) {
    out.push(new Paragraph({ text: t.title, heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }));
    if (t.note) out.push(new Paragraph({ children: [new TextRun({ text: t.note, italics: true })], spacing: { after: 100 } }));
    if (t.rows.length === 0) continue;
    const header = new TableRow({
      tableHeader: true,
      children: [cell('Criteria', { bold: true, width: 45 }), cell('Conformance Level', { bold: true, width: 20 }), cell('Remarks and Explanations', { bold: true, width: 35 })],
    });
    const body = t.rows.map(
      r =>
        new TableRow({
          children: [cell(`${r.wcagId} ${r.title} (Level ${r.level})`), cell(r.conformance), cell(r.remarks)],
        }),
    );
    out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...body] }));
  }
  return out;
}

function statementChildren(doc: StatementDocument): Paragraph[] {
  const out: Paragraph[] = [
    new Paragraph({ text: 'Accessibility Statement', heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [new TextRun({ text: `${doc.meta.productName} · ${doc.meta.date}`, italics: true })],
      spacing: { after: 200 },
    }),
    ...draftNotice(doc.meta),
  ];
  for (const s of doc.sections) {
    out.push(new Paragraph({ text: s.heading, heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }));
    for (const p of s.paragraphs) out.push(new Paragraph({ children: [new TextRun({ text: p })] }));
    for (const item of s.items ?? []) {
      out.push(new Paragraph({ children: [new TextRun({ text: item })], bullet: { level: 0 } }));
    }
  }
  return out;
}

/** Render any conformance document to a .docx file as a Buffer. */
export async function renderDocumentDocx(doc: ConformanceDocument): Promise<Buffer> {
  let children: (Paragraph | Table)[];
  switch (doc.kind) {
    case 'acr':
      children = acrChildren(doc);
      break;
    case 'statement':
      children = statementChildren(doc);
      break;
    default: {
      const _never: never = doc;
      throw new Error(`unhandled document kind: ${(_never as ConformanceDocument).kind}`);
    }
  }
  const document = new Document({
    creator: 'a11y-fixer',
    title: doc.kind === 'acr' ? `ACR — ${doc.meta.productName}` : `Accessibility Statement — ${doc.meta.productName}`,
    sections: [{ properties: {}, children }],
  });
  return Packer.toBuffer(document);
}
