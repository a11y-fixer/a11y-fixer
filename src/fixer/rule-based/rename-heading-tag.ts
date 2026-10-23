import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';

type Element = DefaultTreeAdapterMap['element'];
type ChildNode = DefaultTreeAdapterMap['childNode'];
type ParentNode = DefaultTreeAdapterMap['parentNode'];

/** A heading found in document order, with the 1-indexed line of its open tag. */
export interface HeadingInfo {
  level: number; // 1–6
  line: number;
}

const HEADING_RE = /^h([1-6])$/;

/**
 * Collects every `<h1>`–`<h6>` in `content`, in document (pre-order) order, each
 * paired with the 1-indexed line of its opening tag. Parsing uses parse5 so the
 * lines come from real source locations, not a regex guess. Headings whose
 * location info is missing are skipped.
 */
export function collectHeadings(content: string): HeadingInfo[] {
  const doc = parse(content, { sourceCodeLocationInfo: true });
  const out: HeadingInfo[] = [];
  walk(doc, el => {
    const m = el.tagName.toLowerCase().match(HEADING_RE);
    const startLine = el.sourceCodeLocation?.startTag?.startLine;
    if (m && startLine !== undefined) {
      out.push({ level: Number(m[1]), line: startLine });
    }
  });
  return out;
}

/**
 * Rewrites the heading element whose opening tag starts on 1-indexed `line` of
 * `file` to `<h{newLevel}>`, renaming both the opening and closing tags. Heading
 * levels are single digits, so tag-name length is unchanged and parse5's byte
 * offsets stay valid for an in-place splice — robust to multi-line elements.
 *
 * Returns the rewritten opening-tag line, or `null` when the file can't be read,
 * no heading opens on that line, or the element lacks start/end tag locations
 * (e.g. JSX the HTML parser can't place) — the caller then flags it for a human.
 */
export async function renameHeadingTag(
  file: string,
  line: number,
  newLevel: number,
): Promise<string | null> {
  try {
    const content = await readFile(file, 'utf8');
    const doc = parse(content, { sourceCodeLocationInfo: true });

    let target: Element | undefined;
    walk(doc, el => {
      if (target) return;
      if (
        HEADING_RE.test(el.tagName.toLowerCase()) &&
        el.sourceCodeLocation?.startTag?.startLine === line
      ) {
        target = el;
      }
    });
    if (!target) return null;

    const loc = target.sourceCodeLocation;
    const start = loc?.startTag;
    const end = loc?.endTag;
    if (!start || !end) return null;

    const open = content.slice(start.startOffset, start.endOffset);
    const close = content.slice(end.startOffset, end.endOffset);
    const newOpen = open.replace(/^<h[1-6]/i, `<h${newLevel}`);
    const newClose = close.replace(/^<\/h[1-6]/i, `</h${newLevel}`);
    if (newOpen === open && newClose === close) return null;

    // Splice the closing tag first so the earlier opening-tag offsets stay valid.
    const updated =
      content.slice(0, start.startOffset) +
      newOpen +
      content.slice(start.endOffset, end.startOffset) +
      newClose +
      content.slice(end.endOffset);

    await writeFile(file, updated, 'utf8');
    return updated.split('\n')[line - 1] ?? newOpen;
  } catch {
    return null;
  }
}

function isElement(n: ChildNode): n is Element {
  return 'tagName' in n;
}

/** Pre-order DFS over element nodes. */
function walk(parent: ParentNode, visit: (el: Element) => void): void {
  const children = (parent as { childNodes?: ChildNode[] }).childNodes;
  if (!children) return;
  for (const child of children) {
    if (isElement(child)) {
      visit(child);
      walk(child, visit);
    }
  }
}
