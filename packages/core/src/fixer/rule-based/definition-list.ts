import { readFile, writeFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import {
  type Edit,
  type Element,
  childElements,
  findElement,
  hasRole,
  isElement,
  parseWithLocations,
  renameEdits,
  applyEdits,
} from '../shared/html-edit.js';

/** Elements axe `definition-list` permits as direct children of a `<dl>`. */
const DL_ALLOWED = new Set(['dt', 'dd', 'script', 'template', 'div']);
/** Plain grouping tags we can safely rename, since they carry no own semantics. */
const RENAMABLE = new Set(['div', 'span', 'p']);

/** Whether every element child of `el` is a `<dt>` or `<dd>` (and there is at least one). */
function wrapsOnlyTerms(el: Element): boolean {
  const children = childElements(el);
  return children.length > 0 && children.every(c => c.tagName === 'dt' || c.tagName === 'dd');
}

/**
 * Fixes axe `definition-list` (WCAG 1.3.1): a `<dl>` whose opening tag starts on
 * 1-indexed `line` must only directly contain `<dt>`/`<dd>` groups, `<script>`,
 * `<template>` or `<div>`.
 *
 * Auto-fixes only the unambiguous case — every offending direct child is a plain
 * `<span>`/`<p>` with no `role` that wraps only `<dt>`/`<dd>` — by renaming each to
 * `<div>` (a spec-valid grouping element). Returns `null` (caller human-flags) when
 * there is no `<dl>` on that line, nothing offends, or any offending child isn't a
 * safe term-group wrapper.
 */
export function fixDefinitionList(content: string, line: number): string | null {
  const doc = parseWithLocations(content);
  const dl = findElement(doc, el =>
    el.tagName === 'dl' && el.sourceCodeLocation?.startTag?.startLine === line,
  );
  if (!dl) return null;

  const offending = childElements(dl).filter(el => !DL_ALLOWED.has(el.tagName));
  if (offending.length === 0) return null;
  if (!offending.every(el => RENAMABLE.has(el.tagName) && !hasRole(el) && wrapsOnlyTerms(el))) {
    return null;
  }

  const edits: Edit[] = [];
  for (const el of offending) {
    const e = renameEdits(el, 'div', content);
    if (!e) return null;
    edits.push(...e);
  }
  return applyEdits(content, edits);
}

/**
 * Fixes axe `dlitem` (WCAG 1.3.1): a `<dt>`/`<dd>` whose opening tag starts on
 * 1-indexed `line` must sit inside a `<dl>`.
 *
 * Auto-fixes only the unambiguous case — the term's parent is a plain
 * `<div>`/`<span>` with no `role` whose every element child is a `<dt>`/`<dd>` — by
 * renaming that parent to `<dl>`. Returns `null` (caller human-flags) otherwise.
 */
export function fixDlItem(content: string, line: number): string | null {
  const doc = parseWithLocations(content);
  const item = findElement(doc, el =>
    (el.tagName === 'dt' || el.tagName === 'dd') &&
    el.sourceCodeLocation?.startTag?.startLine === line,
  );
  if (!item) return null;

  const parent = item.parentNode;
  if (!parent || !isElement(parent as never)) return null;
  const parentEl = parent as Element;
  if (parentEl.tagName !== 'div' && parentEl.tagName !== 'span') return null;
  if (hasRole(parentEl)) return null;
  if (!wrapsOnlyTerms(parentEl)) return null;

  const edits = renameEdits(parentEl, 'dl', content);
  if (!edits) return null;
  return applyEdits(content, edits);
}

/**
 * Fixes axe `definition-list` and `dlitem` (both WCAG 1.3.1) by repairing
 * definition-list structure in source — renaming stray term-group wrappers of a
 * `<dl>` to `<div>`, or a plain wrapper of orphan `<dt>`/`<dd>` to `<dl>`. Both
 * rewrites are deterministic (rule-based bucket); anything structurally ambiguous
 * is human-flagged, not guessed. Mirrors {@link ListFixer}.
 */
export class DefinitionListFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'definition-list' || violation.id === 'dlitem';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      return this.humanFlag(violation, 'No source location to repair definition-list structure');
    }

    const content = await readFile(node.sourceFile, 'utf8').catch(() => null);
    if (content === null) {
      return this.humanFlag(violation, 'Could not read source file');
    }

    const updated =
      violation.id === 'definition-list'
        ? fixDefinitionList(content, node.sourceLine)
        : fixDlItem(content, node.sourceLine);
    if (updated === null) {
      return this.humanFlag(violation, 'Definition-list structure needs a manual review');
    }

    try {
      await writeFile(node.sourceFile, updated, 'utf8');
    } catch {
      return this.humanFlag(violation, 'Could not write the repaired definition-list structure');
    }

    const description =
      violation.id === 'definition-list'
        ? 'Renamed stray <dl> children to <div> so the definition list is structured correctly'
        : 'Wrapped orphan <dt>/<dd> terms in a <dl> so they are used semantically';

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
