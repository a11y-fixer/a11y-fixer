import { describe, it, expect, beforeEach } from 'vitest';
import type { SuccessCriterion } from '@a11y-fixer/core';
import type { ViolationRecord } from '../db/store.js';
import { MemoryStore } from '../db/memory-store.js';
import {
  createDraftAudit,
  recordHumanVerdict,
  loadAuditView,
  publishAudit,
  type AuditDeps,
} from './audit-service.js';

function sc(id: string, hasAutomatedCoverage: boolean): SuccessCriterion {
  return {
    id,
    title: `Criterion ${id}`,
    level: 'A',
    wcagVersion: '2.0',
    understandingUrl: `https://example.test/${id}`,
    en301549Clause: `9.${id}`,
    coveringRuleIds: hasAutomatedCoverage ? ['rule'] : [],
    hasAutomatedCoverage,
  };
}

// 1.1.1 covered, 1.4.3 covered, 1.2.1 manual-only.
const CATALOG = [sc('1.1.1', true), sc('1.4.3', true), sc('1.2.1', false)];

function deterministicDeps(): AuditDeps {
  let n = 0;
  return { now: () => '2026-01-01T00:00:00Z', newId: () => `id-${++n}` };
}

function violation(wcagId: string): ViolationRecord {
  return {
    ruleId: 'rule',
    wcagId,
    impact: 'serious',
    description: 'fail',
    helpUrl: 'https://help',
    path: 'src/App.tsx',
    line: 1,
  };
}

describe('createDraftAudit', () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = new MemoryStore();
  });

  it('derives and persists one machine verdict per criterion from the scan', async () => {
    await store.replaceViolations(500, [violation('1.4.3')]);
    const audit = await createDraftAudit(
      store,
      CATALOG,
      { repoId: 10, installationId: 1, headSha: 'abc', checkRunId: 500 },
      deterministicDeps(),
    );

    expect(audit.status).toBe('draft');
    expect(audit.basisCheckRunId).toBe(500);

    const verdicts = await store.listVerdicts(audit.id);
    expect(verdicts).toHaveLength(3);
    expect(verdicts.every(v => v.source === 'machine')).toBe(true);
    const byId = Object.fromEntries(verdicts.map(v => [v.wcagId, v.verdict]));
    expect(byId).toEqual({
      '1.1.1': 'supports', // covered, no violations
      '1.4.3': 'partially_supports', // covered, has a violation
      '1.2.1': 'not_evaluated', // no automated coverage
    });
  });

  it('works when the scan has no recorded violations', async () => {
    const audit = await createDraftAudit(
      store,
      CATALOG,
      { repoId: 10, installationId: 1, headSha: 'abc', checkRunId: 404 },
      deterministicDeps(),
    );
    const verdicts = await store.listVerdicts(audit.id);
    expect(verdicts.find(v => v.wcagId === '1.4.3')?.verdict).toBe('supports');
  });
});

