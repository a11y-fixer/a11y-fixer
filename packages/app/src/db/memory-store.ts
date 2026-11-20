// In-memory Store for unit tests and local development. Not for production.
import type { InstallationRecord, RepoRecord, ScanRecord, Store, UserRecord, ViolationRecord } from './store.js';

export class MemoryStore implements Store {
  readonly deliveries = new Set<string>();
  readonly installations = new Map<number, InstallationRecord>();
  readonly repos = new Map<number, RepoRecord>();
  readonly scans = new Map<number, ScanRecord>();
  readonly violations = new Map<number, ViolationRecord[]>();
  readonly users = new Map<string, UserRecord>();
  readonly userInstallations = new Map<string, Set<number>>();

  async recordEventOnce(deliveryId: string): Promise<boolean> {
    if (this.deliveries.has(deliveryId)) return false;
    this.deliveries.add(deliveryId);
    return true;
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

  async upsertUser(record: UserRecord): Promise<void> {
    this.users.set(record.userId, { ...record });
  }

  async linkUserInstallation(userId: string, installationId: number): Promise<void> {
    const set = this.userInstallations.get(userId) ?? new Set<number>();
    set.add(installationId);
    this.userInstallations.set(userId, set);
  }

  async listInstallationsForUser(userId: string): Promise<number[]> {
    return [...(this.userInstallations.get(userId) ?? [])];
  }
}
