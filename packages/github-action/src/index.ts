import * as core from '@actions/core';
import {
  EslintRunner,
  AxeDetector,
  PuppeteerRunner,
  ReactJSXMapper,
  FixerRegistry,
  EslintFixer,
  AltTextFixer,
  LinkTextFixer,
  AnthropicProvider,
} from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import path from 'node:path';

/** Scans via axe (URL) or ESLint (static). URL nodes are mapped back to source. */
async function scan(rootDir: string, url: string | undefined): Promise<A11yViolation[]> {
  if (!url) return new EslintRunner(rootDir).scan();

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

async function run(): Promise<void> {
  const dir = core.getInput('dir') || '.';
  const mode = core.getInput('mode') || 'check';
  const githubToken = core.getInput('github-token');
  const anthropicKey = core.getInput('anthropic-api-key');
  const url = core.getInput('url');

  if (anthropicKey) process.env['ANTHROPIC_API_KEY'] = anthropicKey;
  if (githubToken) process.env['GITHUB_TOKEN'] = githubToken;

  const rootDir = path.resolve(dir);

  try {
    if (mode === 'check') {
      const violations = await scan(rootDir, url);

      if (violations.length > 0) {
        const summary = violations
          .map(v => `WCAG ${v.wcagId}: ${v.description}`)
          .join('\n');
        core.setFailed(`Found ${violations.length} accessibility violation(s):\n${summary}`);
      } else {
        core.info('No accessibility violations found. ✓');
      }
    } else if (mode === 'scan') {
      const violations = await scan(rootDir, url);
      core.setOutput('violations', JSON.stringify(violations));
      core.info(`Found ${violations.length} violation(s).`);
    } else if (mode === 'fix') {
      const aiProvider = new AnthropicProvider();
      const puppeteer = url ? new PuppeteerRunner(url) : undefined;
      try {
        const registry = new FixerRegistry();
        for (const wcagId of ['3.1.1', '4.1.2', '1.3.1', '2.4.6']) {
          registry.register(new EslintFixer(wcagId, rootDir));
        }
        registry.register(new AltTextFixer(aiProvider, rootDir, puppeteer));
        registry.register(new LinkTextFixer(aiProvider, rootDir));

        const before = await scan(rootDir, url);
        const fixes = await registry.applyAll(before);
        const applied = fixes.filter(f => f.applied);
        const after = await scan(rootDir, url);

        core.setOutput('fixes-applied', String(applied.length));
        core.setOutput('violations-before', String(before.length));
        core.setOutput('violations-after', String(after.length));
        core.info(`Applied ${applied.length} fix(es). Violations: ${before.length} → ${after.length}.`);
      } finally {
        await puppeteer?.close();
      }
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
