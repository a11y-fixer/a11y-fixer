import type { Range } from './mask.js';

/**
 * Finds an Angular `@Component({ template: … })` property whose value is a string
 * literal, so its interior (the HTML template) can be isolated while the rest of
 * the `.component.ts` — imports, class body, decoy strings — is blanked.
 *
 * `\btemplate\s*:\s*` never matches `templateUrl:` (the char after `template` is
 * `U`, not `:`), and the pattern has no nested quantifiers, so it is ReDoS-safe.
 */
const TEMPLATE_KEY = /\btemplate\s*:\s*/g;

/** Opening of an Angular `@Component(` / `Component({` decorator. ReDoS-safe. */
const COMPONENT_DECORATOR = /@?\bComponent\s*\(/;

/**
 * Extracts the blank-ranges for an Angular component defined inline in a
 * `.component.ts` file: everything outside the first string-valued `template:`
 * property. Supports backtick, single- and double-quoted literals; the interior
 * is kept at its original offsets so a located line maps 1:1 back to source.
 *
 * Deliberately conservative — returns `null` (skip the file) when there is no
 * `@Component(` decorator, no inline `template:` string literal inside its argument
 * object (e.g. a `templateUrl:` component), or an unterminated literal. The search
 * is bounded to the decorator's `(...)` argument span, so a decoy `template:`-valued
 * string ANYWHERE else in the file — a config object before the decorator, a class
 * field after it — cannot capture the match and blank the real template.
 * Under-reporting is the safe failure mode for a scanner that stamps source lines.
 *
 * Known v1 limitation: a backtick template whose `${…}` interpolation contains a
 * nested backtick is not tracked and may truncate early; such templates are rare.
 */
export function extractAngularInline(content: string): Range[] | null {
  const decorator = COMPONENT_DECORATOR.exec(content);
  if (decorator === null) return null;
  // The decorator match ends on its `(`; bound the search to the matching `)`.
  const argsOpen = decorator.index + decorator[0].length - 1;
  const argsEnd = matchParen(content, argsOpen);
  TEMPLATE_KEY.lastIndex = argsOpen + 1;
  let match: RegExpExecArray | null;
  while ((match = TEMPLATE_KEY.exec(content)) !== null) {
    if (match.index >= argsEnd) break; // past the decorator argument object
    const quoteIdx = match.index + match[0].length;
    const quote = content[quoteIdx];
    if (quote !== '`' && quote !== '"' && quote !== "'") continue;
    const innerStart = quoteIdx + 1;
    const innerEnd = findStringEnd(content, innerStart, quote);
    if (innerEnd === -1) return null; // unterminated → ambiguous, skip
    return [
      [0, innerStart],
      [innerEnd, content.length],
    ];
  }
  return null;
}

/**
 * Given the index of `(`, returns the index just past its matching `)` (paren-depth
 * matched), or `content.length` if unbalanced — so the search span is bounded.
 * String literals are skipped so a paren inside a decorator property string (e.g.
 * `styles: ['.a::after{content:")"}']`) does not close the span early.
 */
function matchParen(content: string, open: number): number {
  let depth = 0;
  for (let i = open; i < content.length; i++) {
    const c = content[i];
    if (c === '"' || c === "'" || c === '`') {
      const end = findStringEnd(content, i + 1, c);
      if (end === -1) return content.length; // unterminated string → whole file
      i = end; // skip over the string literal's contents
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return i + 1;
  }
  return content.length;
}

/** Index of the unescaped closing `quote` at or after `start`, or -1 if none. */
function findStringEnd(content: string, start: number, quote: string): number {
  for (let i = start; i < content.length; i++) {
    const c = content[i];
    if (c === '\\') {
      i++; // skip the escaped character
      continue;
    }
    if (c === quote) return i;
  }
  return -1;
}
