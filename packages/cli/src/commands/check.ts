import { Command } from 'commander';
import { scanSource } from '@a11y-fixer/core';
import path from 'node:path';
import { printViolations } from './report.js';

export function checkCommand(): Command {
  return new Command('check')
    .description('CI gate: exits 1 if new accessibility violations are found')
    .argument('<dir>', 'Directory to check')
    .option('--html', 'Check static .html/.htm files with axe-core (requires puppeteer)', false)
    .option('--url <url>', 'URL to check with axe-core (requires puppeteer)')
    .action(async (dir: string, opts: { html?: boolean; url?: string }) => {
      const rootDir = path.resolve(dir);
      const violations = await scanSource(rootDir, { url: opts.url, html: opts.html });

      if (violations.length === 0) {
        console.log('No accessibility violations found. ✓');
        process.exit(0);
      }

      console.error(`Found ${violations.length} accessibility violation(s):\n`);
      printViolations(violations, { stream: 'err', maxNodes: 2 });
      console.error('\nRun: npx a11y-fixer fix <dir> to auto-fix these violations.');
      process.exit(1);
    });
}
