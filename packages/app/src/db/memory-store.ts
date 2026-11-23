// In-memory Store for unit tests and local development. Not for production.
import { RevisionVersionConflictError } from './store.js';
import type {
  ActionRunRecord,
  AuditRecord,
  AuditRevisionRecord,
  AuditStatus,
  CriterionVerdictRecord,
  EvidenceBlobRecord,
  InstallationRecord,
  LicenseRecord,
  RepoRecord,
  ScanRecord,
  SignedClaimRecord,
  Store,
  SubscriptionRecord,
  UserRecord,
  ViolationRecord,
} from './store.js';

export class MemoryStore implements Store {
  readonly deliveries = new Set<string>();
  readonly installations = new Map<number, InstallationRecord>();
  readonly repos = new Map<number, RepoRecord>();
  readonly scans = new Map<number, ScanRecord>();
  readonly violations = new Map<number, ViolationRecord[]>();
  readonly subscriptions = new Map<number, SubscriptionRecord>();
  readonly licenses = new Map<number, LicenseRecord>();
  readonly users = new Map<string, UserRecord>();
  readonly userInstallations = new Map<string, Set<number>>();
  readonly audits = new Map<string, AuditRecord>();
  /** Verdicts keyed by audit id. */
  readonly verdicts = new Map<string, CriterionVerdictRecord[]>();
  /** Published revisions keyed by revision id. */
  readonly revisions = new Map<string, AuditRevisionRecord>();
  /** Anonymous Action usage events, in arrival order. */
  readonly actionRuns: ActionRunRecord[] = [];
  /** Conformance ledger. Claims kept in append order; evidence keyed by hash. */
  readonly evidence = new Map<string, EvidenceBlobRecord>();
  readonly claims: SignedClaimRecord[] = [];
  private readonly claimIds = new Set<string>();
  readonly subjectHeads = new Map<string, string>();

  async recordEventOnce(deliveryId: string): Promise<boolean> {
    if (this.deliveries.has(deliveryId)) return false;
    this.deliveries.add(deliveryId);
    return true;
  }

  async recordActionRun(event: ActionRunRecord): Promise<void> {
    // The DB assigns created_at on insert; mirror that here so reads have a
    // time axis, without requiring the write path to provide one.
    this.actionRuns.push({ createdAt: new Date().toISOString(), ...event });
  }

  async listRecentActionRuns(limit: number): Promise<ActionRunRecord[]> {
    return this.actionRuns
      .slice()
      .reverse()
      .slice(0, limit)
      .map(run => ({ ...run }));
  }

  async upsertInstallation(record: InstallationRecord): Promise<void> {
    this.installations.set(record.installationId, { ...record });
  }

  async removeInstallation(installationId: number): Promise<void> {
    this.installations.delete(installationId);
    for (const [id, repo] of this.repos) {
      if (repo.installationId === installationId) this.repos.delete(id);
    }
  }

  async setInstallationSuspended(installationId: number, suspendedAt: string | null): Promise<void> {
    const existing = this.installations.get(installationId);
    if (existing) existing.suspendedAt = suspendedAt;
  }

  async getInstallation(installationId: number): Promise<InstallationRecord | null> {
    const existing = this.installations.get(installationId);
    return existing ? { ...existing } : null;
  }

  async upsertRepos(_installationId: number, repos: RepoRecord[]): Promise<void> {
    for (const repo of repos) this.repos.set(repo.repoId, { ...repo });
  }

  async removeRepos(installationId: number, repoIds: number[]): Promise<void> {
    for (const id of repoIds) {
      const repo = this.repos.get(id);
      if (repo && repo.installationId === installationId) this.repos.delete(id);
    }
  }

  async upsertScan(record: ScanRecord): Promise<void> {
    this.scans.set(record.checkRunId, { ...record });
  }

  async replaceViolations(checkRunId: number, violations: ViolationRecord[]): Promise<void> {
    this.violations.set(checkRunId, violations.map(v => ({ ...v })));
  }

  async listRepos(installationId: number): Promise<RepoRecord[]> {
    return [...this.repos.values()].filter(repo => repo.installationId === installationId);
  }

  async listScansByInstallation(installationId: number): Promise<ScanRecord[]> {
    return [...this.scans.values()].filter(scan => scan.installationId === installationId);
  }

  async listViolationsByScan(checkRunId: number): Promise<ViolationRecord[]> {
    return (this.violations.get(checkRunId) ?? []).map(v => ({ ...v }));
  }

  async upsertAudit(record: AuditRecord): Promise<void> {
    this.audits.set(record.id, { ...record });
  }

  async getAudit(auditId: string): Promise<AuditRecord | null> {
    const existing = this.audits.get(auditId);
    return existing ? { ...existing } : null;
  }

