import { describe, it, expect } from 'vitest';
import { stripTags } from './strip-tags.js';

describe('stripTags', () => {
  it('removes tags and collapses whitespace', () => {
    expect(stripTags('  <b>Hello</b>   <i>world</i> ')).toBe('Hello world');
  });

  it('returns plain text unchanged (aside from trim/collapse)', () => {
    expect(stripTags('Just text')).toBe('Just text');
  });

  it('leaves no tag-opening "<" behind on nested/overlapping brackets', () => {
    // The loop keeps removing until stable, so no residual "<" can start a tag.
    const out = stripTags('<<b>script>alert(1)<</b>/script>');
    expect(out).not.toContain('<');
    expect(out).toContain('alert(1)');
  });

  it('removes a full script element, leaving only its inner text', () => {
    expect(stripTags('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('leaves an unterminated "<script" (no closing >) as inert text', () => {
    // Not a complete tag, so it stays as literal text — callers HTML-escape it.
    expect(stripTags('hi <script')).toBe('hi <script');
  });

  it('returns empty string for tag-only input', () => {
    expect(stripTags('<div></div>')).toBe('');
  });
});
