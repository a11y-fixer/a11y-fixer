import { Command } from 'commander';
import { scanSource } from '@a11y-fixer/core';
import path from 'node:path';
import { printViolations } from './report.js';

export function scanCommand(): Command {
  return new Command('scan')
    .description('Scan a directory for accessibility violations')
    .argument('<dir>', 'Directory to scan')
    .option('--static', 'Static JSX scan only (no browser required)', false)
    .option('--html', 'Scan static .html/.htm files with axe-core (requires puppeteer)', false)
    .option('--url <url>', 'URL to scan with axe-core (requires puppeteer)')
    .option('--concurrency <n>', 'Parallel scan concurrency', '4')
    .action(async (dir: string, opts: { static: boolean; html: boolean; url?: string; concurrency: string }) => {
      const rootDir = path.resolve(dir);
      // --static forces the offline JSX path even when a --url is given.
      const url = opts.static ? undefined : opts.url;

      if (url) {
        console.log(`Scanning ${url} with axe-core...`);
      } else if (opts.html) {
        console.log(`Scanning ${rootDir} (static HTML)...`);
      } else {
        console.log(`Scanning ${rootDir} (static JSX)...`);
      }

      const violations = await scanSource(rootDir, { url, html: opts.html });

      if (violations.length === 0) {
        console.log('No accessibility violations found.');
        return;
      }

      console.log(`Found ${violations.length} violation type(s):\n`);
      printViolations(violations, { showHelpUrl: true });
    });
}
