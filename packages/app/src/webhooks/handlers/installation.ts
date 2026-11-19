// Handle the `installation` webhook event.
//
// Keeps the `installations` and `repos` tables in step with GitHub:
//   created    -> upsert the installation + its initial repo scope
//   deleted    -> remove the installation (and its repos, via the store)
//   suspend    -> mark suspended_at
//   unsuspend  -> clear suspended_at
// Any other action (e.g. new_permissions_accepted) is a no-op we acknowledge.
import type { Store } from '../../db/store.js';
import { toRepoRecords } from './repo-mapping.js';
import type { InstallationEvent } from '../events.js';

export async function handleInstallation(event: InstallationEvent, store: Store): Promise<void> {
  const { action, installation } = event;
  const installationId = installation.id;

  switch (action) {
    case 'created': {
      await store.upsertInstallation({
        installationId,
        account: installation.account.login,
        accountId: installation.account.id,
        suspendedAt: installation.suspended_at ?? null,
      });
      if (event.repositories?.length) {
        await store.upsertRepos(installationId, toRepoRecords(installationId, event.repositories));
      }
      return;
    }
    case 'deleted': {
      await store.removeInstallation(installationId);
      return;
    }
    case 'suspend': {
      await store.setInstallationSuspended(installationId, installation.suspended_at ?? new Date().toISOString());
      return;
    }
    case 'unsuspend': {
      await store.setInstallationSuspended(installationId, null);
      return;
    }
    default:
      return;
  }
}
