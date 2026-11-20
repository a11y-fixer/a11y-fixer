import * as core from '@actions/core';
import * as github from '@actions/github';
import {
  PullRequestBuilder,
  scanSource,
  dedupeFixFiles,
} from '@a11y-fixer/core';
import type { A11yViolation, FixResult } from '@a11y-fixer/core';
import { buildFullRegistry, AISDKProvider, resolveAIConfig, CachingProvider, LearningProvider, scanMarkdown } from '@a11y-fixer/ai';
import type { CookieParam } from 'puppeteer-core';
import { scanWithCookies } from './cookies-scanner.js';
import { verifyLicenseKey } from './license.js';
import { verifyFixes, snapshotFiles } from './verify-fixes.js';
import {
  DEFAULT_STORE_PATH,
  readStore,
  writeStore,
  reconcile,
  recordProposals,
  loadExamples,
  makeFileReader,
} from './learning-store.js';
import {
  postCheckRun,
  upsertStickyComment,
  summaryMarkdown,
  toAnnotations,
  type OctokitLike,
} from './report.js';
import { uploadSarif, type SarifOctokitLike } from './sarif.js';
import path from 'node:path';

/** PR number from the event payload, when this run is on a pull request. */
function pullRequestNumber(): number | undefined {
  const payload = github.context.payload as { pull_request?: { number?: number } };
  return payload.pull_request?.number;
}

/** True only when the event payload explicitly marks the repo as public. */
function repoIsPublic(): boolean {
  const payload = github.context.payload as { repository?: { private?: boolean } };
  return payload.repository?.private === false;
}

/**
 * The commit the Check Run should attach to. On a pull_request event
 * `context.sha` is the synthetic refs/pull/N/merge commit, and annotations
 * pinned there don't render on the PR's Files Changed view — so prefer the PR
 * head sha when the event carries one. Falls back to `context.sha` for push and
 * other events.
 */
function reportHeadSha(): string {
  const payload = github.context.payload as { pull_request?: { head?: { sha?: string } } };
  return payload.pull_request?.head?.sha ?? github.context.sha;
}

/**
 * Surface violations on the PR the way a developer already reads them: a Check
 * Run with inline annotations, plus one sticky comment carrying the summary.
 * Best-effort — a missing permission or API error only warns, it never fails an
 * otherwise-successful run (and needs no GitHub Advanced Security).
 */
