import { Command } from 'commander';
import {
  buildCoreRegistry,
  PullRequestBuilder,
  scanSource,
  scanMarkdown,
  dedupeFixFiles,
  canonicalizeLangTag,
} from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import path from 'node:path';

export function fixCommand(): Command {
  return new Command('fix')
    .description('Fix accessibility violations and open an annotated PR')
    .argument('<dir>', 'Directory to fix')
    .option('--url <url>', 'URL to scan with axe-core (requires puppeteer)')
    .option('--html', 'Fix static .html/.htm files with axe-core (requires puppeteer)', false)
    .option('--markdown', 'Also fix .md/.markdown files (static source; no browser required)', false)
    .option('--owner <owner>', 'GitHub repo owner (required for PR)')
    .option('--repo <repo>', 'GitHub repo name (required for PR)')
    .option('--base <branch>', 'Base branch for PR', 'main')
    .option('--repo-root <path>', 'Git repo root for PR paths (defaults to cwd)')
    .option('--lang <tag>', 'BCP-47 language tag to stamp on <html> when lang is missing (else auto-detected)')
    .option('--dry-run', 'Print fixes without applying or creating PR', false)
    .action(async (dir: string, opts: {
      url?: string;
      html: boolean;
      markdown: boolean;
      owner?: string;
      repo?: string;
      base: string;
      repoRoot?: string;
      lang?: string;
      dryRun: boolean;
    }) => {
      const rootDir = path.resolve(dir);

      // Runs the base scan and merges Markdown violations when --markdown is set.
      const scan = async (): Promise<A11yViolation[]> => {
        const base = await scanSource(rootDir, { url: opts.url, html: opts.html });
        return opts.markdown ? [...base, ...await scanMarkdown(rootDir)] : base;
      };

      // Fail fast on a malformed --lang before scanning anything.
      if (opts.lang !== undefined && canonicalizeLangTag(opts.lang) === null) {
        console.error(`Invalid --lang value "${opts.lang}": not a valid BCP-47 language tag.`);
        process.exitCode = 1;
        return;
      }

      // Deterministic fixers only. AI-assisted fixing lives in the paid
      // @a11y-fixer/ai package used by the GitHub Action; here the ai-assisted
      // rules fall through to the "human review needed" path below.
      const registry = buildCoreRegistry(rootDir, { lang: opts.lang });

      // Scan
        console.log(`Scanning ${opts.url ?? rootDir}...`);
        const beforeViolations = await scan();

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
          const afterViolations = await scan();
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
    });
}
