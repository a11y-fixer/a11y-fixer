import { describe, it, expect } from 'vitest';
import { canonicalizeLangTag } from './lang-tag.js';

describe('canonicalizeLangTag', () => {
  it('returns an already-canonical tag unchanged', () => {
    expect(canonicalizeLangTag('fr')).toBe('fr');
    expect(canonicalizeLangTag('en-US')).toBe('en-US');
  });

  it('canonicalizes casing and underscores to BCP-47', () => {
    expect(canonicalizeLangTag('EN_us')).toBe('en-US');
    expect(canonicalizeLangTag('en-us')).toBe('en-US');
    expect(canonicalizeLangTag('  de  ')).toBe('de');
  });

  it('returns null for structurally invalid input', () => {
    expect(canonicalizeLangTag('xx_yy_zz')).toBeNull();
    expect(canonicalizeLangTag('toolongxx')).toBeNull(); // 9-letter primary subtag
    expect(canonicalizeLangTag('a')).toBeNull(); // too short
  });

  it('accepts a structurally well-formed but unregistered subtag (no language registry)', () => {
    // Intl validates structure, not registration — this is the documented limit
    // of a deterministic, registry-free check.
    expect(canonicalizeLangTag('englsh')).toBe('englsh');
  });

  it('returns null for empty input', () => {
    expect(canonicalizeLangTag('')).toBeNull();
    expect(canonicalizeLangTag('   ')).toBeNull();
  });
});
