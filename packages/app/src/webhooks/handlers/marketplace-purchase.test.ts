import { describe, expect, it } from 'vitest';
import { MemoryStore } from '../../db/memory-store.js';
import { handleMarketplacePurchase } from './marketplace-purchase.js';
import type { MarketplacePurchaseEvent } from '../events.js';

function baseEvent(
  action: string,
  overrides: Partial<MarketplacePurchaseEvent['marketplace_purchase']> = {},
): MarketplacePurchaseEvent {
  return {
    action,
    effective_date: '2026-03-01T00:00:00Z',
    marketplace_purchase: {
      account: { id: 7, login: 'acme' },
      plan: { id: 42, name: 'Pro', monthly_price_in_cents: 2900, unit_name: 'Seat' },
      unit_count: 5,
      on_free_trial: false,
      free_trial_ends_on: null,
      next_billing_date: '2026-04-01T00:00:00Z',
      ...overrides,
    },
  };
}

describe('handleMarketplacePurchase', () => {
  it('purchased: writes a subscription row', async () => {
    const store = new MemoryStore();
    await handleMarketplacePurchase(baseEvent('purchased'), store);
    expect(store.subscriptions.get(7)).toMatchObject({
      accountId: 7,
      account: 'acme',
      planId: 42,
      planName: 'Pro',
      monthlyPriceInCents: 2900,
      unitCount: 5,
      onFreeTrial: false,
      freeTrialEndsOn: null,
      nextBillingDate: '2026-04-01T00:00:00Z',
      cancelledAt: null,
    });
  });

  it('changed: updates plan and seat counts', async () => {
    const store = new MemoryStore();
    await handleMarketplacePurchase(baseEvent('purchased'), store);
    await handleMarketplacePurchase(
      baseEvent('changed', {
        plan: { id: 99, name: 'Enterprise', monthly_price_in_cents: 9900, unit_name: 'Seat' },
        unit_count: 50,
      }),
      store,
    );
    expect(store.subscriptions.get(7)).toMatchObject({ planId: 99, planName: 'Enterprise', unitCount: 50 });
  });

  it('changed: clears a prior cancellation', async () => {
    const store = new MemoryStore();
    await handleMarketplacePurchase(baseEvent('purchased'), store);
    await handleMarketplacePurchase(baseEvent('cancelled'), store);
    expect(store.subscriptions.get(7)?.cancelledAt).not.toBeNull();
    await handleMarketplacePurchase(baseEvent('changed'), store);
    expect(store.subscriptions.get(7)?.cancelledAt).toBeNull();
  });

  it('cancelled: soft-cancels without removing the row', async () => {
    const store = new MemoryStore();
    await handleMarketplacePurchase(baseEvent('purchased'), store);
    await handleMarketplacePurchase(baseEvent('cancelled'), store);
    expect(store.subscriptions.has(7)).toBe(true);
    expect(store.subscriptions.get(7)?.cancelledAt).toBe('2026-03-01T00:00:00Z');
  });

  it('maps free-trial fields through', async () => {
    const store = new MemoryStore();
    await handleMarketplacePurchase(
      baseEvent('purchased', { on_free_trial: true, free_trial_ends_on: '2026-03-15' }),
      store,
    );
    expect(store.subscriptions.get(7)).toMatchObject({ onFreeTrial: true, freeTrialEndsOn: '2026-03-15' });
  });

  it('pending_change / pending_change_cancelled are no-ops', async () => {
    const store = new MemoryStore();
    await handleMarketplacePurchase(baseEvent('pending_change'), store);
    await handleMarketplacePurchase(baseEvent('pending_change_cancelled'), store);
    expect(store.subscriptions.size).toBe(0);
  });
});
