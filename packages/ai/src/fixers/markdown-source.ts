import { readFile, writeFile } from 'node:fs/promises';

/**
 * Makes AI-generated text safe to splice into a Markdown image/link label.
 * The provider is trusted (the caller's own key) but its output is influenced by
 * the scanned file's surrounding content, so a stray `]`/`[` or newline could
 * close the `![...]`/`[...]` bracket early or inject extra markdown. Collapse
 * any newline run to a space, then escape backslashes and square brackets (a `)`
 * inside the label is harmless — only the href's `)` closes the construct).
 * Backslashes are escaped first so a pre-existing `\` can't combine with the
 * bracket escaping to break back out of the label.
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
