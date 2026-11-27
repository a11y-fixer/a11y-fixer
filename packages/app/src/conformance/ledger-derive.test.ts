import { describe, it, expect } from 'vitest';
import { deriveClaims, type DerivableScan, type DerivableViolation } from './ledger-derive.js';
import { pageSubjectKey } from './claim.js';

function vio(over: Partial<DerivableViolation> = {}): DerivableViolation {
  return { ruleId: 'image-alt', wcagId: '1.1.1', impact: 'serious', path: 'src/a.html', line: 10, ...over };
}

function scan(over: Partial<DerivableScan> = {}): DerivableScan {
  return {
    repoId: 7,
    headSha: 'abc123',
    assertedAt: '2026-01-01T00:00:00Z',
    truncated: false,
    engine: 'axe-core',
    engineVersion: '4.9.1',
    scanPath: 'html',
    violations: [],
    ...over,
  };
}

describe('deriveClaims — fail claims', () => {
  it('emits one fail per (path, criterion), folding multiple locations into evidence', () => {
    const drafts = deriveClaims(
      scan({
        violations: [
          vio({ wcagId: '1.1.1', line: 10 }),
          vio({ wcagId: '1.1.1', line: 22 }), // same path+criterion -> one claim
          vio({ wcagId: '4.1.2', ruleId: 'button-name', line: 5 }),
        ],
      }),
    );
    const fails = drafts.filter(d => d.body.state === 'fail');
    expect(fails).toHaveLength(2);
    const alt = fails.find(d => d.body.criterion === '1.1.1')!;
    expect(alt.body.subjectKey).toBe(pageSubjectKey(7, 'src/a.html'));
    expect((alt.evidence!.blob as { items: unknown[] }).items).toHaveLength(2);
    expect(alt.body.level).toBe('A');
  });

  it('separates the same criterion on different files into different subjects', () => {
    const drafts = deriveClaims(
      scan({
        violations: [vio({ path: 'src/a.html' }), vio({ path: 'src/b.html' })],
      }),
    );
    const subjects = new Set(drafts.filter(d => d.body.state === 'fail').map(d => d.body.subjectKey));
    expect(subjects.size).toBe(2);
  });

  it('skips a violation whose wcagId is not a tracked 2.2 A/AA criterion', () => {
    const drafts = deriveClaims(scan({ violations: [vio({ wcagId: '9.9.9' })] }));
    expect(drafts).toHaveLength(0);
  });

  it('attributes an unlocated violation to a sentinel path and infers no pass from it', () => {
    const drafts = deriveClaims(scan({ violations: [vio({ path: null, line: null })] }));
    const fails = drafts.filter(d => d.body.state === 'fail');
    expect(fails).toHaveLength(1);
    expect(fails[0].body.subjectKey).toContain('no source location');
    // No pass claims, because no file was proven scanned.
    expect(drafts.some(d => d.body.state === 'pass')).toBe(false);
  });
});

describe('deriveClaims — pass claims (the risk-#1 path)', () => {
  it('emits pass for a pass-eligible criterion on a scanned file that did not fail it', () => {
    // a.html failed 1.1.1 (proves it was scanned); 1.4.2/3.1.1 are pass-eligible (html).
    const drafts = deriveClaims(scan({ violations: [vio({ wcagId: '1.1.1', path: 'src/a.html' })] }));
    const passes = drafts.filter(d => d.body.state === 'pass');
    expect(passes.map(d => d.body.criterion).sort()).toEqual(['1.4.2', '3.1.1']);
    expect(passes.every(d => d.body.subjectKey === pageSubjectKey(7, 'src/a.html'))).toBe(true);
    expect(passes.every(d => d.body.confidence === 1)).toBe(true);
  });

  it('does NOT emit a pass for a criterion that failed on that file', () => {
    // 1.4.2 itself fails here, so no 1.4.2 pass — only 3.1.1.
    const drafts = deriveClaims(
      scan({ violations: [vio({ wcagId: '1.4.2', ruleId: 'no-autoplay-audio', path: 'src/a.html' })] }),
    );
    const passes = drafts.filter(d => d.body.state === 'pass').map(d => d.body.criterion);
    expect(passes).toEqual(['3.1.1']);
  });

  it('emits NO pass claims when the report was truncated', () => {
    const drafts = deriveClaims(scan({ truncated: true, violations: [vio({ path: 'src/a.html' })] }));
    expect(drafts.some(d => d.body.state === 'pass')).toBe(false);
    expect(drafts.some(d => d.body.state === 'fail')).toBe(true); // fails still emitted
  });

  it('emits NO pass claims on a v1 contract (engine/path unknown) — fail-only', () => {
    const drafts = deriveClaims(
      scan({ engine: null, engineVersion: null, scanPath: null, violations: [vio({ path: 'src/a.html' })] }),
    );
    expect(drafts.some(d => d.body.state === 'pass')).toBe(false);
    const fail = drafts.find(d => d.body.state === 'fail')!;
    expect(fail.body.assertedBy).toBe('scanner'); // no engine in the attribution
  });

  it('emits no pass for the JSX path (nothing pass-eligible there yet)', () => {
    const drafts = deriveClaims(
      scan({ scanPath: 'jsx', violations: [vio({ wcagId: '1.1.1', path: 'src/App.tsx' })] }),
    );
    expect(drafts.some(d => d.body.state === 'pass')).toBe(false);
  });
});
