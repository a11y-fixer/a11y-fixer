import { Command } from 'commander';
import { EslintRunner, HtmlFileRunner, AxeDetector } from '@a11y-fixer/core';
import path from 'node:path';

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

      if (opts.html && !opts.url) {
        console.log(`Scanning ${rootDir} (static HTML)...`);
        const runner = new HtmlFileRunner(rootDir);
        const violations = await runner.scan();

        if (violations.length === 0) {
          console.log('No accessibility violations found.');
          return;
        }

        console.log(`Found ${violations.length} violation type(s):\n`);
        for (const v of violations) {
          console.log(`  WCAG ${v.wcagId} [${v.impact}] ${v.description}`);
          for (const node of v.nodes) {
            if (node.sourceFile) {
              console.log(`    → ${node.sourceFile}:${node.sourceLine ?? '?'}`);
            }
          }
        }
        return;
      }

      if (opts.static || !opts.url) {
        console.log(`Scanning ${rootDir} (static JSX)...`);
        const runner = new EslintRunner(rootDir);
        const violations = await runner.scan();

        if (violations.length === 0) {
          console.log('No accessibility violations found.');
          return;
        }

        console.log(`Found ${violations.length} violation type(s):\n`);
        for (const v of violations) {
          console.log(`  WCAG ${v.wcagId} [${v.impact}] ${v.description}`);
          for (const node of v.nodes) {
            if (node.sourceFile) {
              console.log(`    → ${node.sourceFile}:${node.sourceLine}`);
            }
          }
        }
      } else {
        console.log(`Scanning ${opts.url} with axe-core...`);
        const detector = new AxeDetector();
        const violations = await detector.scan({ url: opts.url });

        if (violations.length === 0) {
          console.log('No accessibility violations found.');
          return;
        }

        console.log(`Found ${violations.length} violation type(s):\n`);
        for (const v of violations) {
          console.log(`  WCAG ${v.wcagId} [${v.impact}] ${v.description}`);
          console.log(`    Help: ${v.helpUrl}`);
        }
      }
    });
}
