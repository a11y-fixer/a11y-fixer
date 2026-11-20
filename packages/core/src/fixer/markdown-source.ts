import { readFile, writeFile } from 'node:fs/promises';

/**
 * Makes text safe to splice into a Markdown image/link label. AI-generated or
 * inferred text is influenced by the scanned file's content, so a stray `]`/`[`
 * or newline could close the `![...]`/`[...]` bracket early or inject extra
 * markdown. Collapse any newline run to a space, then escape backslashes and
 * square brackets (a `)` inside the label is harmless — only the href's `)`
 * closes the construct). Backslashes are escaped first so a pre-existing `\`
 * can't combine with the bracket escaping to break back out of the label.
 */
export function sanitizeInlineLabel(text: string): string {
  return text
    .replace(/[\r\n]+/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/[[\]]/g, (c) => '\\' + c)
    .trim();
}

/**
 * A located Markdown construct on a specific source line, ready to be replaced.
 * Markdown fixers locate the exact occurrence by **column** (not a naive
 * line-wide `replace`) so a line with two images/links is edited unambiguously.
 */
export interface Located {
  lines: string[];
  /** 0-indexed line in {@link lines}. */
  lineIndex: number;
  /** 0-indexed offset of the match within the raw line. */
  start: number;
  match: RegExpMatchArray;
}

/**
 * Reads `file` and matches `anchored` (must start with `^`) at `column`
 * (1-indexed) on `line` (1-indexed). Returns the match plus the file's lines so
 * {@link writeReplacement} can splice a replacement in at exactly that column.
 * Returns null if the file is unreadable or the construct is no longer there.
 */
export async function locateAtColumn(
  file: string,
  line: number,
  column: number,
  anchored: RegExp,
): Promise<Located | null> {
  let content: string;
  try {
    content = await readFile(file, 'utf8');
  } catch {
    return null;
  }
  const lines = content.split('\n');
  const lineIndex = line - 1;
  const raw = lines[lineIndex];
  if (raw === undefined) return null;

  const start = column - 1;
  const match = anchored.exec(raw.slice(start));
  if (!match) return null;

  return { lines, lineIndex, start, match };
}

/** Splices `replacement` over the located match and writes the file back. */
export async function writeReplacement(
  file: string,
  located: Located,
  replacement: string,
): Promise<string> {
  const raw = located.lines[located.lineIndex] ?? '';
  const updated =
    raw.slice(0, located.start) +
    replacement +
    raw.slice(located.start + located.match[0].length);
  located.lines[located.lineIndex] = updated;
  await writeFile(file, located.lines.join('\n'), 'utf8');
  return updated;
}

/**
 * Rewrites one whole 1-indexed `line` of `file` via `transform`, which receives
 * the current line text and returns its replacement (or `null` to abort without
 * writing). Used by the rule-based Markdown fixers (heading demote, table header
 * fill) that rewrite a single line in place without changing the line count.
 * Returns the new line, or null if the file is unreadable, the line is missing,
 * or `transform` aborts.
 */
export async function rewriteLine(
  file: string,
  line: number,
  transform: (current: string) => string | null,
): Promise<string | null> {
  let content: string;
  try {
    content = await readFile(file, 'utf8');
  } catch {
    return null;
  }
  const lines = content.split('\n');
  const idx = line - 1;
  const current = lines[idx];
  if (current === undefined) return null;
  const next = transform(current);
  if (next === null) return null;
  lines[idx] = next;
  await writeFile(file, lines.join('\n'), 'utf8');
  return next;
}
