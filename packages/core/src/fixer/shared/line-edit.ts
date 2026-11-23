import { readFile, writeFile } from 'node:fs/promises';
import type { A11yNode } from '../../detector/index.js';

/** Result of attempting an in-place edit of a violation's recorded source line. */
export type LineEdit =
  | { status: 'applied'; updated: string }
  | { status: 'flag'; note: string };

/**
 * Applies `transform` to the single source line a violation was recorded on,
 * writing the file back when it changes. Centralizes the read → locate line →
 * transform → write dance that every single-line rule-based fixer repeats.
 *
 * `transform` returns the rewritten line, or `null` when there is nothing
 * deterministic to do on that line — in which case the edit is flagged with
 * `noChangeNote` so the caller can human-flag rather than report a no-op fix.
 * The missing-source-location, unreadable-file, out-of-range and unwritable-file
 * cases are likewise returned as `flag` with an explanatory note.
 */
export async function editRecordedLine(
  node: Pick<A11yNode, 'sourceFile' | 'sourceLine'>,
  transform: (line: string) => string | null,
  noChangeNote: string,
): Promise<LineEdit> {
  if (!node.sourceFile || !node.sourceLine) {
    return { status: 'flag', note: 'No source location to apply the fix' };
  }

  let content: string;
  try {
    content = await readFile(node.sourceFile, 'utf8');
  } catch {
    return { status: 'flag', note: 'Could not read source file' };
  }

  const lines = content.split('\n');
  const idx = node.sourceLine - 1;
  const original = lines[idx];
  if (original === undefined) {
    return { status: 'flag', note: 'Recorded line is out of range' };
  }

  const updated = transform(original);
  if (updated === null) {
    return { status: 'flag', note: noChangeNote };
  }

  lines[idx] = updated;
  try {
    await writeFile(node.sourceFile, lines.join('\n'), 'utf8');
  } catch {
    return { status: 'flag', note: 'Could not write the fixed line' };
  }

  return { status: 'applied', updated };
}