describe('recordHumanVerdict', () => {
  it('adds a human verdict and advances a draft to in_review', async () => {
    const store = new MemoryStore();
    await store.replaceViolations(500, [violation('1.4.3')]);
    const audit = await createDraftAudit(
      store,
      CATALOG,
      { repoId: 10, installationId: 1, headSha: 'abc', checkRunId: 500 },
      deterministicDeps(),
    );

    await recordHumanVerdict(
      store,
      { auditId: audit.id, wcagId: '1.4.3', verdict: 'supports', remarks: 'fixed', authorId: 'u1' },
      deterministicDeps(),
    );

    expect((await store.getAudit(audit.id))?.status).toBe('in_review');
    const verdicts = await store.listVerdicts(audit.id);
    // machine + human for 1.4.3, machine for the others.
    expect(verdicts.filter(v => v.wcagId === '1.4.3')).toHaveLength(2);
    const human = verdicts.find(v => v.wcagId === '1.4.3' && v.source === 'human');
    expect(human?.authorId).toBe('u1');
  });

  it('replaces an existing human verdict rather than duplicating it', async () => {
    const store = new MemoryStore();
    const audit = await createDraftAudit(
      store,
      CATALOG,
      { repoId: 10, installationId: 1, headSha: 'abc', checkRunId: 500 },
      deterministicDeps(),
    );
    const deps = deterministicDeps();
    await recordHumanVerdict(store, { auditId: audit.id, wcagId: '1.1.1', verdict: 'supports', remarks: 'v1', authorId: 'u1' }, deps);
    await recordHumanVerdict(store, { auditId: audit.id, wcagId: '1.1.1', verdict: 'partially_supports', remarks: 'v2', authorId: 'u1' }, deps);
    const human = (await store.listVerdicts(audit.id)).filter(v => v.wcagId === '1.1.1' && v.source === 'human');
    expect(human).toHaveLength(1);
    expect(human[0].verdict).toBe('partially_supports');
    expect(human[0].remarks).toBe('v2');
  });

  it('throws for an unknown audit', async () => {
    const store = new MemoryStore();
    await expect(
      recordHumanVerdict(store, { auditId: 'nope', wcagId: '1.1.1', verdict: 'supports', remarks: '', authorId: 'u1' }, deterministicDeps()),
    ).rejects.toThrow(/not found/);
  });
});

describe('loadAuditView', () => {
  it('returns the reconciled view and publish-readiness', async () => {
    const store = new MemoryStore();
    // 1.4.3 has a violation → machine partially_supports (not a blocker); 1.1.1
    // is clean → machine supports, the sole publish blocker.
    await store.replaceViolations(500, [violation('1.4.3')]);
    const audit = await createDraftAudit(
      store,
      CATALOG,
      { repoId: 10, installationId: 1, headSha: 'abc', checkRunId: 500 },
      deterministicDeps(),
    );
    const view = await loadAuditView(store, CATALOG, audit.id);
    expect(view).not.toBeNull();
    expect(view!.reconciled).toHaveLength(3);
    // 1.1.1 is machine supports → blocks publish until human-confirmed.
    expect(view!.canPublish).toBe(false);
    expect(view!.blockers.map(b => b.wcagId)).toEqual(['1.1.1']);
  });

  it('returns null for an unknown audit', async () => {
    const store = new MemoryStore();
    expect(await loadAuditView(store, CATALOG, 'nope')).toBeNull();
  });
});

describe('publishAudit', () => {
  let store: MemoryStore;
  let audit: { id: string };
  beforeEach(async () => {
    store = new MemoryStore();
    // 1.4.3 has a violation → machine partially_supports; 1.1.1 is the only
    // machine-supports claim, so it is the sole publish blocker.
    await store.replaceViolations(500, [violation('1.4.3')]);
    audit = await createDraftAudit(
      store,
      CATALOG,
      { repoId: 10, installationId: 1, headSha: 'abc', checkRunId: 500 },
      deterministicDeps(),
    );
  });

  it('refuses to publish while a machine-only supports claim remains', async () => {
    const result = await publishAudit(store, CATALOG, audit.id, deterministicDeps());
    expect(result.published).toBe(false);
    expect(result.blockers).toContain('1.1.1');
    expect((await store.getAudit(audit.id))?.status).not.toBe('published');
  });

  it('publishes once every machine-only supports is human-confirmed', async () => {
    // 1.1.1 is the only machine supports (1.4.3 is partial, 1.2.1 not_evaluated).
    await recordHumanVerdict(
      store,
      { auditId: audit.id, wcagId: '1.1.1', verdict: 'supports', remarks: 'confirmed', authorId: 'u1' },
      deterministicDeps(),
    );
    const result = await publishAudit(store, CATALOG, audit.id, deterministicDeps());
    expect(result.published).toBe(true);
    const published = await store.getAudit(audit.id);
    expect(published?.status).toBe('published');
    expect(published?.publishedAt).toBe('2026-01-01T00:00:00Z');
  });

  it('throws for an unknown audit', async () => {
    await expect(publishAudit(store, CATALOG, 'nope', deterministicDeps())).rejects.toThrow(/not found/);
  });
});
