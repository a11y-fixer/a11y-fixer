import { Command } from 'commander';
import { scanSource, scanMarkdown, scanComponents } from '@a11y-fixer/core';
import path from 'node:path';
import { printViolations } from './report.js';

export function scanCommand(): Command {
  return new Command('scan')
    .description('Scan a directory for accessibility violations')
    .argument('<dir>', 'Directory to scan')
    .option('--static', 'Static JSX scan only (no browser required)', false)
    .option('--html', 'Scan static .html/.htm files with axe-core (requires puppeteer)', false)
    .option('--markdown', 'Also scan .md/.markdown/.mdx files (static source; no browser required)', false)
    .option('--components', 'Also scan .vue/.svelte/.astro template markup with axe-core (requires puppeteer)', false)
    .option('--url <url>', 'URL to scan with axe-core (requires puppeteer)')
    .option('--concurrency <n>', 'Parallel scan concurrency', '4')
    .action(async (dir: string, opts: { static: boolean; html: boolean; markdown: boolean; components: boolean; url?: string; concurrency: string }) => {
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
      if (opts.markdown) {
        console.log(`Also scanning ${rootDir} (Markdown)...`);
      }
      if (opts.components) {
        console.log(`Also scanning ${rootDir} (Vue/Svelte/Astro)...`);
      }

      const base = await scanSource(rootDir, { url, html: opts.html });
      const violations = [
        ...base,
        ...(opts.markdown ? await scanMarkdown(rootDir) : []),
        ...(opts.components ? await scanComponents(rootDir) : []),
      ];

      if (violations.length === 0) {
        console.log('No accessibility violations found.');
        return;
      }

      console.log(`Found ${violations.length} violation type(s):\n`);
      printViolations(violations, { showHelpUrl: true });
    });
}
