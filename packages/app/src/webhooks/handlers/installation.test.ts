import { describe, expect, it } from 'vitest';
import { MemoryStore } from '../../db/memory-store.js';
import { handleInstallation } from './installation.js';
import type { InstallationEvent } from '../events.js';

function baseEvent(action: string, overrides: Partial<InstallationEvent> = {}): InstallationEvent {
  return {
    action,
    installation: { id: 100, account: { id: 7, login: 'acme' }, suspended_at: null },
    ...overrides,
  };
}

describe('handleInstallation', () => {
  it('created: upserts the installation and its initial repos', async () => {
    const store = new MemoryStore();
    await handleInstallation(
      baseEvent('created', {
        repositories: [{ id: 1, full_name: 'acme/web', private: true, default_branch: 'main' }],
      }),
      store,
    );
    expect(store.installations.get(100)).toMatchObject({ account: 'acme', accountId: 7, suspendedAt: null });
    expect(store.repos.get(1)).toMatchObject({ fullName: 'acme/web', isPrivate: true, defaultBranch: 'main', selected: true });
  });

  it('created: handles no repositories array', async () => {
    const store = new MemoryStore();
    await handleInstallation(baseEvent('created'), store);
    expect(store.installations.has(100)).toBe(true);
    expect(store.repos.size).toBe(0);
  });

  it('deleted: removes the installation and cascades its repos', async () => {
    const store = new MemoryStore();
    await handleInstallation(
      baseEvent('created', { repositories: [{ id: 1, full_name: 'acme/web', private: false }] }),
      store,
    );
    await handleInstallation(baseEvent('deleted'), store);
    expect(store.installations.has(100)).toBe(false);
    expect(store.repos.size).toBe(0);
  });

  it('suspend: records a timestamp; unsuspend: clears it', async () => {
    const store = new MemoryStore();
    await handleInstallation(baseEvent('created'), store);
    await handleInstallation(
      baseEvent('suspend', {
        installation: { id: 100, account: { id: 7, login: 'acme' }, suspended_at: '2026-02-02T00:00:00Z' },
      }),
      store,
    );
    expect(store.installations.get(100)?.suspendedAt).toBe('2026-02-02T00:00:00Z');
    await handleInstallation(baseEvent('unsuspend'), store);
    expect(store.installations.get(100)?.suspendedAt).toBeNull();
  });

  it('suspend: falls back to now() when suspended_at is absent', async () => {
    const store = new MemoryStore();
    await handleInstallation(baseEvent('created'), store);
    await handleInstallation(baseEvent('suspend'), store);
    expect(store.installations.get(100)?.suspendedAt).not.toBeNull();
  });

  it('ignores unknown actions', async () => {
    const store = new MemoryStore();
    await handleInstallation(baseEvent('new_permissions_accepted'), store);
    expect(store.installations.size).toBe(0);
  });
});
