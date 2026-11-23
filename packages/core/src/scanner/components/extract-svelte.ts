import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';
import type { Range } from './mask.js';

type ChildNode = DefaultTreeAdapterMap['childNode'];

/**
 * A Svelte component *is* its template, minus the `<script>` and `<style>`
 * elements. We locate those with parse5 (a real HTML parser, so it applies the
 * exact end-tag grammar a browser does — no hand-rolled tag-filter regex that
 * could be evaded by `</script >`, `</script/`, etc.) and return each element's
 * full source range so the scanner blanks it. Everything else — HTML-shaped
 * markup interleaved with `{#if}`/`{expr}`, which parse to inert text/attribute
 * values — is handed to axe unchanged.
 */
export function extractSvelte(content: string): Range[] {
  const fragment = parseFragment(content, { sourceCodeLocationInfo: true });
  const out: Range[] = [];
  collectScriptStyle(fragment.childNodes, out);
  return out;
}

function collectScriptStyle(nodes: ChildNode[] | undefined, out: Range[]): void {
  if (!nodes) return;
  for (const node of nodes) {
    if (!('tagName' in node)) continue;
    const tag = node.tagName.toLowerCase();
    const loc = node.sourceCodeLocation;
    if ((tag === 'script' || tag === 'style') && loc) {
      out.push([loc.startOffset, loc.endOffset]);
      continue; // don't descend into a blanked block
    }
    collectScriptStyle(node.childNodes, out);
  }
}
