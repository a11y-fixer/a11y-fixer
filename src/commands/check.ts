import { Command } from 'commander';
import {
  scanSource,
  loadBaseline,
  buildBaseline,
  saveBaseline,
  diffAgainstBaseline,
} from '@a11y-fixer/core';
import path from 'node:path';
import { printViolations } from './report.js';

const DEFAULT_BASELINE_FILE = '.a11y-baseline.json';

export function checkCommand(): Command {
  return new Command('check')
    .description('CI gate: exits 1 if new accessibility violations are found (use --baseline to ignore pre-existing ones)')
    .argument('<dir>', 'Directory to check')
    .option('--html', 'Check static .html/.htm files with axe-core (requires puppeteer)', false)
    .option('--url <url>', 'URL to check with axe-core (requires puppeteer)')
    .option('--baseline [file]', `Compare against a baseline file (default: ${DEFAULT_BASELINE_FILE}); fail only on new violations`)
    .option('--update-baseline', 'Write the current violations to the baseline file and exit 0', false)
    .action(
      async (
        dir: string,
        opts: {
          html?: boolean;
          url?: string;
          baseline?: string | boolean;
          updateBaseline?: boolean;
        },
      ) => {
        const rootDir = path.resolve(dir);
        const violations = await scanSource(rootDir, { url: opts.url, html: opts.html });

        // Resolve the baseline path when either baseline flag is present.
        const baselineRequested = opts.baseline != null || opts.updateBaseline;
        const baselineFile = path.resolve(
          typeof opts.baseline === 'string' ? opts.baseline : DEFAULT_BASELINE_FILE,
        );

        // --update-baseline: record current state and exit clean.
        if (opts.updateBaseline) {
          const baseline = buildBaseline(violations, rootDir);
          saveBaseline(baselineFile, baseline);
          const occurrences = Object.values(baseline.entries).reduce((a, b) => a + b, 0);
          console.log(
            `Wrote baseline with ${occurrences} violation occurrence(s) to ${baselineFile} ✓`,
          );
          process.exit(0);
        }

        // --baseline: compare against it when it exists.
        if (baselineRequested) {
          const baseline = loadBaseline(baselineFile);
          if (baseline) {
            const { newViolations, baselinedCount, resolvedCount } = diffAgainstBaseline(
              violations,
              baseline,
              rootDir,
            );

            if (newViolations.length === 0) {
              console.log(`No new accessibility violations (${baselinedCount} baselined). ✓`);
              if (resolvedCount > 0) {
                console.log(
                  `${resolvedCount} baselined violation(s) resolved — run with --update-baseline to refresh.`,
                );
              }
              process.exit(0);
            }

            console.error(
              `Found ${newViolations.length} new accessibility violation type(s) (${baselinedCount} baselined):\n`,
            );
            printViolations(newViolations, { stream: 'err', maxNodes: 2 });
            console.error('\nRun: npx a11y-fixer fix <dir> to auto-fix these violations.');
            console.error('Or accept them with: npx a11y-fixer check <dir> --update-baseline');
            process.exit(1);
          }

          // Requested a baseline but none exists yet: treat all as new.
          console.error(
            `No baseline found at ${baselineFile}. Create one with --update-baseline to ignore pre-existing violations.\n`,
          );
        }

        if (violations.length === 0) {
          console.log('No accessibility violations found. ✓');
          process.exit(0);
        }

        console.error(`Found ${violations.length} accessibility violation(s):\n`);
        printViolations(violations, { stream: 'err', maxNodes: 2 });
        console.error('\nRun: npx a11y-fixer fix <dir> to auto-fix these violations.');
        process.exit(1);
      },
    );
}
