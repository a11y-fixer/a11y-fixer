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
