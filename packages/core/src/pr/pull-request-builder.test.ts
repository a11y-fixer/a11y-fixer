import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PullRequestBuilder } from './pull-request-builder.js';
import type { FixResult } from '../fixer/index.js';

describe('PullRequestBuilder', () => {
  it('throws when no GitHub token is available', () => {
    const original = process.env['GITHUB_TOKEN'];
    delete process.env['GITHUB_TOKEN'];

    expect(() => new PullRequestBuilder({ owner: 'a', repo: 'b' }))
      .toThrow('GitHub token required');

    if (original !== undefined) process.env['GITHUB_TOKEN'] = original;
  });

  it('constructs successfully with token option', () => {
    expect(() => new PullRequestBuilder({ owner: 'a', repo: 'b', token: 'test-token' }))
      .not.toThrow();
  });

  it('branch names include timestamp suffix', () => {
    const builder = new PullRequestBuilder({ owner: 'a', repo: 'b', token: 'test-token' });
    // Access private method via cast for test
    const ts = (builder as unknown as { timestamp(): string }).timestamp();
    expect(ts).toMatch(/^\d{15}$/);
  });

  describe('createPR', () => {
    let repoRoot: string;

    beforeEach(async () => {
      repoRoot = await mkdtemp(path.join(tmpdir(), 'a11y-pr-'));
    });

    afterEach(async () => {
      await rm(repoRoot, { recursive: true, force: true });
    });

    it('throws when there are no changed files (no empty PRs)', async () => {
      const builder = new PullRequestBuilder({ owner: 'a', repo: 'b', token: 't', repoRoot });
      await expect(builder.createPR([], [], [])).rejects.toThrow('empty PR');
    });

    it('commits changed files as blobs/tree/commit and opens a PR', async () => {
      const fileContent = '<img alt="a cat" src="cat.png" />';
      const target = path.join(repoRoot, 'App.tsx');
      await writeFile(target, fileContent);

      const octokit = makeOctokitStub();
      const builder = new PullRequestBuilder({ owner: 'me', repo: 'proj', token: 't', repoRoot });
      (builder as unknown as { octokit: typeof octokit }).octokit = octokit;

      const fixes: FixResult[] = [{
        wcagId: '1.1.1',
        bucket: 'ai-assisted',
        applied: true,
        description: 'added alt',
        before: '<img src="cat.png" />',
        after: fileContent,
        sourceLocation: { file: target, line: 1, column: 1 },
      }];

      const result = await builder.createPR(fixes, [{} as never], []);

      expect(result.url).toBe('https://github.com/me/proj/pull/7');
      expect(result.number).toBe(7);

      // blob created with working-tree contents
      expect(octokit.git.createBlob).toHaveBeenCalledWith(
        expect.objectContaining({ content: fileContent, encoding: 'utf-8' }),
      );
      // tree uses repo-relative POSIX path + base_tree = baseSha
      expect(octokit.git.createTree).toHaveBeenCalledWith(
        expect.objectContaining({
          base_tree: 'base-sha',
          tree: [expect.objectContaining({ path: 'App.tsx', sha: 'blob-sha' })],
        }),
      );
      expect(octokit.git.createCommit).toHaveBeenCalledWith(
        expect.objectContaining({ tree: 'tree-sha', parents: ['base-sha'] }),
      );
      expect(octokit.git.updateRef).toHaveBeenCalledWith(
        expect.objectContaining({ sha: 'commit-sha' }),
      );
    });
  });
});

function makeOctokitStub() {
  return {
    repos: {
      getBranch: vi.fn().mockResolvedValue({ data: { commit: { sha: 'base-sha' } } }),
    },
    git: {
      createRef: vi.fn().mockResolvedValue({}),
      createBlob: vi.fn().mockResolvedValue({ data: { sha: 'blob-sha' } }),
      createTree: vi.fn().mockResolvedValue({ data: { sha: 'tree-sha' } }),
      createCommit: vi.fn().mockResolvedValue({ data: { sha: 'commit-sha' } }),
      updateRef: vi.fn().mockResolvedValue({}),
    },
    pulls: {
      create: vi.fn().mockResolvedValue({
        data: { html_url: 'https://github.com/me/proj/pull/7', number: 7 },
      }),
    },
  };
}
