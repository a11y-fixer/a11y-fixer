import { parse } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';

type Element = DefaultTreeAdapterMap['element'];
type ChildNode = DefaultTreeAdapterMap['childNode'];
type ParentNode = DefaultTreeAdapterMap['parentNode'];

/** 1-indexed line/column of an element's opening tag in HTML source. */
export interface HtmlPosition {
  line: number;
  column: number;
}

/**
 * A node signature distilled from an axe node's outerHTML: the tag name, the
 * attributes that most uniquely identify the element, and its trimmed text.
 */
interface NodeSignature {
  tag: string;
  attrs: Map<string, string>;
  text: string;
}

// Attributes that tend to uniquely identify an element, most-distinguishing
// first. `class` is last because many elements can share one.
const KEY_ATTRS = ['id', 'src', 'href', 'name', 'type', 'alt', 'aria-label', 'placeholder', 'class'];

/**
 * Locates the source position of the element described by `node.html` within the
 * HTML `content`. Parsing uses parse5's source-location info, so the returned
 * line/column point at the real opening tag (not a regex guess).
 *
 * Matching prefers a unique key-attribute match (e.g. `src="logo.png"`); when the
 * axe snippet carries no distinguishing attribute it falls back to the first
 * element of the same tag whose trimmed text matches (or, lacking text, the first
 * element of that tag). Returns `null` when nothing matches or the tag is unknown.
 */
export function locateElementInHtml(
  content: string,
  node: { html: string },
): HtmlPosition | null {
  const sig = parseSignature(node.html);
  if (!sig) return null;

  const doc = parse(content, { sourceCodeLocationInfo: true });
  const candidates: Element[] = [];
  collectByTag(doc, sig.tag, candidates);
  if (candidates.length === 0) return null;

  // 1. Unique key-attribute match.
  for (const attrName of KEY_ATTRS) {
    const wanted = sig.attrs.get(attrName);
    if (wanted === undefined) continue;
    const matches = candidates.filter(el => getAttr(el, attrName) === wanted);
    if (matches.length >= 1) return positionOf(matches[0]);
  }

  // 2. Text match.
  if (sig.text) {
    const byText = candidates.find(el => normalizeText(elementText(el)) === sig.text);
    if (byText) return positionOf(byText);
  }

  // 3. First element of this tag.
  return positionOf(candidates[0]);
}

/** Builds a signature from an element's outerHTML opening tag + inner text. */
function parseSignature(html: string): NodeSignature | null {
  const tagMatch = html.match(/^\s*<([a-zA-Z][\w-]*)/);
  if (!tagMatch) return null;
  const tag = tagMatch[1].toLowerCase();

  const attrs = new Map<string, string>();
  const attrRe = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  // Only scan the opening tag so inner markup's attributes don't leak in.
  const openTag = html.slice(0, html.indexOf('>') === -1 ? html.length : html.indexOf('>') + 1);
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(openTag)) !== null) {
    attrs.set(m[1].toLowerCase(), m[2] ?? m[3] ?? '');
  }

  const textMatch = html.match(/>([^<]*)</);
  const text = textMatch ? normalizeText(textMatch[1]) : '';

  return { tag, attrs, text };
}

function normalizeText(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function isElement(n: ChildNode): n is Element {
  return 'tagName' in n;
}

function collectByTag(parent: ParentNode, tag: string, out: Element[]): void {
  const children = (parent as { childNodes?: ChildNode[] }).childNodes;
  if (!children) return;
  for (const child of children) {
    if (isElement(child)) {
      if (child.tagName.toLowerCase() === tag) out.push(child);
      collectByTag(child, tag, out);
    }
  }
}

function getAttr(el: Element, name: string): string | undefined {
  return el.attrs.find(a => a.name.toLowerCase() === name)?.value;
}

function elementText(el: Element): string {
  let text = '';
  for (const child of el.childNodes) {
    if (child.nodeName === '#text') {
      text += (child as DefaultTreeAdapterMap['textNode']).value;
    } else if (isElement(child)) {
      text += elementText(child);
    }
  }
  return text;
}

function positionOf(el: Element): HtmlPosition | null {
  const loc = el.sourceCodeLocation;
  if (!loc) return null;
  return { line: loc.startLine, column: loc.startCol };
}
