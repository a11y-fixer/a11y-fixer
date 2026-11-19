// Map GitHub's webhook repository objects to our RepoRecord rows. Shared by the
// installation and installation_repositories handlers so the mapping (and its
// defaulting of the optional default_branch) lives in exactly one place.
import type { RepoRecord } from '../../db/store.js';
import type { WebhookRepository } from '../events.js';

export function toRepoRecords(installationId: number, repos: WebhookRepository[]): RepoRecord[] {
  return repos.map(repo => ({
    repoId: repo.id,
    installationId,
    fullName: repo.full_name,
    isPrivate: repo.private,
    defaultBranch: repo.default_branch ?? null,
    selected: true,
  }));
}
