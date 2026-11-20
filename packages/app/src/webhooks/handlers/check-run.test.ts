import { describe, expect, it } from 'vitest';
import { MemoryStore } from '../../db/memory-store.js';
import { handleCheckRun } from './check-run.js';
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

describe('handleCheckRun', () => {
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
