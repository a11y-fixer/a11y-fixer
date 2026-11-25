import { describe, it, expect } from 'vitest';
import { sanitizeAccessibleName } from './sanitize-name.js';

describe('sanitizeAccessibleName', () => {
  it('accepts clean short labels, trimming wrapping quotes/space', () => {
    expect(sanitizeAccessibleName('Close dialog')).toBe('Close dialog');
    expect(sanitizeAccessibleName('  Submit form  ')).toBe('Submit form');
    expect(sanitizeAccessibleName('"Search"')).toBe('Search');
    expect(sanitizeAccessibleName('Delete document')).toBe('Delete document');
  });

  it('rejects empty / whitespace-only output', () => {
    expect(sanitizeAccessibleName('')).toBeNull();
    expect(sanitizeAccessibleName('   ')).toBeNull();
    expect(sanitizeAccessibleName('""')).toBeNull();
  });

  it('rejects multi-line output (model thinking out loud)', () => {
    expect(sanitizeAccessibleName('Submit\nOr maybe cancel')).toBeNull();
  });

  it('rejects implausibly long output', () => {
    expect(sanitizeAccessibleName('a'.repeat(81))).toBeNull();
  });

  it('rejects echoed JSX/template expressions (unresolved braces)', () => {
    expect(sanitizeAccessibleName('Toggle {key} state')).toBeNull();
    expect(sanitizeAccessibleName('Color picker for {props.label}')).toBeNull();
  });

  it('rejects refusal / meta-commentary non-answers', () => {
    // The exact failure mode observed on a context-poor icon button.
    expect(
      sanitizeAccessibleName(
        'I need more context to provide an accurate aria-label, as the SVG is empty',
      ),
    ).toBeNull();
    expect(sanitizeAccessibleName('I cannot determine the purpose of this control')).toBeNull();
    expect(sanitizeAccessibleName('Unfortunately there is no visual content')).toBeNull();
    expect(sanitizeAccessibleName('Based on typical UI patterns, here are options')).toBeNull();
    expect(sanitizeAccessibleName('Please provide more detail')).toBeNull();
  });
});
