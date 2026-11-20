import { describe, expect, it } from 'vitest';
import { MemoryStore } from '../../db/memory-store.js';
import { handleCheckRun, parseScanReport } from './check-run.js';
import { routeEvent } from '../router.js';
import type { CheckRunEvent } from '../events.js';

const repository = { id: 42, full_name: 'acme/web', private: false, default_branch: 'main' };

function event(overrides: Partial<CheckRunEvent['check_run']> = {}, action = 'completed'): CheckRunEvent {
  return {
    action,
    installation: { id: 100 },
    repository,
    check_run: {
      id: 9001,
      name: 'a11y-fixer',
      head_sha: 'abc123',
      status: 'completed',
      conclusion: 'success',
      completed_at: '2026-01-02T03:04:05Z',
      output: { annotations_count: 3 },
      pull_requests: [{ number: 7 }],
      ...overrides,
    },
  };
}

/** A valid scan contract exactly as the Action's buildScanReport serializes it. */
function scanContract(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    schema: 'a11y-fixer.scan/1',
    sha: 'abc123',
    prNumber: 7,
    mode: 'check',
    conclusion: 'failure',
    counts: { critical: 1, serious: 1, moderate: 0, minor: 0, total: 2 },
    truncated: false,
    violations: [
      { id: 'image-alt', wcagId: '1.1.1', impact: 'critical', description: 'alt', helpUrl: 'h', locations: [{ path: 'src/A.tsx', line: 3 }, { path: 'src/B.tsx', line: 9 }] },
      { id: 'link-name', wcagId: '2.4.4', impact: 'serious', description: 'name', helpUrl: 'h2', locations: [] },
    ],
    ...overrides,
  });
}

describe('parseScanReport', () => {
  it('returns null for absent, non-JSON, or wrong-schema text', () => {
    expect(parseScanReport(undefined)).toBeNull();
    expect(parseScanReport('')).toBeNull();
    expect(parseScanReport('{not json')).toBeNull();
    expect(parseScanReport(JSON.stringify({ schema: 'other/1' }))).toBeNull();
    expect(parseScanReport(JSON.stringify(['array']))).toBeNull();
  });

  it('coerces missing/garbage count fields to zero', () => {
    const r = parseScanReport(JSON.stringify({ schema: 'a11y-fixer.scan/1' }));
    expect(r?.counts).toEqual({ critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 });
    expect(r?.violations).toEqual([]);
    expect(r?.truncated).toBe(false);
  });

  it('drops malformed violations and locations', () => {
    const r = parseScanReport(JSON.stringify({
      schema: 'a11y-fixer.scan/1',
      violations: [
        { id: 'ok', wcagId: 'w', impact: 'minor', description: 'd', helpUrl: 'h', locations: [{ path: 'p', line: 1 }, { path: 'p' }, 'bad'] },
        { id: 'missing-fields' },
      ],
    }));
    expect(r?.violations).toHaveLength(1);
    expect(r?.violations[0].locations).toEqual([{ path: 'p', line: 1 }]);
  });
});

describe('handleCheckRun — scan row (annotation-count fallback)', () => {
  it('persists a completed a11y-fixer run as a scan', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event(), store);
    expect(store.scans.get(9001)).toEqual({
      checkRunId: 9001,
      repoId: 42,
      installationId: 100,
      headSha: 'abc123',
      prNumber: 7,
      conclusion: 'success',
      violationCount: 3,
      createdAt: '2026-01-02T03:04:05Z',
    });
    // No embedded contract → no per-violation detail rows.
    expect(store.violations.has(9001)).toBe(false);
  });

  it('ignores non-completed actions', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event({}, 'created'), store);
    expect(store.scans.size).toBe(0);
  });

  it('ignores Check Runs from other apps (wrong name)', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event({ name: 'codecov' }), store);
    expect(store.scans.size).toBe(0);
  });

  it('ignores a run with no installation id', async () => {
    const store = new MemoryStore();
    const e = event();
    delete (e as { installation?: unknown }).installation;
    await handleCheckRun(e, store);
    expect(store.scans.size).toBe(0);
  });

  it('defaults violation count to 0 and pr number to null when absent', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event({ output: undefined, pull_requests: [] }), store);
    const scan = store.scans.get(9001);
    expect(scan?.violationCount).toBe(0);
    expect(scan?.prNumber).toBe(null);
  });

  it('falls back to an injected now() when completed_at is missing', async () => {
    const store = new MemoryStore();
    const fixed = new Date('2026-05-05T05:05:05Z');
    await handleCheckRun(event({ completed_at: null }), store, () => fixed);
    expect(store.scans.get(9001)?.createdAt).toBe('2026-05-05T05:05:05.000Z');
  });

  it('uses the default real clock when no now() is injected', async () => {
    const store = new MemoryStore();
    const before = Date.now();
    await handleCheckRun(event({ completed_at: null }), store);
    const ts = Date.parse(store.scans.get(9001)!.createdAt);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(Date.now() + 1000);
  });
});

describe('handleCheckRun — embedded scan contract', () => {
  it('uses the exact contract total and writes per-violation detail rows', async () => {
    const store = new MemoryStore();
    // annotations_count (3) is ignored in favor of the contract total (2).
    await handleCheckRun(event({ output: { annotations_count: 3, text: scanContract() } }), store);
    expect(store.scans.get(9001)?.violationCount).toBe(2);
    // 2 locations for image-alt + 1 null-location row for link-name = 3 rows.
    const rows = store.violations.get(9001);
    expect(rows).toHaveLength(3);
    expect(rows).toContainEqual(expect.objectContaining({ ruleId: 'image-alt', path: 'src/A.tsx', line: 3 }));
    expect(rows).toContainEqual(expect.objectContaining({ ruleId: 'link-name', path: null, line: null }));
  });

  it('ignores an unparseable contract and keeps the annotation-count fallback', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event({ output: { annotations_count: 5, text: 'garbage' } }), store);
    expect(store.scans.get(9001)?.violationCount).toBe(5);
    expect(store.violations.has(9001)).toBe(false);
  });

  it('is reachable through routeEvent', async () => {
    const store = new MemoryStore();
    await routeEvent('check_run', event({ output: { text: scanContract() } }), store);
    expect(store.scans.has(9001)).toBe(true);
    expect(store.violations.get(9001)).toHaveLength(3);
  });
});
