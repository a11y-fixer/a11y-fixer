import { Octokit } from '@octokit/rest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { FixResult } from '../fixer/index.js';
import type { A11yViolation } from '../detector/index.js';

const WCAG_NAMES: Record<string, string> = {
  '1.1.1': 'Non-text Content',
  '1.2.2': 'Captions (Prerecorded)',
  '1.3.1': 'Info and Relationships',
  '1.4.1': 'Use of Color',
  '1.4.3': 'Contrast (Minimum)',
  '2.4.4': 'Link Purpose',
  '2.4.6': 'Headings and Labels',
  '3.1.1': 'Language of Page',
  '4.1.2': 'Name, Role, Value',
};

export interface PROptions {
  owner: string;
  repo: string;
  baseBranch?: string;
  token?: string;
  /** Git repo root; PR paths are computed relative to this. Defaults to cwd. */
  repoRoot?: string;
}

export interface PRResult {
  url: string;
  branch: string;
  number: number;
}

export class PullRequestBuilder {
  private octokit: Octokit;

  constructor(private readonly options: PROptions) {
    const token = options.token ?? process.env['GITHUB_TOKEN'];
    if (!token) {
      throw new Error(
        'GitHub token required. Set GITHUB_TOKEN env var or pass options.token.'
      );
    }
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Opens a PR containing the fixed files.
   *
   * `changedFiles` are the working-tree files to commit onto the new branch.
   * When omitted, the applied fixes' source locations are used. Throws if the
   * resulting set is empty — an a11y-fixer PR with no diff is never useful.
   */
  async createPR(
    fixes: FixResult[],
    beforeViolations: A11yViolation[],
    afterViolations: A11yViolation[],
    changedFiles?: string[],
  ): Promise<PRResult> {
    const { owner, repo, baseBranch = 'main' } = this.options;

    const files = this.resolveChangedFiles(fixes, changedFiles);
    if (files.length === 0) {
      throw new Error('No changed files to commit — refusing to open an empty PR.');
    }

    const branch = `a11y-fixer/${this.timestamp()}`;

    const base = await this.octokit.repos.getBranch({ owner, repo, branch: baseBranch });
    const baseSha = base.data.commit.sha;

    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    });

    const applied = fixes.filter(f => f.applied);
    const commitSha = await this.commitFiles(baseSha, files, applied.length);

    await this.octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: commitSha,
    });

    const body = this.buildPRBody(fixes, beforeViolations, afterViolations);

    const pr = await this.octokit.pulls.create({
      owner,
      repo,
      title: `a11y-fixer: fix ${applied.length} accessibility violation${applied.length === 1 ? '' : 's'}`,
      body,
      head: branch,
      base: baseBranch,
      draft: false,
    });

    return { url: pr.data.html_url, branch, number: pr.data.number };
  }

  /** De-dupes an explicit file list with the applied fixes' source files. */
  private resolveChangedFiles(fixes: FixResult[], changedFiles?: string[]): string[] {
    const set = new Set<string>(changedFiles ?? []);
    for (const f of fixes) {
      if (f.applied && f.sourceLocation) set.add(f.sourceLocation.file);
    }
    return [...set];
  }

  /** Reads each working-tree file, writes blobs + a tree + a commit, returns its SHA. */
  private async commitFiles(baseSha: string, files: string[], appliedCount: number): Promise<string> {
    const { owner, repo } = this.options;
    const repoRoot = this.options.repoRoot ?? process.cwd();

    const tree = await Promise.all(
      files.map(async file => {
        const content = await readFile(file, 'utf8');
        const blob = await this.octokit.git.createBlob({
          owner,
          repo,
          content,
          encoding: 'utf-8',
        });
        return {
          path: this.toRepoPath(repoRoot, file),
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.data.sha,
        };
      }),
    );

    const newTree = await this.octokit.git.createTree({
      owner,
      repo,
      base_tree: baseSha,
      tree,
    });

    const commit = await this.octokit.git.createCommit({
      owner,
      repo,
      message: `a11y-fixer: fix ${appliedCount} accessibility violation${appliedCount === 1 ? '' : 's'}`,
      tree: newTree.data.sha,
      parents: [baseSha],
    });

    return commit.data.sha;
  }

  /** Repo-root-relative POSIX path, as required by the GitHub trees API. */
  private toRepoPath(repoRoot: string, file: string): string {
    return path.relative(repoRoot, file).split(path.sep).join('/');
  }

  private buildPRBody(
    fixes: FixResult[],
    beforeViolations: A11yViolation[],
    afterViolations: A11yViolation[],
  ): string {
    const applied = fixes.filter(f => f.applied);
    const flagged = fixes.filter(f => !f.applied && f.humanNote);

    const deltaTable = this.buildDeltaTable(beforeViolations, afterViolations);
    const fixTable = this.buildFixTable(applied);
    const humanNotes = this.buildHumanNotes(flagged);

    return [
      '## Accessibility Fixes',
      '',
      'Generated by [a11y-fixer](https://github.com/a11y-fixer/a11y-fixer). ' +
      'Each fix references the relevant WCAG 2.1 success criterion.',
      '',
      '### Violations Delta',
      deltaTable,
      '',
      applied.length > 0 ? '### Auto-applied Fixes\n' + fixTable : '',
      '',
      flagged.length > 0 ? '### Manual Review Required\n' + humanNotes : '',
    ].filter(Boolean).join('\n');
  }

  private buildDeltaTable(before: A11yViolation[], after: A11yViolation[]): string {
    const beforeCount = before.length;
    const afterCount = after.length;
    const delta = beforeCount - afterCount;
    const sign = delta > 0 ? '-' : delta < 0 ? '+' : '±';

    return [
      '| | Count |',
      '|---|---|',
      `| Before | ${beforeCount} violations |`,
      `| After | ${afterCount} violations |`,
      `| Delta | ${sign}${Math.abs(delta)} |`,
    ].join('\n');
  }

  private buildFixTable(applied: FixResult[]): string {
    if (applied.length === 0) return '_No auto-fixes applied._';

    const rows = applied.map(f => {
      const wcagName = WCAG_NAMES[f.wcagId] ?? f.wcagId;
      const location = f.sourceLocation
        ? `\`${f.sourceLocation.file}:${f.sourceLocation.line}\``
        : '—';
      return `| WCAG ${f.wcagId} | ${wcagName} | ${f.description} | ${location} |`;
    });

    return [
      '| WCAG | Criterion | Fix | Location |',
      '|---|---|---|---|',
      ...rows,
    ].join('\n');
  }

  private buildHumanNotes(flagged: FixResult[]): string {
    return flagged
      .map(f => `- **WCAG ${f.wcagId}** (${WCAG_NAMES[f.wcagId] ?? f.wcagId}): ${f.humanNote}`)
      .join('\n');
  }

  private timestamp(): string {
    return new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 15);
  }
}
