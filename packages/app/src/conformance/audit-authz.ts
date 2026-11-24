// Small pure helpers shared by the audit pages and routes.
import type { AuditRecord, AuditRevisionRecord, ScanRecord } from '../db/store.js';

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

/** A published revision scoped to one installation, with its display number. */
export interface ScopedRevision {
  revision: AuditRevisionRecord;
  /** 1-based number within THIS installation's revisions (newest = highest). */
  displayVersion: number;
}

/**
 * Scope a repo's revisions to one installation and number them per-installation.
 *
 * Two reasons this is not a raw `repo_id` list on the screen: a GitHub repo keeps
 * its repo_id across an org transfer, so an unfiltered query would surface the
 * prior owner's revisions (and public slugs) to the new owner; and the stored
 * `version` is global per repo, so showing it raw would still leak that a prior
 * owner published N times ("Revision 4" on the new owner's first publish). We
 * filter by installation and renumber densely within that set, newest first.
 */
export function scopeRevisionsToInstallation(
  revisions: readonly AuditRevisionRecord[],
  installationId: number,
): ScopedRevision[] {
  const mine = revisions
    .filter(r => r.installationId === installationId)
    .sort((a, b) => b.version - a.version);
  // Dense per-installation numbering: oldest in the set is 1, newest is mine.length.
  return mine.map((revision, i) => ({ revision, displayVersion: mine.length - i }));
}
