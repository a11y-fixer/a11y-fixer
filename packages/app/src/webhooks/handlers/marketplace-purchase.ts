// Handle the `marketplace_purchase` webhook event.
//
// Keeps the `subscriptions` table in step with GitHub Marketplace:
//   purchased              -> upsert the subscription (account bought a plan)
//   changed                -> upsert with the new plan/seat counts
//   cancelled              -> soft-cancel (set cancelled_at, keep the row)
//   pending_change         -> no-op: the change isn't effective yet; we record it
//   pending_change_cancelled  when the effective `changed` event lands.
// Any other action is a no-op we acknowledge.
//
// Subscriptions are keyed on the purchasing account id (mirrors
// installations.account_id), so a purchase that arrives before the App is
// installed still records cleanly.
import type { Store, SubscriptionRecord } from '../../db/store.js';
import type { MarketplacePurchaseEvent } from '../events.js';

function toRecord(event: MarketplacePurchaseEvent): SubscriptionRecord {
  const { account, plan, unit_count, on_free_trial, free_trial_ends_on, next_billing_date } =
    event.marketplace_purchase;
  return {
    accountId: account.id,
    account: account.login,
    planId: plan.id,
    planName: plan.name,
    monthlyPriceInCents: plan.monthly_price_in_cents,
    unitCount: unit_count,
    onFreeTrial: on_free_trial,
    freeTrialEndsOn: free_trial_ends_on ?? null,
    nextBillingDate: next_billing_date ?? null,
    // An active (re)purchase or change clears any prior cancellation.
    cancelledAt: null,
  };
}

export async function handleMarketplacePurchase(event: MarketplacePurchaseEvent, store: Store): Promise<void> {
  switch (event.action) {
    case 'purchased':
    case 'changed': {
      await store.upsertSubscription(toRecord(event));
      return;
    }
    case 'cancelled': {
      await store.cancelSubscription(event.marketplace_purchase.account.id, event.effective_date);
      return;
    }
    default:
      // pending_change, pending_change_cancelled, and anything else: acknowledge
      // and ignore. The change is recorded when its effective event arrives.
      return;
  }
}
