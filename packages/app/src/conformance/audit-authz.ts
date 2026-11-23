// Small pure helpers shared by the audit pages and routes.
import type { AuditRecord, ScanRecord } from '../db/store.js';

/**
 * The most recent scan per repo (by `createdAt`), used to seed a new audit from
 * a repo's latest Check Run.
 */
export function latestScanByRepo(scans: readonly ScanRecord[]): Map<number, ScanRecord> {
  const latest = new Map<number, ScanRecord>();
  for (const s of scans) {
    const cur = latest.get(s.repoId);
    if (!cur || s.createdAt > cur.createdAt) latest.set(s.repoId, s);
  }
  return latest;
}

/**
 * Narrowing guard: the audit exists and belongs to the installation. Routes call
 * this after loading an audit by id so a crafted audit id from another
 * installation is treated as not-found.
 */
export function auditBelongsTo(
  audit: AuditRecord | null,
  installationId: number,
): audit is AuditRecord {
  return audit !== null && audit.installationId === installationId;
}
