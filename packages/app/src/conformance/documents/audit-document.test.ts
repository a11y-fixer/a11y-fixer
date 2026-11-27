import { describe, it, expect, beforeEach } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import type { SuccessCriterion } from '@a11y-fixer/core';
import { MemoryStore } from '../../db/memory-store.js';
import { RevisionVersionConflictError } from '../../db/store.js';
import { createDraftAudit, publishAudit, type AuditDeps } from '../audit-service.js';
import { auditSubjectKey, type PublicKeyring } from '../claim.js';
import { verifyAuditWarranty } from '../warranty.js';
import type { ReconciledCriterion } from '../reconcile.js';
import type { DocumentContext, WarrantySigning } from './audit-document.js';
import {
  buildAuditDocument,
  buildDocumentFromRevision,
  createRevisionForAudit,
  documentFilename,
  type RevisionDeps,
} from './audit-document.js';

const kp = generateKeyPairSync('ed25519');
const SIGNING: WarrantySigning = {
  signingKeyPem: kp.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  keyId: 'conformance-2026',
};
const RING: PublicKeyring = {
  'conformance-2026': kp.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
};

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

  it('builds the roadmap and letter kinds too', async () => {
    const roadmap = await buildAuditDocument(store, CATALOG, { installationId: 1, auditId, kind: 'roadmap' });
    expect(roadmap!.kind).toBe('roadmap');
    const letter = await buildAuditDocument(store, CATALOG, { installationId: 1, auditId, kind: 'letter' });
    expect(letter!.kind).toBe('letter');
  });
});

