import { describe, it, expect, beforeEach } from 'vitest';
import type { SuccessCriterion } from '@a11y-fixer/core';
import { MemoryStore } from '../../db/memory-store.js';
import { createDraftAudit, type AuditDeps } from '../audit-service.js';
import { buildAuditDocument, documentFilename } from './audit-document.js';

function sc(id: string, level: SuccessCriterion['level']): SuccessCriterion {
  return {
    id,
    title: `Criterion ${id}`,
    level,
    wcagVersion: '2.0',
    understandingUrl: `https://example.test/${id}`,
    en301549Clause: `9.${id}`,
    coveringRuleIds: ['rule'],
    hasAutomatedCoverage: true,
  };
}

const CATALOG = [sc('1.1.1', 'A'), sc('1.4.3', 'AA')];
const deps: AuditDeps = { now: () => '2026-03-04T00:00:00Z', newId: (() => { let n = 0; return () => `id-${++n}`; })() };

describe('buildAuditDocument', () => {
  let store: MemoryStore;
  let auditId: string;

  beforeEach(async () => {
    store = new MemoryStore();
    await store.upsertInstallation({ installationId: 1, account: 'acme', accountId: 99, suspendedAt: null });
    await store.upsertRepos(1, [
      { repoId: 10, installationId: 1, fullName: 'acme/widget', isPrivate: false, defaultBranch: 'main', selected: true },
    ]);
    const audit = await createDraftAudit(store, CATALOG, { repoId: 10, installationId: 1, headSha: 'abc1234def', checkRunId: 500 }, deps);
    auditId = audit.id;
  });

  it('builds an ACR with meta sourced from the installation and repo', async () => {
    const doc = await buildAuditDocument(store, CATALOG, { installationId: 1, auditId, kind: 'acr' });
    expect(doc).not.toBeNull();
    expect(doc!.kind).toBe('acr');
    expect(doc!.meta.productName).toBe('acme/widget');
    expect(doc!.meta.vendor).toBe('acme');
    expect(doc!.meta.headSha).toBe('abc1234def');
    expect(doc!.meta.published).toBe(false); // draft
    expect(doc!.meta.date).toBe('2026-03-04'); // from createdAt
  });

  it('builds a statement with the vendor GitHub URL as the feedback contact', async () => {
    const doc = await buildAuditDocument(store, CATALOG, { installationId: 1, auditId, kind: 'statement' });
    expect(doc!.kind).toBe('statement');
    const feedback = (doc as { sections: { heading: string; items?: string[] }[] }).sections.find(s => s.heading === 'Feedback');
    expect(feedback!.items).toContain('https://github.com/acme');
  });

  it('returns null when the audit belongs to a different installation', async () => {
    expect(await buildAuditDocument(store, CATALOG, { installationId: 2, auditId, kind: 'acr' })).toBeNull();
  });

  it('returns null for an unknown audit', async () => {
    expect(await buildAuditDocument(store, CATALOG, { installationId: 1, auditId: 'nope', kind: 'acr' })).toBeNull();
  });

  it('builds a safe, descriptive download filename', async () => {
    const doc = await buildAuditDocument(store, CATALOG, { installationId: 1, auditId, kind: 'acr' });
    expect(documentFilename(doc!, 'pdf')).toBe('acr-acme-widget-abc1234.pdf');
  });
});
