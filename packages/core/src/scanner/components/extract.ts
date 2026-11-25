import { parseFragment } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';
import type { Range } from './mask.js';
import type { FrameworkSpec, RawIsland } from './spec.js';

type ChildNode = DefaultTreeAdapterMap['childNode'];

/**
 * Leading Astro-style frontmatter fence. `^`-anchored and lazy, so it matches at
 * most one position and scans linearly — no catastrophic backtracking.
 */
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---/;

/**
 * Composes a {@link FrameworkSpec}'s masking primitives into the byte ranges to
 * blank. Returns `null` when the file has no scannable template (e.g. a Vue SFC
 * with no `<template>`, or an Angular `.ts` with no inline template literal).
 *
 * Precedence: a custom `extract` wins outright; then `rootElementOnly`; otherwise
 * the additive primitives (`frontmatterFence`, `blankElements`, `rawIslands`) are
 * unioned. `maskRanges` tolerates overlapping/unordered ranges, so no sorting.
 */
export async function extractRanges(content: string, spec: FrameworkSpec): Promise<Range[] | null> {
  if (spec.extract) return spec.extract(content);

  if (spec.rootElementOnly) {
    const inner = spec.rootElementOnly.locate
      ? await spec.rootElementOnly.locate(content)
      : locateBlock(content, spec.rootElementOnly.block);
    if (inner === null) return null;
    // Blank the complement — everything outside the block's inner content,
    // including the wrapper tags themselves.
    return [[0, inner[0]], [inner[1], content.length]];
  }

  const ranges: Range[] = [];
  if (spec.frontmatterFence) {
    const m = content.match(FRONTMATTER);
    if (m) ranges.push([0, m[0].length]);
  }
  if (spec.blankElements?.length) {
    collectElements(content, spec.blankElements, ranges);
  }
  if (spec.rawIslands?.length) {
    collectRawIslands(content, spec.rawIslands, ranges);
  }
  return ranges;
}

/**
 * Blanks the full source range of every element whose tag name is in `tags`,
 * using parse5 (a real HTML parser, so the exact end-tag grammar a browser uses
 * applies — no hand-rolled tag regex that `</script >` or `</script/` could evade).
 */
function collectElements(content: string, tags: string[], out: Range[]): void {
  const set = new Set(tags.map((t) => t.toLowerCase()));
  const fragment = parseFragment(content, { sourceCodeLocationInfo: true });
  walk(fragment.childNodes, set, out);
}

function walk(nodes: ChildNode[] | undefined, set: Set<string>, out: Range[]): void {
  if (!nodes) return;
  for (const node of nodes) {
    if (!('tagName' in node)) continue;
    const loc = node.sourceCodeLocation;
    if (set.has(node.tagName.toLowerCase()) && loc) {
      out.push([loc.startOffset, loc.endOffset]);
      continue; // don't descend into a blanked block
    }
    walk(node.childNodes, set, out);
  }
}

/**
 * Locates every raw island by literal `indexOf` scanning — intentionally never a
 * regex, so there is no backtracking regardless of input. An island with no
 * closer before EOF is blanked through to the end of the file.
 */
function collectRawIslands(content: string, islands: RawIsland[], out: Range[]): void {
  for (const island of islands) {
    const openers = island.openAliases ? [island.open, ...island.openAliases] : [island.open];
    let i = 0;
    while (i < content.length) {
      let start = -1;
      let opener = '';
      for (const op of openers) {
        const idx = content.indexOf(op, i);
        if (idx !== -1 && (start === -1 || idx < start)) {
          start = idx;
          opener = op;
        }
      }
      if (start === -1) break;
      const closeIdx = content.indexOf(island.close, start + opener.length);
      const end = closeIdx === -1 ? content.length : closeIdx + island.close.length;
      out.push([start, end]);
      i = end;
    }
  }
}

/**
 * parse5 fallback for {@link RootElementOnly} when a spec supplies no `locate`:
 * returns the inner `[start, end)` content range of the first element named
 * `block`, or `null` if it has no end tag / is absent.
 */
function locateBlock(content: string, block: string): Range | null {
  const name = block.toLowerCase();
  const fragment = parseFragment(content, { sourceCodeLocationInfo: true });
  const found = findElement(fragment.childNodes, name);
  const loc = found?.sourceCodeLocation;
  if (!loc?.startTag || !loc.endTag) return null;
  return [loc.startTag.endOffset, loc.endTag.startOffset];
}

function findElement(
  nodes: ChildNode[] | undefined,
  name: string,
): (ChildNode & { sourceCodeLocation?: DefaultTreeAdapterMap['element']['sourceCodeLocation'] }) | null {
  if (!nodes) return null;
  for (const node of nodes) {
    if (!('tagName' in node)) continue;
    if (node.tagName.toLowerCase() === name) return node;
    const nested = findElement(node.childNodes, name);
    if (nested) return nested;
  }
  return null;
}
