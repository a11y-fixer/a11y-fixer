import { describe, expect, it } from 'vitest';
import { MemoryStore } from '../../db/memory-store.js';
import { handleCheckRun, parseScanReport } from './check-run.js';
import { routeEvent } from '../router.js';
import type { CheckRunEvent } from '../events.js';

/** A valid scan contract exactly as the Action's buildScanReport serializes it. */
function scanContract(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    schema: 'a11y-fixer.scan/1',
    sha: 'headsha',
    prNumber: 42,
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

function event(overrides: Partial<CheckRunEvent> = {}, runOverrides: Record<string, unknown> = {}): CheckRunEvent {
  return {
    action: 'completed',
    check_run: {
      id: 777,
      name: 'a11y-fixer',
      head_sha: 'headsha',
      conclusion: 'failure',
      output: { title: 't', summary: 's', text: scanContract() },
      pull_requests: [{ number: 42 }],
      ...runOverrides,
    },
    repository: { id: 5, full_name: 'acme/web', private: true },
    installation: { id: 100 },
    ...overrides,
  };
}

describe('parseScanReport', () => {
  it('returns null for absent, non-JSON, or wrong-schema text', () => {
    expect(parseScanReport(undefined)).toBeNull();
    expect(parseScanReport('')).toBeNull();
    expect(parseScanReport('{not json')).toBeNull();
    expect(parseScanReport(JSON.stringify({ schema: 'other/1' }))).toBeNull();
    expect(parseScanReport(JSON.stringify(['array']))).toBeNull();
  });

  it('coerces missing/garbage fields to safe defaults', () => {
    const r = parseScanReport(JSON.stringify({ schema: 'a11y-fixer.scan/1' }));
    expect(r).toMatchObject({ sha: '', prNumber: null, mode: 'check', conclusion: '', truncated: false });
    expect(r?.counts).toEqual({ critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 });
    expect(r?.violations).toEqual([]);
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

describe('handleCheckRun', () => {
  it('ingests a completed scan into scan + violation rows', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event(), store);
    const entry = store.scans.get(777);
    expect(entry?.scan).toMatchObject({
      scanId: 777, installationId: 100, repoId: 5, fullName: 'acme/web',
      sha: 'headsha', prNumber: 42, mode: 'check', conclusion: 'failure',
      critical: 1, serious: 1, total: 2, truncated: false,
    });
    // 2 locations for image-alt + 1 null-location row for link-name = 3 rows.
    expect(entry?.violations).toHaveLength(3);
    expect(entry?.violations).toContainEqual(expect.objectContaining({ ruleId: 'image-alt', path: 'src/A.tsx', line: 3 }));
    expect(entry?.violations).toContainEqual(expect.objectContaining({ ruleId: 'link-name', path: null, line: null }));
  });

  it('falls back to head_sha and the first PR number when the contract omits them', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event({}, { output: { text: scanContract({ sha: '', prNumber: null }) } }), store);
    expect(store.scans.get(777)?.scan).toMatchObject({ sha: 'headsha', prNumber: 42 });
  });

  it('records a null installation id when the delivery carries none', async () => {
    const store = new MemoryStore();
    const e = event();
    delete (e as { installation?: unknown }).installation;
    await handleCheckRun(e, store);
    expect(store.scans.get(777)?.scan.installationId).toBeNull();
  });

  it('ignores non-completed actions', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event({ action: 'created' }), store);
    expect(store.scans.size).toBe(0);
  });

  it("ignores another app's check run", async () => {
    const store = new MemoryStore();
    await handleCheckRun(event({}, { name: 'other-tool' }), store);
    expect(store.scans.size).toBe(0);
  });

  it('acks and skips a run with no / unparseable contract', async () => {
    const store = new MemoryStore();
    await handleCheckRun(event({}, { output: { text: null } }), store);
    await handleCheckRun(event({}, { output: undefined }), store);
    await handleCheckRun(event({}, { output: { text: 'garbage' } }), store);
    expect(store.scans.size).toBe(0);
  });

  it('is reachable through routeEvent', async () => {
    const store = new MemoryStore();
    await routeEvent('check_run', event(), store);
    expect(store.scans.has(777)).toBe(true);
  });
});
