import { describe, it, expect } from 'vitest';
import { readAttr, escapeAttr, removeAttribute } from './attrs.js';

describe('readAttr', () => {
  it('reads a double-quoted value', () => {
    expect(readAttr(' src="/a/b.png" type="image"', 'src')).toBe('/a/b.png');
  });

  it('reads a single-quoted value', () => {
    expect(readAttr(" alt='Hello'", 'alt')).toBe('Hello');
  });

  it('is case-insensitive on the attribute name', () => {
    expect(readAttr(' TITLE="Hi"', 'title')).toBe('Hi');
  });

  it('returns an empty string for an empty value', () => {
    expect(readAttr(' alt=""', 'alt')).toBe('');
  });

  it('returns null when the attribute is absent', () => {
    expect(readAttr(' type="text"', 'alt')).toBeNull();
  });

  it('matches on a word boundary, so a hyphenated suffix still matches (known limitation)', () => {
    // `\bsrc` matches after the hyphen in `data-src`; callers only read known
    // plain attribute names where this does not arise.
    expect(readAttr(' data-src="/x"', 'src')).toBe('/x');
  });
});

describe('escapeAttr', () => {
  it('escapes ampersands and double quotes', () => {
    expect(escapeAttr('Tom & "Jerry"')).toBe('Tom &amp; &quot;Jerry&quot;');
  });

  it('leaves plain text unchanged', () => {
    expect(escapeAttr('plain text')).toBe('plain text');
  });
});

describe('removeAttribute', () => {
  it('removes a double-quoted attribute and its leading whitespace', () => {
    expect(removeAttribute('<div role="button" aria-expanded="true" class="x">', 'aria-expanded'))
      .toBe('<div role="button" class="x">');
  });

  it('removes a single-quoted attribute', () => {
    expect(removeAttribute("<p aria-label='hi'>", 'aria-label')).toBe('<p>');
  });

  it('removes a valueless attribute', () => {
    expect(removeAttribute('<button aria-hidden disabled>', 'aria-hidden')).toBe('<button disabled>');
  });

  it('returns null when the attribute is absent', () => {
    expect(removeAttribute('<div class="x">', 'aria-expanded')).toBeNull();
  });
});
