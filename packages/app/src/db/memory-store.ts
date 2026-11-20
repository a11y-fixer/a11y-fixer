// In-memory Store for unit tests and local development. Not for production.
import type { InstallationRecord, RepoRecord, ScanRecord, Store } from './store.js';

export class MemoryStore implements Store {
  readonly deliveries = new Set<string>();
  readonly installations = new Map<number, InstallationRecord>();
  readonly repos = new Map<number, RepoRecord>();
  readonly scans = new Map<number, ScanRecord>();

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

  async listRepos(installationId: number): Promise<RepoRecord[]> {
    return [...this.repos.values()].filter(repo => repo.installationId === installationId);
  }

  async listScansByInstallation(installationId: number): Promise<ScanRecord[]> {
    return [...this.scans.values()].filter(scan => scan.installationId === installationId);
  }
}
