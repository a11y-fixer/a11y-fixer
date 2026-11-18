import path from 'node:path';
import type { A11yViolation } from '@a11y-fixer/core';

/**
 * GitHub-native reporting: turn accessibility violations into the surfaces a
 * developer already reads on a PR — inline annotations + a Check Run, and a
 * single sticky comment with the violations delta.
 *
 * None of this requires GitHub Advanced Security / Code Security: Check Runs
 * and PR comments render on every repo via a plain GITHUB_TOKEN (with
 * `checks: write` / `pull-requests: write` granted). The SARIF/Security-tab
 * path (which DOES depend on Code Security for private repos) is deliberately
 * out of scope here.
 */

/** A minimal REST surface, so this module is testable without a live octokit. */
export interface OctokitLike {
  rest: {
    checks: {
      create(params: Record<string, unknown>): Promise<{ data: { id: number } }>;
      update(params: Record<string, unknown>): Promise<unknown>;
    };
    issues: {
      listComments(params: Record<string, unknown>): Promise<{ data: Array<{ id: number; body?: string; user?: { type?: string } | null }> }>;
      createComment(params: Record<string, unknown>): Promise<unknown>;
      updateComment(params: Record<string, unknown>): Promise<unknown>;
    };
  };
}

/** A GitHub Checks API annotation (the fields we populate). */
export interface Annotation {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: 'failure' | 'warning' | 'notice';
  title: string;
  message: string;
  raw_details?: string;
}

/** Hidden marker that lets us find-and-update our one comment per PR. */
export const STICKY_MARKER = '<!-- a11y-fixer-report -->';

/** GitHub accepts at most this many annotations per checks API request. */
export const ANNOTATION_BATCH = 50;

/**
 * Cap on comment pages scanned to find our sticky comment. 20 pages × 100 = 2000
 * comments — far beyond any real PR — so we never loop unboundedly while still
 * finding an old sticky comment on a busy thread.
 */
export const STICKY_MAX_PAGES = 20;

const CHECK_RUN_NAME = 'a11y-fixer';

/** axe impact → GitHub annotation level. Critical/serious block; the rest warn. */
export function impactToLevel(impact: A11yViolation['impact']): Annotation['annotation_level'] {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'failure';
    case 'moderate':
      return 'warning';
    default:
      return 'notice';
  }
}

/**
 * Repo-root-relative, POSIX-separated path for a GitHub annotation. Scanners
 * stamp `sourceFile` as an absolute path (`path.resolve(dir)` + the file), but
 * the Checks API and workflow-command annotations only pin to the PR diff when
 * the path is relative to the repository root. On a runner that root is
 * `GITHUB_WORKSPACE`; locally it's the cwd. An already-relative path is returned
 * as-is (normalized), and a path outside the root falls back to its basename
 * rather than leaking a `../../…` escape.
 */
export function toRepoRelative(sourceFile: string): string {
  const root = process.env['GITHUB_WORKSPACE'] || process.cwd();
  const rel = path.isAbsolute(sourceFile) ? path.relative(root, sourceFile) : sourceFile;
  const posix = rel.split(path.sep).join('/');
  return posix.startsWith('../') ? path.basename(sourceFile) : posix;
}

/**
 * Flatten violations to inline annotations. Only nodes that carry a source
 * location (JSX/HTML static scans) can be annotated — URL-only scans don't map
 * back to source, so they produce no annotations (the Check Run summary still
 * reports them). Never throws.
 */
export function toAnnotations(violations: A11yViolation[]): Annotation[] {
  const annotations: Annotation[] = [];
  for (const v of violations) {
    for (const node of v.nodes ?? []) {
      if (!node.sourceFile || !node.sourceLine) continue;
      annotations.push({
        path: toRepoRelative(node.sourceFile),
        start_line: node.sourceLine,
        end_line: node.sourceLine,
        annotation_level: impactToLevel(v.impact),
        title: `${v.id} (WCAG ${v.wcagId})`,
        message: `${v.description}\n${v.helpUrl}`,
        raw_details: node.failureSummary || undefined,
      });
    }
  }
  return annotations;
}

function countByImpact(violations: A11yViolation[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const v of violations) counts[v.impact] = (counts[v.impact] ?? 0) + 1;
  return counts;
}

/**
 * Markdown body for the sticky PR comment and the Check Run summary. When
 * `after` is supplied (fix mode) it renders a before → after delta; otherwise
 * (check mode) it summarizes the current violations. Always carries the sticky
 * marker so the comment can be updated in place.
 */
