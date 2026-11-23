import { Command } from 'commander';
import {
  buildCoreRegistry,
  PullRequestBuilder,
  scanSource,
  scanMarkdown,
  scanComponents,
  dedupeFixFiles,
  canonicalizeLangTag,
} from '@a11y-fixer/core';
import type { A11yViolation } from '@a11y-fixer/core';
import path from 'node:path';

type Registry = ReturnType<typeof buildCoreRegistry>;

interface AIOptions {
  anthropicApiKey?: string;
  aiProvider?: string;
  aiModel?: string;
  aiApiKey?: string;
}

/**
 * Pick the fixer registry. By default this is the deterministic, dependency-free
 * {@link buildCoreRegistry} (rule-based fixers only, including the two Markdown
 * source fixers `md-heading-order` and `md-table-header`).
 *
 * When an AI key is supplied (via `--anthropic-api-key` / `--ai-api-key` or the
 * env vars `resolveAIConfig` reads) we upgrade to the paid `@a11y-fixer/ai`
 * package's {@link buildFullRegistry}, which adds the AI-assisted Markdown fixers
 * (`md-image-alt`, `md-html-img-alt`, `md-link-text`) plus every HTML/JSX AI
 * fixer. `@a11y-fixer/ai` is an optional dependency, so a free install that never
 * provides a key stays entirely deterministic and never loads it.
 */
async function buildRegistry(rootDir: string, opts: AIOptions & { lang?: string }): Promise<Registry> {
  // Bridge the CLI flags onto the env vars `resolveAIConfig` reads so a key can
  // come from either place (flags win).
  if (opts.anthropicApiKey) process.env['ANTHROPIC_API_KEY'] = opts.anthropicApiKey;
  if (opts.aiProvider) process.env['A11Y_AI_PROVIDER'] = opts.aiProvider;
  if (opts.aiModel) process.env['A11Y_AI_MODEL'] = opts.aiModel;
  if (opts.aiApiKey) process.env['A11Y_AI_API_KEY'] = opts.aiApiKey;

  const aiRequested = Boolean(
    opts.anthropicApiKey || opts.aiApiKey || opts.aiProvider ||
    process.env['ANTHROPIC_API_KEY'] || process.env['A11Y_AI_API_KEY'] ||
    process.env['OPENAI_API_KEY'] || process.env['GOOGLE_GENERATIVE_AI_API_KEY'],
  );

  if (!aiRequested) {
    return buildCoreRegistry(rootDir, { lang: opts.lang });
  }

  let ai: typeof import('@a11y-fixer/ai');
  try {
    ai = await import('@a11y-fixer/ai');
  } catch {
    console.warn(
      '⚠ AI fixing was requested but the optional "@a11y-fixer/ai" package is not installed.\n' +
      '  Install it (npm i @a11y-fixer/ai) to enable AI-assisted fixes such as Markdown\n' +
      '  image alt text and link text. Falling back to deterministic fixers only.',
    );
    return buildCoreRegistry(rootDir, { lang: opts.lang });
  }

  const cfg = ai.resolveAIConfig();
  if (!cfg.apiKey) {
    // AI package present but no key resolved — stay deterministic rather than
    // build a registry whose AI fixers would fail on every call.
    return buildCoreRegistry(rootDir, { lang: opts.lang });
  }
  const provider = new ai.AISDKProvider(cfg);
  return ai.buildFullRegistry(provider, rootDir);
}

export function fixCommand(): Command {
  return new Command('fix')
    .description('Fix accessibility violations and open an annotated PR')
    .argument('<dir>', 'Directory to fix')
    .option('--url <url>', 'URL to scan with axe-core (requires puppeteer)')
    .option('--html', 'Fix static .html/.htm files with axe-core (requires puppeteer)', false)
    .option('--markdown', 'Also fix .md/.markdown/.mdx files (static source; no browser required)', false)
    .option('--components', 'Also fix .vue/.svelte/.astro template markup with axe-core (requires puppeteer)', false)
    .option('--owner <owner>', 'GitHub repo owner (required for PR)')
    .option('--repo <repo>', 'GitHub repo name (required for PR)')
    .option('--base <branch>', 'Base branch for PR', 'main')
    .option('--repo-root <path>', 'Git repo root for PR paths (defaults to cwd)')
    .option('--lang <tag>', 'BCP-47 language tag to stamp on <html> when lang is missing (else auto-detected)')
    .option('--anthropic-api-key <key>', 'Anthropic API key — enables AI-assisted fixers (requires @a11y-fixer/ai)')
    .option('--ai-provider <name>', 'AI provider for AI-assisted fixers: anthropic | openai | google')
    .option('--ai-model <model>', 'Model id for the chosen AI provider (defaults to the provider default)')
    .option('--ai-api-key <key>', 'Generic AI provider API key (alternative to --anthropic-api-key)')
    .option('--dry-run', 'Print fixes without applying or creating PR', false)
    .action(async (dir: string, opts: {
      url?: string;
      html: boolean;
      markdown: boolean;
      components: boolean;
      owner?: string;
      repo?: string;
      base: string;
      repoRoot?: string;
      lang?: string;
      anthropicApiKey?: string;
      aiProvider?: string;
      aiModel?: string;
      aiApiKey?: string;
      dryRun: boolean;
    }) => {
      const rootDir = path.resolve(dir);

      // Runs the base scan and merges Markdown violations when --markdown is set.
      const scan = async (): Promise<A11yViolation[]> => {
        const base = await scanSource(rootDir, { url: opts.url, html: opts.html });
        return [
          ...base,
          ...(opts.markdown ? await scanMarkdown(rootDir) : []),
          ...(opts.components ? await scanComponents(rootDir) : []),
        ];
      };

      // Fail fast on a malformed --lang before scanning anything.
      if (opts.lang !== undefined && canonicalizeLangTag(opts.lang) === null) {
        console.error(`Invalid --lang value "${opts.lang}": not a valid BCP-47 language tag.`);
        process.exitCode = 1;
        return;
      }

      // Deterministic fixers by default; upgrades to the paid @a11y-fixer/ai
      // registry when an AI key is supplied (otherwise the AI-assisted rules
      // fall through to the "human review needed" path below).
      const registry = await buildRegistry(rootDir, opts);

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
