import { describe, it, expect } from 'vitest';
import { dedupeFixFiles, type FixResult } from './index.js';

// dedupeFixFiles lives in fixer/index.ts, which the coverage gate excludes
// (**/index.ts). The CLI's PR path relies on it to list changed files, yet its
// only other appearance in the suite is as a mock. These tests pin the real
// behavior so it can't regress unnoticed behind the excluded barrel.

const fix = (over: Partial<FixResult>): FixResult => ({
  wcagId: '1.1.1',
  bucket: 'rule-based',
  applied: true,
  description: 'fix',
  before: '<img>',
  ...over,
});

describe('dedupeFixFiles', () => {
  it('returns [] for no fixes', () => {
    expect(dedupeFixFiles([])).toEqual([]);
  });

  it('skips fixes that were not applied', () => {
    const fixes = [
      fix({ applied: false, sourceLocation: { file: '/repo/A.tsx', line: 1, column: 1 } }),
    ];
    expect(dedupeFixFiles(fixes)).toEqual([]);
  });

  it('skips applied fixes that have no source location', () => {
    expect(dedupeFixFiles([fix({ applied: true, sourceLocation: undefined })])).toEqual([]);
  });

  it('collects the files of applied fixes', () => {
    const fixes = [
      fix({ sourceLocation: { file: '/repo/A.tsx', line: 1, column: 1 } }),
      fix({ sourceLocation: { file: '/repo/B.tsx', line: 2, column: 1 } }),
    ];
    expect(dedupeFixFiles(fixes).sort()).toEqual(['/repo/A.tsx', '/repo/B.tsx']);
  });

  it('de-duplicates multiple fixes touching the same file', () => {
    const fixes = [
      fix({ sourceLocation: { file: '/repo/A.tsx', line: 1, column: 1 } }),
      fix({ sourceLocation: { file: '/repo/A.tsx', line: 9, column: 3 } }),
    ];
    expect(dedupeFixFiles(fixes)).toEqual(['/repo/A.tsx']);
  });
});
