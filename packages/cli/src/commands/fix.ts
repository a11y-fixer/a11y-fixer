import { Command } from 'commander';
import {
  EslintRunner,
  HtmlFileRunner,
  AxeDetector,
  PuppeteerRunner,
  ReactJSXMapper,
  buildDefaultRegistry,
  AnthropicProvider,
  PullRequestBuilder,
} from '@a11y-fixer/core';
import type { A11yViolation, FixResult } from '@a11y-fixer/core';
import path from 'node:path';

export function fixCommand(): Command {
  return new Command('fix')
    .description('Fix accessibility violations and open an annotated PR')
    .argument('<dir>', 'Directory to fix')
    .option('--url <url>', 'URL to scan with axe-core (requires puppeteer)')
    .option('--html', 'Fix static .html/.htm files with axe-core (requires puppeteer)', false)
    .option('--owner <owner>', 'GitHub repo owner (required for PR)')
    .option('--repo <repo>', 'GitHub repo name (required for PR)')
    .option('--base <branch>', 'Base branch for PR', 'main')
    .option('--repo-root <path>', 'Git repo root for PR paths (defaults to cwd)')
    .option('--dry-run', 'Print fixes without applying or creating PR', false)
    .action(async (dir: string, opts: {
      url?: string;
      html: boolean;
      owner?: string;
      repo?: string;
      base: string;
      repoRoot?: string;
      dryRun: boolean;
    }) => {
      const rootDir = path.resolve(dir);
      const aiProvider = new AnthropicProvider();

      // When scanning a URL, screenshots let the alt-text fixer use vision.
      const puppeteer = opts.url ? new PuppeteerRunner(opts.url) : undefined;

      // Build registry (shared with the GitHub Action via buildDefaultRegistry).
      const registry = buildDefaultRegistry(aiProvider, rootDir, puppeteer);

      const eslintRunner = new EslintRunner(rootDir);
      const htmlRunner = opts.html ? new HtmlFileRunner(rootDir) : undefined;

      try {
        // Scan
        console.log(`Scanning ${opts.url ?? rootDir}...`);
        const beforeViolations = await scan(rootDir, opts.url, eslintRunner, htmlRunner);

        if (beforeViolations.length === 0) {
          console.log('No violations found.');
          return;
        }

        console.log(`Found ${beforeViolations.length} violation type(s). Applying fixes...\n`);

        if (opts.dryRun) {
          for (const v of beforeViolations) {
            console.log(`  [DRY RUN] Would fix WCAG ${v.wcagId}: ${v.description}`);
          }
          return;
        }

        const fixes = await registry.applyAll(beforeViolations);
        const applied = fixes.filter(f => f.applied);
        const flagged = fixes.filter(f => !f.applied);

        console.log(`Applied: ${applied.length}, Human review needed: ${flagged.length}\n`);

        for (const f of applied) {
          console.log(`  ✓ WCAG ${f.wcagId}: ${f.description}`);
        }
        for (const f of flagged) {
          console.log(`  ⚠ WCAG ${f.wcagId}: ${f.humanNote ?? f.description}`);
        }

        if (opts.owner && opts.repo) {
          // Re-scan so the PR delta table reflects reality.
          const afterViolations = await scan(rootDir, opts.url, eslintRunner, htmlRunner);
          const changedFiles = dedupeFixFiles(fixes);

          if (changedFiles.length === 0) {
            console.log('\nNo files were changed — skipping PR.');
            return;
          }

          console.log('\nCreating PR...');
          const prBuilder = new PullRequestBuilder({
            owner: opts.owner,
            repo: opts.repo,
            baseBranch: opts.base,
            repoRoot: opts.repoRoot ? path.resolve(opts.repoRoot) : process.cwd(),
          });
          const pr = await prBuilder.createPR(fixes, beforeViolations, afterViolations, changedFiles);
          console.log(`\nPR created: ${pr.url}`);
        }
      } finally {
        await puppeteer?.close();
      }
    });
}

/**
 * Scans via axe (URL), static HTML files, or ESLint (static JSX). URL nodes are
 * mapped back to source; the HTML runner stamps source locations itself.
 */
async function scan(
  rootDir: string,
  url: string | undefined,
  eslintRunner: EslintRunner,
  htmlRunner?: HtmlFileRunner,
): Promise<A11yViolation[]> {
  if (!url) return htmlRunner ? htmlRunner.scan() : eslintRunner.scan();

  const violations = await new AxeDetector().scan({ url });
  const mapper = new ReactJSXMapper(rootDir);
  for (const v of violations) {
    for (const node of v.nodes) {
      if (node.sourceFile) continue;
      const loc = await mapper.locate(node);
      if (loc) {
        node.sourceFile = loc.file;
        node.sourceLine = loc.line;
        node.sourceColumn = loc.column;
      }
    }
  }
  return violations;
}

/** Repo-absolute source files touched by applied fixes, de-duplicated. */
function dedupeFixFiles(fixes: FixResult[]): string[] {
  const set = new Set<string>();
  for (const f of fixes) {
    if (f.applied && f.sourceLocation) set.add(f.sourceLocation.file);
  }
  return [...set];
}
