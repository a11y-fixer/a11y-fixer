import { describe, it, expect } from 'vitest';
import {
  fixId,
  normalizeMarkup,
  methodBucket,
  buildExamplePreamble,
  dedupeExamples,
  extractValue,
  extractAnchor,
} from './index.js';

describe('fixId', () => {
  it('is stable across line/whitespace shifts (content-keyed, not positional)', () => {
    const a = fixId({ wcagId: '1.1.1', sourceFile: 'src/App.tsx', before: '<img src="x.png">' });
    const b = fixId({ wcagId: '1.1.1', sourceFile: 'src/App.tsx', before: '   <img   src="x.png">  ' });
    expect(a).toBe(b);
  });

  it('differs when rule, file, or markup differ', () => {
    const base = { wcagId: '1.1.1', sourceFile: 'a.tsx', before: '<img src="x.png">' };
    expect(fixId(base)).not.toBe(fixId({ ...base, wcagId: '2.4.4' }));
    expect(fixId(base)).not.toBe(fixId({ ...base, sourceFile: 'b.tsx' }));
    expect(fixId(base)).not.toBe(fixId({ ...base, before: '<img src="y.png">' }));
  });
});

describe('normalizeMarkup', () => {
  it('collapses whitespace', () => {
    expect(normalizeMarkup('  <a\n  href="x">  ')).toBe('<a href="x">');
  });
});

describe('methodBucket', () => {
  it('maps both alt paths to the alt bucket', () => {
    expect(methodBucket('describeImage')).toBe('alt');
    expect(methodBucket('suggestAltText')).toBe('alt');
    expect(methodBucket('rewriteLinkText')).toBe('link');
    expect(methodBucket('suggestAccessibleName')).toBe('name');
  });
});

describe('buildExamplePreamble', () => {
  it('is empty on a cold repo so the prompt (and cache key) is unchanged', () => {
    expect(buildExamplePreamble('alt', undefined)).toBe('');
    expect(buildExamplePreamble('alt', [])).toBe('');
  });

  it('lists accepted values and names the bucket', () => {
    const p = buildExamplePreamble('alt', ['Golden retriever puppy', 'Team photo at the summit']);
    expect(p).toContain('alt text');
    expect(p).toContain('"Golden retriever puppy"');
    expect(p).toContain('"Team photo at the summit"');
  });

  it('caps at the limit', () => {
    const p = buildExamplePreamble('name', ['a', 'b', 'c', 'd', 'e', 'f'], 3);
    expect(p).toContain('"a"');
    expect(p).toContain('"c"');
    expect(p).not.toContain('"d"');
  });
});

describe('dedupeExamples', () => {
  it('removes case-insensitive duplicates and blanks, preserving order', () => {
    expect(dedupeExamples(['Cat', 'cat', '', '  ', 'Dog'])).toEqual(['Cat', 'Dog']);
  });
});

describe('extractValue', () => {
  it('pulls alt, aria-label, and anchor text per bucket', () => {
    expect(extractValue('alt', '<img src="x" alt="A dog">')).toBe('A dog');
    expect(extractValue('name', '<button aria-label="Close dialog">')).toBe('Close dialog');
    expect(extractValue('link', '<a href="/docs">Read the docs</a>')).toBe('Read the docs');
  });

  it('returns null when the value is absent', () => {
    expect(extractValue('alt', '<img src="x">')).toBeNull();
    expect(extractValue('name', '<button>')).toBeNull();
  });
});

describe('extractAnchor', () => {
  it('returns a stable locator per bucket, else null', () => {
    expect(extractAnchor('alt', '<img src="hero.png" alt="x">')).toBe('hero.png');
    expect(extractAnchor('link', '<a href="/pricing">x</a>')).toBe('/pricing');
    expect(extractAnchor('name', '<button aria-label="x">')).toBeNull();
  });
});
