import { describe, expect, it } from 'vitest';
import { MemoryStore } from '../../db/memory-store.js';
import { handleInstallationRepositories } from './installation-repositories.js';
import type { InstallationRepositoriesEvent } from '../events.js';

const installation = { id: 100, account: { id: 7, login: 'acme' }, suspended_at: null };

describe('handleInstallationRepositories', () => {
  it('added: upserts the new repos', async () => {
    const store = new MemoryStore();
    const event: InstallationRepositoriesEvent = {
      action: 'added',
      installation,
      repository_selection: 'selected',
      repositories_added: [{ id: 5, full_name: 'acme/api', private: true }],
    };
    await handleInstallationRepositories(event, store);
    expect(store.repos.get(5)).toMatchObject({ fullName: 'acme/api', installationId: 100 });
  });

  it('removed: deletes only the listed repos for this installation', async () => {
    const store = new MemoryStore();
    store.repos.set(5, { repoId: 5, installationId: 100, fullName: 'acme/api', isPrivate: true, defaultBranch: null, selected: true });
    store.repos.set(6, { repoId: 6, installationId: 100, fullName: 'acme/web', isPrivate: true, defaultBranch: null, selected: true });
    const event: InstallationRepositoriesEvent = {
      action: 'removed',
      installation,
      repository_selection: 'selected',
      repositories_removed: [{ id: 5, full_name: 'acme/api', private: true }],
    };
    await handleInstallationRepositories(event, store);
    expect(store.repos.has(5)).toBe(false);
    expect(store.repos.has(6)).toBe(true);
  });

  it('does not remove a repo belonging to a different installation', async () => {
    const store = new MemoryStore();
    store.repos.set(5, { repoId: 5, installationId: 999, fullName: 'other/api', isPrivate: true, defaultBranch: null, selected: true });
    await handleInstallationRepositories(
      { action: 'removed', installation, repository_selection: 'selected', repositories_removed: [{ id: 5, full_name: 'other/api', private: true }] },
      store,
    );
    expect(store.repos.has(5)).toBe(true);
  });

  it('is a no-op when the action has no matching repo list', async () => {
    const store = new MemoryStore();
    await handleInstallationRepositories({ action: 'added', installation, repository_selection: 'all' }, store);
    expect(store.repos.size).toBe(0);
  });
});
