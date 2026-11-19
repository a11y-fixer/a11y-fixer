// Route a verified webhook payload to its handler by event name.
//
// M1 handles installation lifecycle only. M2 adds `check_run` (dashboard data)
// and M3 adds `marketplace_purchase` (billing); both slot in here as new cases.
// Unknown events are acknowledged and ignored so GitHub stops retrying them.
import { handleInstallation } from './handlers/installation.js';
import { handleInstallationRepositories } from './handlers/installation-repositories.js';
import type { InstallationEvent, InstallationRepositoriesEvent } from './events.js';
import type { Store } from '../db/store.js';

export async function routeEvent(eventName: string, payload: unknown, store: Store): Promise<void> {
  switch (eventName) {
    case 'installation':
      await handleInstallation(payload as InstallationEvent, store);
      return;
    case 'installation_repositories':
      await handleInstallationRepositories(payload as InstallationRepositoriesEvent, store);
      return;
    default:
      return;
  }
}
