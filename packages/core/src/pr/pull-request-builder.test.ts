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

  describe('body rendering', () => {
    function makeBuilder() {
      return new PullRequestBuilder({ owner: 'me', repo: 'proj', token: 't' });
    }

    it('renders the PR body: delta table, applied-fix table, and manual-review notes', async () => {
      const repoRoot = await mkdtemp(path.join(tmpdir(), 'a11y-pr-'));
      try {
        const target = path.join(repoRoot, 'App.tsx');
        await writeFile(target, '<a href="/x">Read more</a>');

        const octokit = makeOctokitStub();
        const builder = new PullRequestBuilder({ owner: 'me', repo: 'proj', token: 't', repoRoot });
        (builder as unknown as { octokit: typeof octokit }).octokit = octokit;

        const fixes: FixResult[] = [
          {
            wcagId: '2.4.4',
            bucket: 'deterministic',
            applied: true,
            description: 'Gave the link discernible text',
            before: '<a href="/x"></a>',
            after: '<a href="/x">Read more</a>',
            sourceLocation: { file: target, line: 3, column: 1 },
          },
          {
            wcagId: '1.4.3',
            bucket: 'ai-assisted',
            applied: false,
            description: 'Low contrast',
            before: '',
            after: '',
            humanNote: 'Pick a darker foreground; this needs a design decision.',
          },
        ];

        await builder.createPR(fixes, [{} as never, {} as never, {} as never], [{} as never]);

        const body = octokit.pulls.create.mock.calls[0][0].body as string;

        // Delta table: 3 before, 1 after, improvement of 2.
        expect(body).toContain('| Before | 3 violations |');
        expect(body).toContain('| After | 1 violations |');
        expect(body).toContain('| Delta | -2 |');
        // Applied-fix table resolves the WCAG name and the source location.
        expect(body).toContain('### Auto-applied Fixes');
        expect(body).toContain('| WCAG 2.4.4 | Link Purpose | Gave the link discernible text | `');
        expect(body).toContain(':3`');
        // Manual-review section for the flagged, unapplied fix.
        expect(body).toContain('### Manual Review Required');
        expect(body).toContain('- **WCAG 1.4.3** (Contrast (Minimum)): Pick a darker foreground');
      } finally {
        await rm(repoRoot, { recursive: true, force: true });
      }
    });

    it('buildDeltaTable signs the delta: improvement, regression, and no change', () => {
      const builder = makeBuilder() as unknown as {
        buildDeltaTable(b: unknown[], a: unknown[]): string;
      };
      const rows = (n: number, m: number) => builder.buildDeltaTable(Array(n).fill({}), Array(m).fill({}));
      expect(rows(5, 2)).toContain('| Delta | -3 |');
      expect(rows(2, 5)).toContain('| Delta | +3 |');
      expect(rows(4, 4)).toContain('| Delta | ±0 |');
    });

    it('buildFixTable reports when no auto-fixes were applied', () => {
      const builder = makeBuilder() as unknown as { buildFixTable(f: FixResult[]): string };
      expect(builder.buildFixTable([])).toBe('_No auto-fixes applied._');
    });

    it('buildFixTable falls back to an em dash when a fix has no source location', () => {
      const builder = makeBuilder() as unknown as { buildFixTable(f: FixResult[]): string };
      const table = builder.buildFixTable([
        { wcagId: '3.1.1', bucket: 'deterministic', applied: true, description: 'Set lang', before: '', after: '' },
      ]);
      // Unknown WCAG names fall through to the id; here 3.1.1 is known.
      expect(table).toContain('| WCAG 3.1.1 | Language of Page | Set lang | — |');
    });

    it('toRepoPath produces a repo-relative POSIX path, including escapes above the root', () => {
      const builder = makeBuilder() as unknown as { toRepoPath(root: string, file: string): string };
      const root = path.join('/tmp', 'repo');
      expect(builder.toRepoPath(root, path.join(root, 'src', 'App.tsx'))).toBe('src/App.tsx');
      // A file outside the root resolves to a `../` escape — the caller must not mis-target it.
      expect(builder.toRepoPath(root, path.join('/tmp', 'other', 'x.ts'))).toBe('../other/x.ts');
    });

    it('resolveChangedFiles unions explicit files with applied fixes and de-dupes', () => {
      const builder = makeBuilder() as unknown as {
        resolveChangedFiles(f: FixResult[], changed?: string[]): string[];
      };
      const fixes: FixResult[] = [
        { wcagId: '1.1.1', bucket: 'deterministic', applied: true, description: '', before: '', after: '', sourceLocation: { file: 'a.tsx', line: 1, column: 1 } },
        { wcagId: '1.1.1', bucket: 'deterministic', applied: false, description: '', before: '', after: '', sourceLocation: { file: 'skip.tsx', line: 1, column: 1 } },
      ];
      expect(builder.resolveChangedFiles(fixes, ['a.tsx', 'b.tsx']).sort()).toEqual(['a.tsx', 'b.tsx']);
    });
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
