import { describe, expect, it } from 'vitest';
import { summarizeActionRuns } from './telemetry.js';
import { MemoryStore } from '../db/memory-store.js';
import type { ActionRunRecord } from '../db/store.js';

function run(partial: Partial<ActionRunRecord>): ActionRunRecord {
  return {
    actionVersion: 'v1',
    mode: 'check',
    licensed: false,
    publicRepo: false,
    violationsBefore: 0,
    violationsAfter: 0,
    fixesApplied: 0,
    fixesReverted: 0,
    regressions: 0,
    usedUrl: false,
    usedHtml: false,
    usedMarkdown: false,
    usedComponents: false,
    platform: 'linux',
    arch: 'x64',
    nodeVersion: 'v20.0.0',
    ...partial,
  };
}

describe('summarizeActionRuns', () => {
  const rows: ActionRunRecord[] = [
    run({ mode: 'fix', licensed: true, fixesApplied: 3, createdAt: '2026-11-20T10:00:00.000Z' }),
    run({ mode: 'check', publicRepo: true, createdAt: '2026-11-20T09:00:00.000Z' }),
    run({ mode: 'check', publicRepo: true, createdAt: '2026-11-19T09:00:00.000Z' }),
  ];

  it('totals, tiers, fixes, and per-mode/day breakdowns', () => {
    const s = summarizeActionRuns(rows, 5000);
    expect(s.total).toBe(3);
    expect(s.capped).toBe(false);
    expect(s.licensedRuns).toBe(1);
    expect(s.publicRuns).toBe(2);
    expect(s.totalFixesApplied).toBe(3);
    expect(s.byMode).toEqual([
      { mode: 'check', count: 2 },
      { mode: 'fix', count: 1 },
    ]);
    expect(s.byDay).toEqual([
      { day: '2026-11-20', count: 2 },
      { day: '2026-11-19', count: 1 },
    ]);
  });

  it('flags capped when rows reach the fetch limit', () => {
    expect(summarizeActionRuns(rows, 3).capped).toBe(true);
  });

  it('buckets rows with no/invalid timestamp as unknown', () => {
    const s = summarizeActionRuns([run({ createdAt: null }), run({ createdAt: 'nope' })], 10);
    expect(s.byDay).toEqual([{ day: 'unknown', count: 2 }]);
  });

  it('bounds the recent slice', () => {
    const many = Array.from({ length: 80 }, () => run({}));
    expect(summarizeActionRuns(many, 5000).recent).toHaveLength(50);
  });
});

describe('MemoryStore action-run reads', () => {
  it('returns recent runs newest-first, capped by limit', async () => {
    const store = new MemoryStore();
    await store.recordActionRun(run({ mode: 'check' }));
    await store.recordActionRun(run({ mode: 'scan' }));
    await store.recordActionRun(run({ mode: 'fix' }));
    const recent = await store.listRecentActionRuns(2);
    expect(recent.map(r => r.mode)).toEqual(['fix', 'scan']);
    expect(recent[0].createdAt).toBeTruthy();
  });

  it('getUser returns the record or null', async () => {
    const store = new MemoryStore();
    await store.upsertUser({ userId: 'u1', githubLogin: 'alice', githubUserId: 7 });
    expect((await store.getUser('u1'))?.githubLogin).toBe('alice');
    expect(await store.getUser('nope')).toBeNull();
  });
});