async function reportToGitHub(
  violations: A11yViolation[],
  githubToken: string,
  comment: string,
  opts: { neutral?: boolean } = {},
): Promise<void> {
  if (!githubToken) return;
  // Everything here is best-effort: even constructing octokit or reading the repo
  // context must never throw out of this function, or it would fail a run whose
  // scan/fix/PR already succeeded. Guard the whole body, not just the API calls.
  let octokit: OctokitLike;
  let owner: string;
  let repo: string;
  try {
    octokit = github.getOctokit(githubToken) as unknown as OctokitLike;
    ({ owner, repo } = github.context.repo);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    core.warning(`Skipping a11y-fixer reporting (could not initialize the GitHub client): ${msg}`);
    return;
  }

  try {
    await postCheckRun(octokit, { owner, repo, sha: reportHeadSha() }, violations, { neutral: opts.neutral, prNumber: pullRequestNumber() ?? null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    core.warning(`Could not create the a11y-fixer check run (grant \`checks: write\`?): ${msg}`);
    // Degraded fallback: without `checks: write`, still surface each violation
    // inline on the diff via workflow-command annotations. GitHub renders at most
    // ~10 of these per run, but it beats a silent, annotation-free run. Respect
    // each annotation's level (failure → error, warning, notice).
    for (const a of toAnnotations(violations)) {
      const props = {
        title: a.title,
        file: a.path,
        startLine: a.start_line,
        endLine: a.end_line,
      };
      if (a.annotation_level === 'failure') core.error(a.message, props);
      else if (a.annotation_level === 'warning') core.warning(a.message, props);
      else core.notice(a.message, props);
    }
  }

  const prNumber = pullRequestNumber();
  if (prNumber !== undefined) {
    try {
      await upsertStickyComment(octokit, { owner, repo, issueNumber: prNumber }, comment);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      core.warning(`Could not post the a11y-fixer PR comment (grant \`pull-requests: write\`?): ${msg}`);
    }
  }

  // Phase 2 — SARIF to the Security tab. PUBLIC REPOS ONLY: private repos need
  // paid GitHub Code Security to ingest SARIF (the upload 403s otherwise), so we
  // don't even attempt it there — private customers see no change and no scary
  // warning. We upload even when there are zero violations, because an empty run
  // is what *clears* alerts the Security tab is still showing for fixed issues.
  if (repoIsPublic()) {
    try {
      // Unlike the Check Run (which pins to the PR *head* sha so annotations
      // render on Files Changed), the code-scanning API requires `commit_sha` to
      // be the commit that `ref` points to. `context.ref` + `context.sha` are
      // always a consistent pair — on a pull_request that's refs/pull/N/merge and
      // its merge commit; on push it's refs/heads/<branch> and its tip.
      await uploadSarif(
        octokit as unknown as SarifOctokitLike,
        { owner, repo, ref: github.context.ref, commitSha: github.context.sha },
        violations,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      core.warning(`Could not upload a11y-fixer SARIF to the Security tab (grant \`security-events: write\`?): ${msg}`);
    }
  }
}

/**
 * Runs the base scanner and, when `markdown` is set, concatenates the repo-local
 * Markdown scanner's violations. The base is `scanWithCookies` for an
 * authenticated URL scan, else core's `scanSource` (JSX/TSX, static HTML, or a
 * live URL). `@a11y-fixer/core` never sees `.md`, so Markdown support is added
 * here as a merge rather than a change to core. Markdown is static source, so it
 * participates in every mode (including the fix-mode re-scan) and regardless of
 * the base scanner — in particular a cookie-based URL scan still merges it.
 */
async function scanAll(
  rootDir: string,
  opts: { url?: string; html?: boolean; markdown?: boolean; cookies?: CookieParam[] },
): Promise<A11yViolation[]> {
  const base = opts.url && opts.cookies
    ? await scanWithCookies(rootDir, { url: opts.url, cookies: opts.cookies })
    : await scanSource(rootDir, { url: opts.url, html: opts.html });
  if (!opts.markdown) return base;
  const md = await scanMarkdown(rootDir);
  return [...base, ...md];
}

/**
 * Opens a PR with the applied fixes when running in a GitHub context with a
 * token. No-ops (with a log line) when nothing was applied, no files changed,
 * or no token is available — a missing PR must never fail an otherwise-successful
 * fix run.
 */
async function maybeOpenPR(
  fixes: FixResult[],
  before: A11yViolation[],
  after: A11yViolation[],
  applied: FixResult[],
  baseBranch: string,
  hasToken: boolean,
): Promise<void> {
  if (applied.length === 0) {
    core.info('No fixes were applied — skipping PR.');
    return;
  }
  if (!hasToken) {
    core.info('No github-token provided — skipping PR.');
    return;
  }

  const changedFiles = dedupeFixFiles(fixes);
  if (changedFiles.length === 0) {
    core.info('No files were changed — skipping PR.');
    return;
  }

  const { owner, repo } = github.context.repo;
  core.info(`Opening PR against ${owner}/${repo}@${baseBranch}...`);

  const prBuilder = new PullRequestBuilder({
    owner,
    repo,
    baseBranch,
    repoRoot: process.cwd(),
  });
  const pr = await prBuilder.createPR(fixes, before, after, changedFiles);

  core.setOutput('pr-url', pr.url);
  core.info(`PR created: ${pr.url}`);
}

/** Total number of learned examples across all buckets, for a log line. */
function examplesCount(examples: Record<string, string[] | undefined>): number {
  return Object.values(examples).reduce((n, v) => n + (v?.length ?? 0), 0);
}

export async function run(): Promise<void> {
  const dir = core.getInput('dir') || '.';
  const mode = core.getInput('mode') || 'check';
  const licenseKey = core.getInput('license-key');
  const githubToken = core.getInput('github-token');
  const anthropicKey = core.getInput('anthropic-api-key');
  // Generic LLM provider inputs. `anthropic-api-key` remains the Claude-specific
  // shortcut; these let a caller bring any supported provider's key instead.
  const aiProvider = core.getInput('ai-provider');
  const aiModel = core.getInput('ai-model');
  const aiApiKey = core.getInput('ai-api-key');
  // Defensively register every credential for log masking. GitHub already masks
  // values sourced from `secrets.*`, but this also redacts them if a caller
  // passes a literal, and masks any substring that leaks into a transformed
  // value or error message the action prints.
  if (licenseKey) core.setSecret(licenseKey);
  if (githubToken) core.setSecret(githubToken);
  if (anthropicKey) core.setSecret(anthropicKey);
  if (aiApiKey) core.setSecret(aiApiKey);
  const url = core.getInput('url');
  // getInput, not getBooleanInput: the latter throws when the input is absent
  // (e.g. older workflow files that predate this option).
  const html = core.getInput('html').toLowerCase() === 'true';
  // Static Markdown path: scan/fix `.md` image-alt and link-text issues. Like
  // `html`, getInput (not getBooleanInput) so an absent input doesn't throw.
  const markdown = core.getInput('markdown').toLowerCase() === 'true';
  const baseBranch = core.getInput('base-branch') || 'main';

  const cookiesRaw = core.getInput('cookies');
  let cookies: CookieParam[] | undefined;
  if (cookiesRaw) {
    try {
      cookies = JSON.parse(cookiesRaw) as CookieParam[];
    } catch (err) {
      // Never echo any substring of the raw input: it carries live session
      // tokens, and setFailed output lands in world-readable CI logs. Report
      // the shape we expected and the parser's error class only.
      const kind = err instanceof Error ? err.name : 'SyntaxError';
      core.setFailed(
        'Invalid `cookies` input: expected a JSON array of cookie objects ' +
        '(e.g. [{"name":"session","value":"abc","domain":"example.com"}]). ' +
        `JSON parse failed (${kind}).`,
      );
      return;
    }
    // Defensively mask every cookie value for log redaction (see the credential
    // setSecret block above). The parsed JSON is untrusted, so guard its shape.
    if (Array.isArray(cookies)) {
      for (const c of cookies) {
        const value = (c as { value?: unknown } | null)?.value;
        if (value) core.setSecret(String(value));
      }
    }
    if (!url) {
      core.warning('`cookies` is set but `url` is not — cookies are only used with URL scanning. Ignoring.');
    }
  }
  // Optional persistent AI cache. Empty = per-run in-memory dedup only.
  const cacheFile = core.getInput('cache-file') || undefined;
  // The local learning loop (fix mode): records accepted fixes to a committed
  // store and feeds them back as house-style examples. On by default; opt out
  // with `learning: off`. Never leaves the repo.
  const learningEnabled = (core.getInput('learning') || 'on').toLowerCase() !== 'off';

  // This is paid, source-available software. Two ways to run it:
  //   1. a valid license key (private/company repos — the paying buyer), or
  //   2. the free public-repo tier: any public GitHub repo runs it at no cost,
  //      which drives OSS adoption and mirrors GitHub giving public repos the
  //      full Security-tab experience for free anyway.
  // The free, deterministic engine also lives in @a11y-fixer/cli on npm.
  const license = verifyLicenseKey(licenseKey);
  const publicRepo = repoIsPublic();
  if (!license.valid && !publicRepo) {
    core.setFailed(
      `a11y-fixer requires a valid license key: ${license.reason}. ` +
      'Buy one at https://a11y-fixer.com and pass it via the `license-key` input ' +
      '(store it as a repository secret), or run it for free on any public repo. ' +
      'The free deterministic CLI is available as `@a11y-fixer/cli` on npm.',
    );
    return;
  }
  if (license.valid) {
    // Don't echo license.subject (a customer id/email) into CI logs — only the
    // non-identifying expiry date.
    core.info(`License valid (expires ${new Date((license.expires ?? 0) * 1000).toISOString().slice(0, 10)}).`);
  } else {
    core.info('Public repository — running under the free public-repo tier.');
  }

  if (anthropicKey) process.env['ANTHROPIC_API_KEY'] = anthropicKey;
  // Bridge the generic AI inputs to the env vars resolveAIConfig() reads. The
  // Claude-specific `anthropic-api-key` still works unchanged (it maps to the
  // default anthropic provider's native key above).
  if (aiProvider) process.env['A11Y_AI_PROVIDER'] = aiProvider;
  if (aiModel) process.env['A11Y_AI_MODEL'] = aiModel;
  if (aiApiKey) process.env['A11Y_AI_API_KEY'] = aiApiKey;
  if (githubToken) process.env['GITHUB_TOKEN'] = githubToken;

  const rootDir = path.resolve(dir);

  try {
    if (mode === 'check') {
      const violations = await scanAll(rootDir, { url, html, markdown, cookies });

      // Surface results on the PR (Check Run + inline annotations + sticky
      // comment) before deciding the job outcome. Best-effort, never fails here.
      await reportToGitHub(violations, githubToken, summaryMarkdown(violations));

      if (violations.length > 0) {
        const summary = violations
          .map(v => `WCAG ${v.wcagId}: ${v.description}`)
          .join('\n');
        core.setFailed(`Found ${violations.length} accessibility violation(s):\n${summary}`);
      } else {
        core.info('No accessibility violations found. ✓');
      }
    } else if (mode === 'scan') {
      const violations = await scanAll(rootDir, { url, html, markdown, cookies });
      core.setOutput('violations', JSON.stringify(violations));
      core.info(`Found ${violations.length} violation(s).`);
    } else if (mode === 'fix') {
      // URL scanning can't reliably map live DOM nodes back to repo source, so
      // fixers would no-op and no PR could be built. Fix mode is therefore
      // static-only (JSX/HTML); `url` is honored for scan/check only.
      if (url) {
        core.warning(
          'URL fix-mode is not supported: a live URL can\'t be mapped back to ' +
          'source, so no fixes can be applied. Use mode: scan/check with `url`, ' +
          'or mode: fix with static JSX/HTML. Ignoring `url` for this fix run.',
        );
      }
      // Learning loop: reconcile prior proposals against the repo's current
      // state (detecting human corrections), then feed accepted values back as
      // house-style examples. All local — no network.
      const storeFile = path.resolve(rootDir, DEFAULT_STORE_PATH);
      let learningRecords = learningEnabled ? await readStore(storeFile) : [];
      if (learningEnabled && learningRecords.length > 0) {
        learningRecords = await reconcile(learningRecords, makeFileReader(rootDir));
      }
      const examples = learningEnabled ? loadExamples(learningRecords) : {};

      // Wrap the provider so identical requests cost at most one API call:
      // in-memory dedup within this run, plus an optional cross-run disk cache.
      // LearningProvider sits *inside* the cache so injected examples are part of
      // the cached request and so it can observe every generation.
      const learningProvider = new LearningProvider(new AISDKProvider(resolveAIConfig()), examples);
      const aiProvider = new CachingProvider(learningProvider, { cacheFile });
      // Static-only (no PuppeteerRunner): the browser screenshot path exists
      // only for URL scans, which fix mode does not support.
      const registry = buildFullRegistry(aiProvider, rootDir);

      const before = await scanAll(rootDir, { html, markdown });
      // Capture pre-fix file contents so any fix we can't verify is reverted
      // cleanly rather than shipped. Must happen before applyAll mutates disk.
      const snapshot = await snapshotFiles(before);
      const fixes = await registry.applyAll(before);
      await aiProvider.save();
      const after = await scanAll(rootDir, { html, markdown });

      // Gate the re-scan: confirm each edited file's violations net-decreased and
      // that no fix introduced a new one. Files that fail are restored to their
      // pre-fix contents, so a cover-up or regression never reaches the PR.
      const report = await verifyFixes({
        before,
        after,
        fixes,
        changedFiles: dedupeFixFiles(fixes),
        snapshot,
        rescan: () => scanAll(rootDir, { html, markdown }),
      });
      const applied = report.verifiedFixes;

      core.setOutput('fixes-applied', String(applied.length));
      core.setOutput('fixes-reverted', String(report.revertedFixes.length));
      core.setOutput('regressions-detected', String(report.regressions.length));
      core.setOutput('violations-before', String(before.length));
      core.setOutput('violations-after', String(report.finalAfter.length));
      core.info(
        `Applied ${applied.length} verified fix(es); reverted ${report.revertedFiles.length} file(s) ` +
        `(${report.regressions.length} regression(s)). ` +
        `Violations: ${before.length} → ${report.finalAfter.length}.`,
      );
      for (const f of report.revertedFixes) {
        core.warning(
          `Reverted unverified fix (WCAG ${f.wcagId}) in ${f.sourceLocation?.file ?? 'unknown'}: ` +
          'the re-scan did not confirm it cleared its violation, or it introduced a new one.',
        );
      }

      // PR only the verified fixes. A reverted file is back at its pre-fix state,
      // so dedupeFixFiles inside maybeOpenPR sees no diff for it and drops it.
      await maybeOpenPR(applied, before, report.finalAfter, applied, baseBranch, Boolean(githubToken));
      // Leave a sticky before → after comment (and a Check Run on what remains)
      // on the triggering PR, if any. Fix mode reports informationally: the Check
      // Run is `neutral`, not `failure`, so it never hard-blocks a merge the way a
      // required `check`-mode gate would. Best-effort; never fails the run.
      await reportToGitHub(report.finalAfter, githubToken, summaryMarkdown(before, report.finalAfter), { neutral: true });

      // Close the loop: record each verified AI fix as a `proposed` learning
      // record (correlated to the generation that produced its value), then
      // persist the reconciled + extended store back to the repo. Best-effort —
      // a store write must never fail an otherwise-successful fix run.
      if (learningEnabled) {
        try {
          const additions = recordProposals(
            learningRecords,
            applied,
            learningProvider.drainGenerations(),
          );
          if (additions.length > 0 || learningRecords.some((r) => r.resolvedAt)) {
            await writeStore(storeFile, [...learningRecords, ...additions]);
            core.info(
              `Learning: ${additions.length} new proposal(s) recorded; ` +
              `${examplesCount(examples)} example(s) in play.`,
            );
          }
        } catch (err) {
          core.warning(
            `Learning store could not be updated: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

// Auto-invoke as the action entrypoint; suppressed under vitest, where the
// test drives run() explicitly with controlled inputs.
if (!process.env['VITEST']) run();
