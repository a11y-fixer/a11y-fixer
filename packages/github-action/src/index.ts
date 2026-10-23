import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  PuppeteerRunner,
  buildDefaultRegistry,
  AnthropicProvider,
  PullRequestBuilder,
  scanSource,
  dedupeFixFiles,
} from '@a11y-fixer/core';
import type { A11yViolation, FixResult } from '@a11y-fixer/core';
import path from 'node:path';

/**
 * Opens a PR with the applied fixes when running in a GitHub context with a
 * token. No-ops (with a log line) when nothing was applied, no files changed,
 * or no token is available — a missing PR must never fail an otherwise-successful
 * fix run.
 */
async function maybeOpenPR(
  fixes: FixResult[],
  before: A11yViolation[],
  after: A11yViolation[],
  applied: FixResult[],
  baseBranch: string,
  hasToken: boolean,
): Promise<void> {
  if (applied.length === 0) {
    core.info('No fixes were applied — skipping PR.');
    return;
  }
  if (!hasToken) {
    core.info('No github-token provided — skipping PR.');
    return;
  }

  const changedFiles = dedupeFixFiles(fixes);
  if (changedFiles.length === 0) {
    core.info('No files were changed — skipping PR.');
    return;
  }

  const { owner, repo } = github.context.repo;
  core.info(`Opening PR against ${owner}/${repo}@${baseBranch}...`);

  const prBuilder = new PullRequestBuilder({
    owner,
    repo,
    baseBranch,
    repoRoot: process.cwd(),
  });
  const pr = await prBuilder.createPR(fixes, before, after, changedFiles);

  core.setOutput('pr-url', pr.url);
  core.info(`PR created: ${pr.url}`);
}

export async function run(): Promise<void> {
  const dir = core.getInput('dir') || '.';
  const mode = core.getInput('mode') || 'check';
  const githubToken = core.getInput('github-token');
  const anthropicKey = core.getInput('anthropic-api-key');
  const url = core.getInput('url');
  // getInput, not getBooleanInput: the latter throws when the input is absent
  // (e.g. older workflow files that predate this option).
  const html = core.getInput('html').toLowerCase() === 'true';
  const baseBranch = core.getInput('base-branch') || 'main';

  if (anthropicKey) process.env['ANTHROPIC_API_KEY'] = anthropicKey;
  if (githubToken) process.env['GITHUB_TOKEN'] = githubToken;

  const rootDir = path.resolve(dir);

  try {
    if (mode === 'check') {
      const violations = await scanSource(rootDir, { url, html });

      if (violations.length > 0) {
        const summary = violations
          .map(v => `WCAG ${v.wcagId}: ${v.description}`)
          .join('\n');
        core.setFailed(`Found ${violations.length} accessibility violation(s):\n${summary}`);
      } else {
        core.info('No accessibility violations found. ✓');
      }
    } else if (mode === 'scan') {
      const violations = await scanSource(rootDir, { url, html });
      core.setOutput('violations', JSON.stringify(violations));
      core.info(`Found ${violations.length} violation(s).`);
    } else if (mode === 'fix') {
      const aiProvider = new AnthropicProvider();
      const puppeteer = url ? new PuppeteerRunner(url) : undefined;
      try {
        const registry = buildDefaultRegistry(aiProvider, rootDir, puppeteer);

        const before = await scanSource(rootDir, { url, html });
        const fixes = await registry.applyAll(before);
        const applied = fixes.filter(f => f.applied);
        const after = await scanSource(rootDir, { url, html });

        core.setOutput('fixes-applied', String(applied.length));
        core.setOutput('violations-before', String(before.length));
        core.setOutput('violations-after', String(after.length));
        core.info(`Applied ${applied.length} fix(es). Violations: ${before.length} → ${after.length}.`);

        await maybeOpenPR(fixes, before, after, applied, baseBranch, Boolean(githubToken));
      } finally {
        await puppeteer?.close();
      }
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

// Auto-invoke as the action entrypoint; suppressed under vitest, where the
// test drives run() explicitly with controlled inputs.
if (!process.env['VITEST']) run();
