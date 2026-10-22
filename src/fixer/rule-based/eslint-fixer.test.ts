import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';
import type { A11yViolation } from '../../detector/index.js';

// EslintRunner is constructed internally by EslintFixer, so mock the module to
// control what `fix()` reports without depending on ESLint's (limited) set of
// auto-fixable jsx-a11y rules.
const fixMock = vi.hoisted(() => vi.fn());
vi.mock('../../runners/eslint-runner.js', () => ({
  EslintRunner: class {
    fix = fixMock;
  },
}));

import { EslintFixer } from './eslint-fixer.js';

const ROOT = '/repo';

function violation(wcagId: string, sourceFiles: (string | undefined)[]): A11yViolation {
  return {
    id: 'html-has-lang',
    wcagId,
    impact: 'serious',
    description: 'missing lang',
    helpUrl: '',
    nodes: sourceFiles.map((f, i) => ({
      html: `${f ?? 'x'}:${i + 1}:1`,
      target: [],
      failureSummary: '',
      sourceFile: f,
      sourceLine: i + 1,
      sourceColumn: 1,
    })),
  };
}

describe('EslintFixer', () => {
  beforeEach(() => { fixMock.mockReset(); });

  it('canFix matches on wcagId', () => {
    const fixer = new EslintFixer('4.1.2', ROOT);
    expect(fixer.canFix(violation('4.1.2', ['/repo/App.tsx']))).toBe(true);
    expect(fixer.canFix(violation('1.1.1', ['/repo/App.tsx']))).toBe(false);
  });

  it('human-flags when no node carries a source file', async () => {
    const fixer = new EslintFixer('3.1.1', ROOT);
    const result = await fixer.fix(violation('3.1.1', [undefined]));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
    expect(result.description).toContain('No source file');
    expect(fixMock).not.toHaveBeenCalled();
  });

  it('delegates unique source files to EslintRunner.fix and reports applied', async () => {
    fixMock.mockResolvedValue({ violations: [], fixedFiles: ['/repo/App.tsx'] });
    const fixer = new EslintFixer('3.1.1', ROOT);

    const result = await fixer.fix(violation('3.1.1', ['/repo/App.tsx', '/repo/App.tsx']));

    // Duplicate paths are de-duped before delegation.
    expect(fixMock).toHaveBeenCalledWith(['/repo/App.tsx']);
    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    expect(result.description).toContain(path.join('App.tsx'));
  });

  it('reports applied:false when ESLint fixes nothing', async () => {
    fixMock.mockResolvedValue({ violations: [], fixedFiles: [] });
    const fixer = new EslintFixer('3.1.1', ROOT);

    const result = await fixer.fix(violation('3.1.1', ['/repo/App.tsx']));

    expect(result.applied).toBe(false);
    expect(result.description).toContain('no auto-fix available');
  });
});
