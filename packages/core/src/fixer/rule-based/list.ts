import { readFile, writeFile } from 'node:fs/promises';
import { parse } from 'parse5';
import type { DefaultTreeAdapterMap } from 'parse5';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';

type Element = DefaultTreeAdapterMap['element'];
type ChildNode = DefaultTreeAdapterMap['childNode'];
type ParentNode = DefaultTreeAdapterMap['parentNode'];

/** Elements axe `list` permits as direct children of a `<ul>`/`<ol>`. */
const LIST_ALLOWED = new Set(['li', 'script', 'template']);
/** Generic grouping tags we can safely rename, since they carry no own semantics. */
const RENAMABLE = new Set(['div', 'span', 'p']);

interface Edit {
  start: number;
  end: number;
  text: string;
}

function isElement(n: ChildNode): n is Element {
  return 'tagName' in n;
}

/** Direct child elements (skipping text/comment nodes) of a parent node. */
function childElements(parent: ParentNode): Element[] {
  const children = (parent as { childNodes?: ChildNode[] }).childNodes;
  if (!children) return [];
  return children.filter(isElement);
}

function hasRole(el: Element): boolean {
  return el.attrs.some(a => a.name === 'role');
}

/** Pre-order DFS over element nodes, stopping once `visit` returns true. */
function findElement(parent: ParentNode, visit: (el: Element) => boolean): Element | null {
  for (const child of childElements(parent)) {
    if (visit(child)) return child;
    const found = findElement(child, visit);
    if (found) return found;
  }
  return null;
}

/**
 * Builds the open- and close-tag edits that rename `el` to `<newTag>`, preserving
 * its attributes and inner content. Returns `null` when the element lacks start/end
 * tag source locations (e.g. JSX the HTML parser can't place, or a self-closed tag).
 */
function renameEdits(el: Element, newTag: string, content: string): Edit[] | null {
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

/** Applies edits by splicing from the last offset backwards, keeping earlier offsets valid. */
function applyEdits(content: string, edits: Edit[]): string {
  let out = content;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return out;
}

/**
 * Fixes axe `list` (WCAG 1.3.1): a `<ul>`/`<ol>` whose opening tag starts on
 * 1-indexed `line` must only directly contain `<li>`/`<script>`/`<template>`.
 *
 * Auto-fixes only the unambiguous case — every offending direct child is a plain
 * `<div>`/`<span>`/`<p>` with no `role` — by renaming each to `<li>`. Returns `null`
 * (caller human-flags) when there is no list on that line, nothing offends, or any
 * offending child is interactive, role-bearing, or otherwise not a safe rename.
 */
export function fixList(content: string, line: number): string | null {
  const doc = parse(content, { sourceCodeLocationInfo: true });
  const list = findElement(doc, el =>
    (el.tagName === 'ul' || el.tagName === 'ol') &&
    el.sourceCodeLocation?.startTag?.startLine === line,
  );
  if (!list) return null;

  const offending = childElements(list).filter(el => !LIST_ALLOWED.has(el.tagName));
  if (offending.length === 0) return null;
  if (!offending.every(el => RENAMABLE.has(el.tagName) && !hasRole(el))) return null;

  const edits: Edit[] = [];
  for (const el of offending) {
    const e = renameEdits(el, 'li', content);
    if (!e) return null;
    edits.push(...e);
  }
  return applyEdits(content, edits);
}

/**
 * Fixes axe `listitem` (WCAG 1.3.1): an `<li>` whose opening tag starts on
 * 1-indexed `line` must sit inside a `<ul>`/`<ol>`.
 *
 * Auto-fixes only the unambiguous case — the `<li>`'s parent is a plain
 * `<div>`/`<span>` with no `role` whose every element child is an `<li>` — by
 * renaming that parent to `<ul>`. Returns `null` (caller human-flags) otherwise:
 * no `<li>` on that line, a role-bearing or non-grouping parent, or mixed siblings.
 */
export function fixListItem(content: string, line: number): string | null {
  const doc = parse(content, { sourceCodeLocationInfo: true });
  const li = findElement(doc, el =>
    el.tagName === 'li' && el.sourceCodeLocation?.startTag?.startLine === line,
  );
  if (!li) return null;

  const parent = li.parentNode;
  if (!parent || !isElement(parent as ChildNode)) return null;
  const parentEl = parent as Element;
  if (parentEl.tagName !== 'div' && parentEl.tagName !== 'span') return null;
  if (hasRole(parentEl)) return null;

  const siblings = childElements(parentEl);
  if (siblings.length === 0 || !siblings.every(el => el.tagName === 'li')) return null;

  const edits = renameEdits(parentEl, 'ul', content);
  if (!edits) return null;
  return applyEdits(content, edits);
}

/**
 * Fixes axe `list` and `listitem` (both WCAG 1.3.1) by repairing list structure in
 * source — renaming stray grouping children of a list to `<li>`, or a plain wrapper
 * of orphan `<li>`s to `<ul>`. Both rewrites are deterministic, so this lives in the
 * rule-based bucket; anything structurally ambiguous is human-flagged, not guessed.
 */
export class ListFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'list' || violation.id === 'listitem';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to repair list structure');
    }

    const content = await readFile(node.sourceFile, 'utf8').catch(() => null);
    if (content === null) {
      return this.humanFlag(violation, 'Could not read source file');
    }

    const updated =
      violation.id === 'list'
        ? fixList(content, node.sourceLine)
        : fixListItem(content, node.sourceLine);
    if (updated === null) {
      return this.humanFlag(violation, 'List structure needs a manual review');
    }

    try {
      await writeFile(node.sourceFile, updated, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the repaired list structure');
    }

    const description =
      violation.id === 'list'
        ? 'Renamed stray list children to <li> so the list is structured correctly'
        : 'Wrapped orphan <li> items in a <ul> so they are used semantically';

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description,
      before: node.html,
      after: updated.split('\n')[node.sourceLine - 1]?.trim(),
      sourceLocation: {
        file: node.sourceFile,
        line: node.sourceLine,
        column: node.sourceColumn ?? 1,
      },
    };
  }

  private humanFlag(violation: A11yViolation, note: string): FixResult {
    return {
      wcagId: this.wcagId,
      bucket: 'human-flagged',
      applied: false,
      description: note,
      before: violation.nodes[0]?.html ?? '',
      humanNote: note,
    };
  }
}