  async listAuditsByInstallation(installationId: number): Promise<AuditRecord[]> {
    return [...this.audits.values()]
      .filter(a => a.installationId === installationId)
      .map(a => ({ ...a }));
  }

  async setAuditStatus(auditId: string, status: AuditStatus, publishedAt: string | null): Promise<void> {
    const existing = this.audits.get(auditId);
    if (existing) {
      existing.status = status;
      existing.publishedAt = publishedAt;
    }
  }

  async upsertVerdict(record: CriterionVerdictRecord): Promise<void> {
    const list = this.verdicts.get(record.auditId) ?? [];
    // Conflict key is (audit_id, wcag_id, source): replace a matching row.
    const idx = list.findIndex(v => v.wcagId === record.wcagId && v.source === record.source);
    if (idx >= 0) list[idx] = { ...record };
    else list.push({ ...record });
    this.verdicts.set(record.auditId, list);
  }

  async listVerdicts(auditId: string): Promise<CriterionVerdictRecord[]> {
    return (this.verdicts.get(auditId) ?? []).map(v => ({ ...v }));
  }

  async insertRevision(record: AuditRevisionRecord): Promise<void> {
    // Idempotent on auditId: a published revision is immutable, never overwritten.
    for (const r of this.revisions.values()) {
      if (r.auditId === record.auditId) return;
    }
    // Model the schema's unique(repo_id, version): two audits in the same repo
    // minting the same next version collide, as the real Supabase store would.
    for (const r of this.revisions.values()) {
      if (r.repoId === record.repoId && r.version === record.version) {
        throw new RevisionVersionConflictError(record.repoId, record.version);
      }
    }
    this.revisions.set(record.id, { ...record });
  }

  async getRevisionByAudit(auditId: string): Promise<AuditRevisionRecord | null> {
    for (const r of this.revisions.values()) {
      if (r.auditId === auditId) return { ...r };
    }
    return null;
  }

  async getRevisionBySlug(publicSlug: string): Promise<AuditRevisionRecord | null> {
    for (const r of this.revisions.values()) {
      if (r.publicSlug === publicSlug) return { ...r };
    }
    return null;
  }

  async listRevisionsByRepo(repoId: number): Promise<AuditRevisionRecord[]> {
    return [...this.revisions.values()]
      .filter(r => r.repoId === repoId)
      .sort((a, b) => b.version - a.version)
      .map(r => ({ ...r }));
  }

  async upsertSubscription(record: SubscriptionRecord): Promise<void> {
    this.subscriptions.set(record.accountId, { ...record });
  }

  async cancelSubscription(accountId: number, cancelledAt: string): Promise<void> {
    const existing = this.subscriptions.get(accountId);
    if (existing) existing.cancelledAt = cancelledAt;
  }

  async getLicense(installationId: number): Promise<LicenseRecord | null> {
    const existing = this.licenses.get(installationId);
    return existing ? { ...existing } : null;
  }

  async upsertLicense(record: LicenseRecord): Promise<void> {
    this.licenses.set(record.installationId, { ...record });
  }

  async upsertUser(record: UserRecord): Promise<void> {
    this.users.set(record.userId, { ...record });
  }

  async getUser(userId: string): Promise<UserRecord | null> {
    const existing = this.users.get(userId);
    return existing ? { ...existing } : null;
  }

  async linkUserInstallation(userId: string, installationId: number): Promise<void> {
    const set = this.userInstallations.get(userId) ?? new Set<number>();
    set.add(installationId);
    this.userInstallations.set(userId, set);
  }

  async listInstallationsForUser(userId: string): Promise<number[]> {
    return [...(this.userInstallations.get(userId) ?? [])];
  }

  async putEvidence(record: EvidenceBlobRecord): Promise<void> {
    if (this.evidence.has(record.hash)) return; // content-addressed: a repeat is a no-op
    this.evidence.set(record.hash, { ...record });
  }

  async getEvidence(hash: string): Promise<EvidenceBlobRecord | null> {
    const e = this.evidence.get(hash);
    return e ? { ...e } : null;
  }

  async getSubjectHead(subjectKey: string): Promise<string | null> {
    return this.subjectHeads.get(subjectKey) ?? null;
  }

  async appendClaims(claims: SignedClaimRecord[]): Promise<void> {
    for (const claim of claims) {
      if (this.claimIds.has(claim.id)) continue; // idempotent by id; append-only
      this.claims.push({ ...claim });
      this.claimIds.add(claim.id);
      this.subjectHeads.set(claim.subjectKey, claim.id); // advance to the last appended
    }
  }

  async listClaims(subjectKey: string): Promise<SignedClaimRecord[]> {
    return this.claims.filter(c => c.subjectKey === subjectKey).map(c => ({ ...c }));
  }
}
