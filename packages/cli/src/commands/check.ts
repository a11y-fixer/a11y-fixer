import { Command } from 'commander';
import { EslintRunner, AxeDetector } from '@a11y-fixer/core';
import path from 'node:path';

export function checkCommand(): Command {
  return new Command('check')
    .description('CI gate: exits 1 if new accessibility violations are found')
    .argument('<dir>', 'Directory to check')
    .option('--url <url>', 'URL to check with axe-core (requires puppeteer)')
    .action(async (dir: string, opts: { url?: string }) => {
      const rootDir = path.resolve(dir);

      let violations;
      if (opts.url) {
        const detector = new AxeDetector();
        violations = await detector.scan({ url: opts.url });
      } else {
        const runner = new EslintRunner(rootDir);
        violations = await runner.scan();
      }

      if (violations.length === 0) {
        console.log('No accessibility violations found. ✓');
        process.exit(0);
      }

      console.error(`Found ${violations.length} accessibility violation(s):\n`);
      for (const v of violations) {
        console.error(`  WCAG ${v.wcagId} [${v.impact}]: ${v.description}`);
        for (const node of v.nodes.slice(0, 2)) {
          if (node.sourceFile) {
            console.error(`    ${node.sourceFile}:${node.sourceLine}`);
          }
        }
      }
      console.error('\nRun: npx a11y-fixer fix <dir> to auto-fix these violations.');
      process.exit(1);
    });
}
