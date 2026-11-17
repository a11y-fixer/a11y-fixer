import { describe, it, expect } from 'vitest';
import { sanitizeInlineLabel } from './markdown-source.js';

describe('sanitizeInlineLabel', () => {
  it('leaves plain text untouched (trimmed)', () => {
    expect(sanitizeInlineLabel('  Company logo  ')).toBe('Company logo');
  });

  it('collapses newline runs to a single space', () => {
    expect(sanitizeInlineLabel('line one\n\r\nline two')).toBe('line one line two');
  });

  it('escapes square brackets so they cannot close the label', () => {
    expect(sanitizeInlineLabel('Chart [Q3]')).toBe('Chart \\[Q3\\]');
  });

  it('escapes a pre-existing backslash first (cannot break out via \\])', () => {
    // Without escaping the backslash first, `a]` -> `a\]` would leave the
    // original `\` to escape the inserted bracket and break back out.
    expect(sanitizeInlineLabel('a\\b')).toBe('a\\\\b');
    expect(sanitizeInlineLabel('trailing\\')).toBe('trailing\\\\');
    expect(sanitizeInlineLabel('mix\\]end')).toBe('mix\\\\\\]end');
  });

  it('leaves parentheses alone (harmless inside the label)', () => {
    expect(sanitizeInlineLabel('Figure (a)')).toBe('Figure (a)');
  });
});
