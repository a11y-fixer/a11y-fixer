/** Reads a double/single-quoted attribute value from a tag's attribute string. */
export function readAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i');
  const m = attrs.match(re);
  return m ? m[2] : null;
}

/** Escapes a string for use inside a double-quoted HTML/JSX attribute. */
export function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Removes the named attribute (and its leading whitespace) from `line`, matching
 * the quoted-value, unquoted-value and valueless forms, case-insensitively.
 * Returns the rewritten line, or `null` if the attribute isn't present so callers
 * can human-flag rather than report a no-op fix. The name is treated literally.
 */
export function removeAttribute(line: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // name, optionally followed by =value (double/single-quoted or bare), plus any
  // leading whitespace so the tag stays well-formed after removal.
  const re = new RegExp(
    `\\s*\\b${escaped}(\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s"'>]+))?`,
    'i',
  );
  if (!re.test(line)) return null;
  return line.replace(re, '');
}

/**
 * Removes each named attribute from `line` in turn, returning the rewritten line
 * and the subset of names that were actually present and removed. Used by the
 * ARIA-attribute-stripping fixers, which get the names to drop from an axe
 * failure summary. Names are treated literally.
 */
export function removeNamedAttrs(
  line: string,
  names: readonly string[],
): { line: string; removed: string[] } {
  let updated = line;
  const removed: string[] = [];
  for (const name of names) {
    const next = removeAttribute(updated, name);
    if (next !== null) {
      updated = next;
      removed.push(name);
    }
  }
  return { line: updated, removed };
}