describe('revisions (immutable published snapshots)', () => {
  let store: MemoryStore;
  const revDeps: RevisionDeps = {
    now: () => '2026-03-05T00:00:00Z',
    newId: (() => { let n = 0; return () => `rev-${++n}`; })(),
    newSlug: (() => { let n = 0; return () => `slug-${++n}`; })(),
  };

  async function publishedAudit(repoId: number, headSha: string): Promise<string> {
    const audit = await createDraftAudit(store, CATALOG, { repoId, installationId: 1, headSha, checkRunId: 500 }, deps);
    // A human reviewer confirms both criteria so the honesty gate passes.
    for (const c of CATALOG) {
      await store.upsertVerdict({
        id: `v-${repoId}-${c.id}`, auditId: audit.id, wcagId: c.id, source: 'human',
        verdict: 'supports', remarks: '', evidence: null, authorId: 'user-1', updatedAt: 't',
      });
    }
    await publishAudit(store, CATALOG, audit.id, deps);
    await createRevisionForAudit(store, CATALOG, audit.id, revDeps);
    return audit.id;
  }

  beforeEach(async () => {
    store = new MemoryStore();
    await store.upsertInstallation({ installationId: 1, account: 'acme', accountId: 99, suspendedAt: null });
    await store.upsertRepos(1, [
      { repoId: 10, installationId: 1, fullName: 'acme/widget', isPrivate: false, defaultBranch: 'main', selected: true },
    ]);
  });

  it('freezes a revision on publish with a slug, snapshot, and version 1', async () => {
    const auditId = await publishedAudit(10, 'abc1234def');
    const rev = await store.getRevisionByAudit(auditId);
    expect(rev).not.toBeNull();
    expect(rev!.version).toBe(1);
    expect(rev!.publicSlug).toMatch(/^slug-\d+$/);
    expect(await store.getRevisionBySlug(rev!.publicSlug)).toMatchObject({ auditId });
  });

  it('is idempotent: a second create returns the existing revision, never a duplicate', async () => {
    const auditId = await publishedAudit(10, 'abc1234def');
    const first = await store.getRevisionByAudit(auditId);
    const again = await createRevisionForAudit(store, CATALOG, auditId, revDeps);
    expect(again!.publicSlug).toBe(first!.publicSlug);
    expect(await store.listRevisionsByRepo(10)).toHaveLength(1);
  });

  it('increments version per repo across published audits, newest first', async () => {
    await publishedAudit(10, 'sha-one');
    await publishedAudit(10, 'sha-two');
    const history = await store.listRevisionsByRepo(10);
    expect(history.map(r => r.version)).toEqual([2, 1]);
  });

  it('serves the frozen snapshot for a published audit, immune to later catalog drift', async () => {
    const auditId = await publishedAudit(10, 'abc1234def');
    // A later deploy adds a new WCAG criterion to the catalog.
    const grownCatalog = [...CATALOG, sc('4.1.2', 'A')];
    const doc = await buildAuditDocument(store, grownCatalog, { installationId: 1, auditId, kind: 'acr' });
    // The published ACR still reflects only the two criteria frozen at publish.
    const acr = doc as { tables: { rows: { wcagId: string }[] }[]; meta: { published: boolean } };
    const allRows = acr.tables.flatMap(t => t.rows.map(r => r.wcagId));
    expect(allRows).not.toContain('4.1.2');
    expect(acr.meta.published).toBe(true);
  });

  it('rebuilds any kind from a revision snapshot', async () => {
    const auditId = await publishedAudit(10, 'abc1234def');
    const rev = await store.getRevisionByAudit(auditId);
    expect(buildDocumentFromRevision(rev!, 'statement').kind).toBe('statement');
    expect(buildDocumentFromRevision(rev!, 'letter').kind).toBe('letter');
  });

  it('without signing config, freezes a revision with no backing claims', async () => {
    const auditId = await publishedAudit(10, 'abc1234def');
    const rev = await store.getRevisionByAudit(auditId);
    expect((rev!.snapshot as DocumentContext).backingClaims).toBeUndefined();
    expect(await store.listClaims(auditSubjectKey(10))).toHaveLength(0);
  });

  describe('warranty link (signed backing claims)', () => {
    async function publishSigned(repoId: number, headSha: string): Promise<string> {
      const audit = await createDraftAudit(store, CATALOG, { repoId, installationId: 1, headSha, checkRunId: 500 }, deps);
      // One supports, one does_not_support — both human-reviewed, so both warrantable.
      await store.upsertVerdict({ id: `v-${repoId}-a`, auditId: audit.id, wcagId: '1.1.1', source: 'human', verdict: 'supports', remarks: '', evidence: null, authorId: 'u1', updatedAt: 't' });
      await store.upsertVerdict({ id: `v-${repoId}-b`, auditId: audit.id, wcagId: '1.4.3', source: 'human', verdict: 'does_not_support', remarks: '', evidence: null, authorId: 'u1', updatedAt: 't' });
      await publishAudit(store, CATALOG, audit.id, deps);
      await createRevisionForAudit(store, CATALOG, audit.id, revDeps, SIGNING);
      return audit.id;
    }

    it('freezes backing claim ids into the snapshot and signs them into the ledger', async () => {
      const auditId = await publishSigned(10, 'abc1234def');
      const rev = await store.getRevisionByAudit(auditId);
      const backing = (rev!.snapshot as DocumentContext).backingClaims;
      expect(backing!.subjectKey).toBe(auditSubjectKey(10));
      expect(backing!.claimIds).toHaveLength(2);
      const onChain = await store.listClaims(auditSubjectKey(10));
      expect(onChain.map(c => c.id).sort()).toEqual([...backing!.claimIds].sort());
    });

    it('end-to-end: the frozen revision verifies against the signed ledger', async () => {
      const auditId = await publishSigned(10, 'abc1234def');
      const rev = await store.getRevisionByAudit(auditId);
      const snap = rev!.snapshot as DocumentContext;
      const verdict = await verifyAuditWarranty(
        store,
        snap.backingClaims ?? null,
        snap.reconciled as ReconciledCriterion[],
        RING,
      );
      expect(verdict).toEqual({ ok: true, backed: true, claims: 2 });
    });

    it('writes the backing claims once: a re-publish is idempotent (no duplicate chain growth)', async () => {
      const auditId = await publishSigned(10, 'abc1234def');
      await createRevisionForAudit(store, CATALOG, auditId, revDeps, SIGNING);
      expect(await store.listClaims(auditSubjectKey(10))).toHaveLength(2);
    });
  });

  it('retries on a version collision and still freezes a revision', async () => {
    // Set up a published audit WITHOUT its revision yet.
    const audit = await createDraftAudit(store, CATALOG, { repoId: 30, installationId: 1, headSha: 'sha-x', checkRunId: 500 }, deps);
    for (const c of CATALOG) {
      await store.upsertVerdict({ id: `v-${c.id}`, auditId: audit.id, wcagId: c.id, source: 'human', verdict: 'supports', remarks: '', evidence: null, authorId: 'u1', updatedAt: 't' });
    }
    await publishAudit(store, CATALOG, audit.id, deps);

    // Make the first insert collide on (repo_id, version), as a concurrent
    // same-repo publish would; the second attempt must recompute and succeed.
    let calls = 0;
    const realInsert = store.insertRevision.bind(store);
    store.insertRevision = async rec => {
      calls++;
      if (calls === 1) throw new RevisionVersionConflictError(rec.repoId, rec.version);
      return realInsert(rec);
    };

    const rev = await createRevisionForAudit(store, CATALOG, audit.id, revDeps);
    expect(rev).not.toBeNull();
    expect(calls).toBeGreaterThanOrEqual(2);
    expect(await store.getRevisionByAudit(audit.id)).toMatchObject({ auditId: audit.id });
  });
});
