import * as core from '@actions/core';
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
      const runner = new EslintRunner(rootDir);
      const violations = url
        ? await new AxeDetector().scan({ url })
        : await runner.scan();

      if (violations.length > 0) {
        const summary = violations
          .map(v => `WCAG ${v.wcagId}: ${v.description}`)
          .join('\n');
        core.setFailed(`Found ${violations.length} accessibility violation(s):\n${summary}`);
      } else {
        core.info('No accessibility violations found. ✓');
      }
    } else if (mode === 'scan') {
      const runner = new EslintRunner(rootDir);
      const violations = await runner.scan();
      core.setOutput('violations', JSON.stringify(violations));
      core.info(`Found ${violations.length} violation(s).`);
    } else if (mode === 'fix') {
      const aiProvider = new AnthropicProvider();
      const registry = new FixerRegistry();
      for (const wcagId of ['3.1.1', '4.1.2', '1.3.1', '2.4.6']) {
        registry.register(new EslintFixer(wcagId, rootDir));
      }
      registry.register(new AltTextFixer(aiProvider, rootDir));
      registry.register(new LinkTextFixer(aiProvider, rootDir));

      const runner = new EslintRunner(rootDir);
      const violations = await runner.scan();
      const fixes = await registry.applyAll(violations);
      const applied = fixes.filter(f => f.applied);
      core.setOutput('fixes-applied', String(applied.length));
      core.info(`Applied ${applied.length} fix(es).`);
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
