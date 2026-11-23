import { parse } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';

export type Element = DefaultTreeAdapterMap['element'];
export type ChildNode = DefaultTreeAdapterMap['childNode'];
export type ParentNode = DefaultTreeAdapterMap['parentNode'];

/** A byte-offset splice: replace `[start, end)` of the source with `text`. */
export interface Edit {
  start: number;
  end: number;
  text: string;
}

export function isElement(n: ChildNode): n is Element {
  return 'tagName' in n;
}

/** Direct child elements (skipping text/comment nodes) of a parent node. */
export function childElements(parent: ParentNode): Element[] {
  const children = (parent as { childNodes?: ChildNode[] }).childNodes;
  if (!children) return [];
  return children.filter(isElement);
}

/** Whether `el` carries a `role` attribute. */
export function hasRole(el: Element): boolean {
  return el.attrs.some(a => a.name === 'role');
}

/** Pre-order DFS over element nodes, stopping once `visit` returns true. */
export function findElement(
  parent: ParentNode,
  visit: (el: Element) => boolean,
): Element | null {
  for (const child of childElements(parent)) {
    if (visit(child)) return child;
    const found = findElement(child, visit);
    if (found) return found;
  }
  return null;
}

/** Parses `content` with source-location info so edits can be computed by offset. */
export function parseWithLocations(content: string): DefaultTreeAdapterMap['document'] {
  return parse(content, { sourceCodeLocationInfo: true });
}

/**
 * Builds the open- and close-tag edits that rename `el` to `<newTag>`, preserving
 * its attributes and inner content. Returns `null` when the element lacks start/end
 * tag source locations (e.g. JSX the HTML parser can't place, or a self-closed tag).
 */
export function renameEdits(el: Element, newTag: string, content: string): Edit[] | null {
  const loc = el.sourceCodeLocation;
  const start = loc?.startTag;
  const end = loc?.endTag;
  if (!start || !end) return null;

  const open = content.slice(start.startOffset, start.endOffset);
  const close = content.slice(end.startOffset, end.endOffset);
  const newOpen = open.replace(/^<[a-zA-Z][\w-]*/, `<${newTag}`);
  const newClose = close.replace(/^<\/[a-zA-Z][\w-]*/, `</${newTag}`);
  if (newOpen === open && newClose === close) return null;

  return [
    { start: start.startOffset, end: start.endOffset, text: newOpen },
    { start: end.startOffset, end: end.endOffset, text: newClose },
  ];
}

/**
 * Builds the edit that sets `el`'s text content to `text`, replacing everything
 * between its start and end tags. Returns `null` when the element has no
 * start/end tag locations (self-closed or unplaceable).
 */
export function setTextEdit(el: Element, text: string, content: string): Edit | null {
  const loc = el.sourceCodeLocation;
  const start = loc?.startTag;
  const end = loc?.endTag;
  if (!start || !end) return null;
  if (end.startOffset < start.endOffset) return null;

  const current = content.slice(start.endOffset, end.startOffset);
  if (current === text) return null;
  return { start: start.endOffset, end: end.startOffset, text };
}

/**
 * Sets the text content of the first element whose tag is in `tagNames` and whose
 * opening tag starts on 1-indexed `line`, replacing whatever sits between its tags.
 *
 * Returns the rewritten content, or `null` when no such element is on that line,
 * it can't be located, it already contains that text, or it has element children
 * (so overwriting would drop markup — the caller should human-flag instead).
 */
export function setElementText(
  content: string,
  line: number,
  tagNames: ReadonlySet<string>,
  text: string,
): string | null {
  const doc = parseWithLocations(content);
  const el = findElement(
    doc,
    e => tagNames.has(e.tagName) && e.sourceCodeLocation?.startTag?.startLine === line,
  );
  if (!el) return null;
  if (childElements(el).length > 0) return null;
  const edit = setTextEdit(el, text, content);
  if (!edit) return null;
  return applyEdits(content, [edit]);
}

/** Applies edits by splicing from the last offset backwards, keeping earlier offsets valid. */
export function applyEdits(content: string, edits: Edit[]): string {
  let out = content;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return out;
}