export function summaryMarkdown(before: A11yViolation[], after?: A11yViolation[]): string {
  const lines: string[] = [STICKY_MARKER, '## a11y-fixer'];

  if (after) {
    const fixed = Math.max(before.length - after.length, 0);
    lines.push(
      '',
      `Accessibility violations: **${before.length} → ${after.length}** (${fixed} fixed).`,
    );
    if (after.length > 0) {
      lines.push('', 'Remaining:');
      for (const v of topViolations(after)) lines.push(`- ${v}`);
    } else {
      lines.push('', 'All detected violations were fixed. ✓');
    }
    return lines.join('\n');
  }

  if (before.length === 0) {
    lines.push('', 'No accessibility violations found. ✓');
    return lines.join('\n');
  }

  const counts = countByImpact(before);
  const byImpact = (['critical', 'serious', 'moderate', 'minor'] as const)
    .filter(k => counts[k])
    .map(k => `${counts[k]} ${k}`)
    .join(', ');
  lines.push(
    '',
    `Found **${before.length}** accessibility violation(s)${byImpact ? ` (${byImpact})` : ''}:`,
    '',
  );
  for (const v of topViolations(before)) lines.push(`- ${v}`);
  return lines.join('\n');
}

/** Up to 10 one-line violation descriptions, with a "+N more" tail. */
function topViolations(violations: A11yViolation[]): string[] {
  const head = violations.slice(0, 10).map(v => `\`${v.id}\` (WCAG ${v.wcagId}) — ${v.description}`);
  if (violations.length > 10) head.push(`…and ${violations.length - 10} more`);
  return head;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * Create a Check Run with inline annotations, batching to the API's 50-per-request
 * cap. Conclusion is `failure` when any violation remains, else `success`.
 */
export async function postCheckRun(
  octokit: OctokitLike,
  target: { owner: string; repo: string; sha: string },
  violations: A11yViolation[],
  opts: { neutral?: boolean } = {},
): Promise<void> {
  const annotations = toAnnotations(violations);
  const batches = chunk(annotations, ANNOTATION_BATCH);
  const summary = summaryMarkdown(violations);
  const output = {
    title:
      violations.length === 0
        ? 'No accessibility violations'
        : `${violations.length} accessibility violation(s)`,
    summary,
    annotations: batches[0] ?? [],
  };

  // `neutral` (fix mode): a report of what remains after auto-fixing, not a gate.
  // A `failure` conclusion here would become a red commit status on the PR head
  // and hard-block merges for anyone who marks `a11y-fixer` a required check — so
  // only `check` mode concludes failure; fix mode stays informational.
  const conclusion = opts.neutral
    ? 'neutral'
    : violations.length === 0
      ? 'success'
      : 'failure';

  // The create() call carries the first batch; a failure here means no Check Run
  // exists, so the caller's degraded fallback should take over — let it throw.
  const { data } = await octokit.rest.checks.create({
    owner: target.owner,
    repo: target.repo,
    name: CHECK_RUN_NAME,
    head_sha: target.sha,
    status: 'completed',
    conclusion,
    output,
  });

  // Remaining batches are additive: the Check Run already exists with the summary
  // and the first 50 annotations, so a transient failure on a later batch must NOT
  // throw — that would send the caller into its full workflow-command fallback and
  // duplicate everything the Check Run already shows. Lose the extra annotations
  // quietly instead; the summary still reports the full count.
  const extra = batches.slice(1);
  if (extra.length === 0) return;
  try {
    for (const batch of extra) {
      await octokit.rest.checks.update({
        owner: target.owner,
        repo: target.repo,
        check_run_id: data.id,
        output: { title: output.title, summary, annotations: batch },
      });
    }
  } catch {
    // Best-effort: the Check Run stands with its first batch; drop the rest.
  }
}

/**
 * Post or update the single a11y-fixer comment on a PR, keyed by STICKY_MARKER
 * so repeated runs never spam the thread.
 */
export async function upsertStickyComment(
  octokit: OctokitLike,
  target: { owner: string; repo: string; issueNumber: number },
  body: string,
): Promise<void> {
  // Find our prior comment across ALL pages, not just the first 100: on a
  // long-lived PR the sticky comment is old and would otherwise fall off page 1,
  // and we'd post a fresh comment every run — the exact spam the marker prevents.
  // Among marker-bearing comments, prefer one authored by a bot (the GITHUB_TOKEN
  // actor) so a human quoting the invisible HTML marker can't be hijacked.
  const marked: Array<{ id: number; user?: { type?: string } | null }> = [];
  let botMatch: { id: number } | undefined;
  for (let page = 1; page <= STICKY_MAX_PAGES && !botMatch; page++) {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: target.owner,
      repo: target.repo,
      issue_number: target.issueNumber,
      per_page: 100,
      page,
    });
    for (const c of comments) {
      if (!c.body?.includes(STICKY_MARKER)) continue;
      marked.push(c);
      if (c.user?.type === 'Bot') { botMatch = c; break; }
    }
    if (comments.length < 100) break; // last page reached
  }
  // A bot-authored marker is definitely ours; otherwise fall back to the first
  // marker-bearing comment (covers a PAT-token actor, which isn't a Bot).
  const existing = botMatch ?? marked[0];
  if (existing) {
    await octokit.rest.issues.updateComment({
      owner: target.owner,
      repo: target.repo,
      comment_id: existing.id,
      body,
    });
  } else {
    await octokit.rest.issues.createComment({
      owner: target.owner,
      repo: target.repo,
      issue_number: target.issueNumber,
      body,
    });
  }
}
