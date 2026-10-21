import { Command } from 'commander';
import {
  EslintRunner,
  AxeDetector,
  FixerRegistry,
  EslintFixer,
  AltTextFixer,
  LinkTextFixer,
  AnthropicProvider,
  PullRequestBuilder,
} from '@a11y-fixer/core';
import path from 'node:path';

export function fixCommand(): Command {
  return new Command('fix')
    .description('Fix accessibility violations and open an annotated PR')
    .argument('<dir>', 'Directory to fix')
    .option('--url <url>', 'URL to scan with axe-core (requires puppeteer)')
    .option('--owner <owner>', 'GitHub repo owner (required for PR)')
    .option('--repo <repo>', 'GitHub repo name (required for PR)')
    .option('--base <branch>', 'Base branch for PR', 'main')
    .option('--dry-run', 'Print fixes without applying or creating PR', false)
    .action(async (dir: string, opts: {
      url?: string;
      owner?: string;
      repo?: string;
      base: string;
      dryRun: boolean;
    }) => {
      const rootDir = path.resolve(dir);
      const aiProvider = new AnthropicProvider();

      // Build registry
      const registry = new FixerRegistry();
      const eslintFixableIds = ['3.1.1', '4.1.2', '1.3.1', '2.4.6'];
      for (const wcagId of eslintFixableIds) {
        registry.register(new EslintFixer(wcagId, rootDir));
      }
      registry.register(new AltTextFixer(aiProvider, rootDir));
      registry.register(new LinkTextFixer(aiProvider, rootDir));

      // Scan
      console.log(`Scanning ${rootDir}...`);
      const eslintRunner = new EslintRunner(rootDir);
      const violations = await eslintRunner.scan();

      if (violations.length === 0) {
        console.log('No violations found.');
        return;
      }

      console.log(`Found ${violations.length} violation type(s). Applying fixes...\n`);

      if (opts.dryRun) {
        for (const v of violations) {
          console.log(`  [DRY RUN] Would fix WCAG ${v.wcagId}: ${v.description}`);
        }
        return;
      }

      const fixes = await registry.applyAll(violations);
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
        console.log('\nCreating PR...');
        const prBuilder = new PullRequestBuilder({
          owner: opts.owner,
          repo: opts.repo,
          baseBranch: opts.base,
        });
        const pr = await prBuilder.createPR(fixes, violations, []);
        console.log(`\nPR created: ${pr.url}`);
      }
    });
}
