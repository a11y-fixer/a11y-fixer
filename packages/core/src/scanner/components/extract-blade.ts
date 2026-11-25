import type { Range } from './mask.js';

/**
 * Blanks Blade's non-HTML islands so the HTML-shaped template remains for axe.
 * Handled: `<?php … ?>` / `<?= … ?>` PHP tags, `{{-- … --}}` Blade comments,
 * block `@php … @endphp`, and the inline `@php(expr)` directive. The inline form
 * has NO `@endphp`, so a generic open/close island would find no closer and blank
 * to EOF — swallowing every element after a valid `@php($x = 1)` statement; it is
 * closed at its matching `)` instead (paren-depth matched).
 *
 * Left inert (HTML-shaped, parsed as text/attributes by axe): `{{ $x }}`,
 * `{!! !!}`, and `@if`/`@foreach`/other directives.
 *
 * Index/cursor scanning only — never regex — so there is no backtracking. A PHP
 * tag or block with no closer runs to EOF (correct PHP semantics for a stray
 * `<?php`). Known v1 limitation: a closer appearing inside a PHP/Blade string
 * literal (e.g. `?>` inside `"a?>b"`) closes the island early; such cases are rare.
 */
export function extractBlade(content: string): Range[] {
  const ranges: Range[] = [];
  const len = content.length;
  let i = 0;
  while (i < len) {
    const opener = earliestOpener(content, i);
    if (opener === null) break;
    const { start, kind } = opener;
    let end: number;
    switch (kind) {
      case 'php':
      case 'phpEcho': {
        const close = content.indexOf('?>', start + (kind === 'php' ? 5 : 3));
        end = close === -1 ? len : close + 2;
        break;
      }
      case 'comment': {
        const close = content.indexOf('--}}', start + 4);
        end = close === -1 ? len : close + 4;
        break;
      }
      default: {
        // `@php`: inline `@php(` → matching ')'; block `@php … @endphp`.
        const after = start + 4; // past '@php'
        if (content[after] === '(') {
          end = matchParen(content, after, len);
        } else {
          const close = content.indexOf('@endphp', after);
          end = close === -1 ? len : close + 7;
        }
      }
    }
    ranges.push([start, end]);
    i = end;
  }
  return ranges;
}

type OpenerKind = 'php' | 'phpEcho' | 'comment' | 'bladePhp';

/** The earliest island opener at or after `from`, or null if none remains. */
function earliestOpener(content: string, from: number): { start: number; kind: OpenerKind } | null {
  let best: { start: number; kind: OpenerKind } | null = null;
  const consider = (start: number, kind: OpenerKind) => {
    if (start !== -1 && (best === null || start < best.start)) best = { start, kind };
  };
  consider(content.indexOf('<?php', from), 'php');
  consider(content.indexOf('<?=', from), 'phpEcho');
  consider(content.indexOf('{{--', from), 'comment');
  consider(findBladePhp(content, from), 'bladePhp');
  return best;
}

/**
 * Index of the next `@php` directive at or after `from` that is a real directive —
 * followed by `(`, whitespace, or end of input — not an `@php…` identifier prefix.
 */
function findBladePhp(content: string, from: number): number {
  let idx = content.indexOf('@php', from);
  while (idx !== -1) {
    const next = content[idx + 4];
    if (next === undefined || next === '(' || /\s/.test(next)) return idx;
    idx = content.indexOf('@php', idx + 4);
  }
  return -1;
}

/**
 * Given the index of `(` after `@php`, returns the index just past its matching
 * `)` (paren-depth matched). Falls back to EOF if the parens are unbalanced.
 */
function matchParen(content: string, open: number, len: number): number {
  let depth = 0;
  for (let i = open; i < len; i++) {
    const c = content[i];
    if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i + 1;
  }
  return len;
}
