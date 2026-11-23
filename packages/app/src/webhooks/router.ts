// Route a verified webhook payload to its handler by event name.
//
// M1 handled installation lifecycle. M2 added `check_run` (scan ingestion for the
// dashboard). M3 adds `marketplace_purchase` (billing). Unknown events are
// acknowledged and ignored so GitHub stops retrying.
import { handleInstallation } from './handlers/installation.js';
import { handleInstallationRepositories } from './handlers/installation-repositories.js';
import { handleCheckRun, type ConformanceConfig } from './handlers/check-run.js';
import { handleMarketplacePurchase } from './handlers/marketplace-purchase.js';
import type {
  CheckRunEvent,
  InstallationEvent,
  InstallationRepositoriesEvent,
  MarketplacePurchaseEvent,
} from './events.js';
import type { Store } from '../db/store.js';

export async function routeEvent(
  eventName: string,
  payload: unknown,
  store: Store,
  conformance?: ConformanceConfig,
): Promise<void> {
  switch (eventName) {
    case 'installation':
      await handleInstallation(payload as InstallationEvent, store);
      return;
    case 'check_run':
      await handleCheckRun(payload as CheckRunEvent, store, undefined, conformance);
      return;
    case 'installation_repositories':
      await handleInstallationRepositories(payload as InstallationRepositoriesEvent, store);
      return;
    case 'marketplace_purchase':
      await handleMarketplacePurchase(payload as MarketplacePurchaseEvent, store);
      return;
    default:
      return;
  }
}
