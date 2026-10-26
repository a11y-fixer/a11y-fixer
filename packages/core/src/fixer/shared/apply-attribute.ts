import { readFile, writeFile } from 'node:fs/promises';

/**
 * Adds an attribute to the opening tag on the given 1-indexed `line` of `file`.
 *
 * `tagRegex` must match the opening of the target element and capture, in group 1,
 * the character that should follow the tag name (typically whitespace), e.g.
 * `/<button(\s)/g` or `/<input(\s|\/|>)/g`. The attribute is spliced in right
 * after the tag name: `<button aria-label="…" …`.
 *
 * Returns the updated line, or `null` if the file/line can't be read or the tag
 * pattern didn't match (e.g. the attribute situation isn't what we expected).
 * The value is attribute-escaped for double-quoted JSX/HTML.
 */
export async function addAttributeToElement(
  file: string,
  line: number,
  tagRegex: RegExp,
  attr: string,
  value: string,
): Promise<string | null> {
  try {
    const content = await readFile(file, 'utf8');
    const lines = content.split('\n');
    const idx = line - 1;
    const original = lines[idx];
    if (original === undefined) return null;

    const escaped = value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const updated = original.replace(tagRegex, (match, tail: string) => {
      // match looks like "<button" + tail; insert the attribute before `tail`.
      const tagName = match.slice(0, match.length - tail.length);
      return `${tagName} ${attr}="${escaped}"${tail}`;
    });

    if (updated === original) return null;

    lines[idx] = updated;
    await writeFile(file, lines.join('\n'), 'utf8');
    return updated;
  } catch {
    return null;
  }
}
