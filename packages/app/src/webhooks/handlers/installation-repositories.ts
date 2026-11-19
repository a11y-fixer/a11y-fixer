// Handle the `installation_repositories` webhook event (repos added to or
// removed from an existing installation's selected scope).
import type { Store } from '../../db/store.js';
import { toRepoRecords } from './repo-mapping.js';
import type { InstallationRepositoriesEvent } from '../events.js';

export async function handleInstallationRepositories(
  event: InstallationRepositoriesEvent,
  store: Store,
): Promise<void> {
  const installationId = event.installation.id;

  if (event.action === 'added' && event.repositories_added?.length) {
    await store.upsertRepos(installationId, toRepoRecords(installationId, event.repositories_added));
  }

  if (event.action === 'removed' && event.repositories_removed?.length) {
    await store.removeRepos(
      installationId,
      event.repositories_removed.map(repo => repo.id),
    );
  }
}
