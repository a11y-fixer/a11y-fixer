# a11y-fixer — Launch & Growth Plan

## Context

`a11y-fixer` is a working accessibility auto-fixer built as a pnpm/TS monorepo:

- **`@a11y-fixer/core`** — detects WCAG violations via axe-core + puppeteer (live URLs / static HTML) and eslint-plugin-jsx-a11y (static React/JSX), maps each finding back to the source line, and fixes it with rules or with Claude for judgment calls (alt-text, link-text, button-name, form-label). Opens PRs via octokit.
- **`@a11y-fixer/cli`** — `a11y-fixer scan | fix | check`.
- **`@a11y-fixer/github-action`** — `check` fails CI, `fix` opens a PR.

The product works. The bottleneck is **distribution, not polish**. The goal of this plan is to get real humans and AI coding agents using it quickly, while deferring all business/entity setup until there is repeat usage to justify it.

**Core premise correction driving this plan:** for a dev tool, being public *is* the growth engine. A private repo, an unpublished npm package, and a Marketplace listing that doesn't exist have a structural zero ceiling on adoption. "Polish privately until fully ready" never converges because there is no feedback loop. So we flip public early with a tight wedge, and treat the README as the landing page.

**Explicitly deferred (not cut):** separate anonymous GitHub account, marketing landing page, hosted dashboard, paid tier, legal entity. Reasons below.

## North Star & metrics (decide before launch)

- **North Star: repos with the Action running in CI.** Recurring, sticky, hard to fake.
- **Secondary: npm weekly downloads** (`@a11y-fixer/cli`), **MCP installs**, **merged fix PRs**.
- **Not a North Star: GitHub stars.** Vanity; track but don't optimize.

## Identity decision (resolved)

- Brand the **project** as `a11y-fixer` now (repo name, `@a11y-fixer` npm scope already reserved, README).
- **Grab `a11y-fixer.com` + the gmail defensively this week**, then ignore them until Phase 3.
- **Keep publishing under your real (jajjer) GitHub account** until it's a business. A tool that opens PRs and asks for an Anthropic API key lives on trust; a brand-new anonymous account publishing exactly that reads as sketchy and *lowers* adoption. Split identity when there's a business to protect, not before.

## Phase 0 — Polish the wedge (still private, short)

Goal: scan → fix → PR is clean and trustworthy on real code before anyone sees it.

- Pick and commit to the wedge: **React/JSX accessibility in CI, auto-fix via PR**, using the four fixers you have (alt-text, link-text, button-name, form-label). Depth over breadth — do not chase every WCAG rule.
- Prove it end-to-end on **3-4 real OSS repos**: run `check`, run `fix`, inspect the PRs for correctness and taste. Fixes must be ones a maintainer would merge without edits.
- First-run UX: `npx @a11y-fixer/cli scan` with **zero config** produces a readable, satisfying report.
- Make failure modes honest: no API key → rule-based fixes still work and say so; no violations → clear success; puppeteer missing → clear message, not a stack trace.
- Write the README as the product's front door: one-line value prop, 15-second demo GIF (scan output + an opened PR), one-command quickstart, the "catches what your AI just wrote" framing.

**Go-public readiness checklist (all must be true):**
- [ ] `npx @a11y-fixer/cli scan` works from a clean machine with no config.
- [ ] A fix PR on a real repo is correct and merge-worthy (verified on ≥2 repos).
- [ ] README has value prop, demo GIF, quickstart, and the agent angle.
- [ ] LICENSE (MIT), CONTRIBUTING, and a SECURITY note (how the API key is handled) exist.
- [ ] CI is green and the Action builds (`ncc`) reproducibly.

## Phase 1 — Go public, minimal brand

- Flip the repo **public** as `a11y-fixer` under the jajjer account.
- **Publish to npm:** `@a11y-fixer/cli` and `@a11y-fixer/core`.
- **Publish the Action to GitHub Marketplace:** tag a release, complete the listing, add topics `accessibility`, `a11y`, `wcag`, `github-action`, `ci`.
- **Ship the agent surface (the wedge differentiator):**
  - New package `@a11y-fixer/mcp` — an MCP server exposing `scan` and `fix` as tools, reusing `@a11y-fixer/core` directly (no CLI shell-out). This is how Claude Code / Cursor / Codex call it mid-task.
  - A drop-in **`AGENTS.md` / `CLAUDE.md` / cursor-rule snippet** in the README: "run a11y-fixer before committing."
  - Frame the Action copy around AI-generated PRs: "Your AI writes inaccessible JSX. This catches it in the PR."
- Grab domain + gmail. Do **not** build a marketing site.

## Phase 2 — Seed traction

- **Dogfood into referrals:** open real, high-quality fix PRs on popular OSS repos **with maintainer buy-in**. Each merged PR is a credential, a referral, and public proof in their history. This is the highest-leverage early move — the fixes sell the tool.
- **One strong launch post**, not ten weak ones: "I built an AI that auto-fixes accessibility and opens the PR." Targets: Hacker News (Show HN), r/webdev, the web-a11y Slack, one or two a11y/dev newsletters (e.g. the Changelog, a11y weekly). Lead with the demo GIF and a live repo PR.
- Instrument the North Star: count repos running the Action (Marketplace insights + a lightweight opt-in ping, or infer from public workflow files), npm downloads, MCP installs.

## Phase 3 — Business, only on signal

Trigger: **repeat usage or inbound** (same repos re-running weekly, or people asking "can my team / private repos use this?"). Only then:

- Legal entity, separate `a11y-fixer` GitHub org, real landing page.
- Hosted dashboard (scan history, trends across repos).
- Paid tier: teams, private repos, usage-based on the AI fixes. Keep the CLI + public-repo Action free forever as the top of funnel.

## Critical files / new work

- New package: `packages/mcp/` → `@a11y-fixer/mcp` (MCP server over `@a11y-fixer/core`; mirror the CLI command wiring in `packages/cli/src/commands/`).
- `README.md` at repo root (does not exist yet) — the de facto landing page.
- `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md` at root.
- `packages/github-action/action.yml` — Marketplace-ready `branding` + description already most of the way there; add branding icon/color and release tagging.
- Reuse everything in `packages/core/src/` as-is; the MCP server is a thin new entry point, not a rewrite.

## Verification (how we know each phase worked)

- **Phase 0:** `npx @a11y-fixer/cli scan` on a fresh clone of a real repo returns a correct report; a `fix` PR is opened and is merge-worthy by inspection. `pnpm -r test` green.
- **Phase 1:** package installable from npm by a third party (`npx @a11y-fixer/cli@latest scan`); Action usable in a throwaway repo's workflow from the Marketplace; MCP server callable from a real agent (Claude Code) and it opens/returns a fix.
- **Phase 2:** at least one merged external fix PR; launch post live; North Star counter moving (non-zero repos in CI, non-zero npm downloads week over week).

## NOT in scope (deferred, with reason)

- Anonymous/new GitHub account — trust cost outweighs benefit until there's a business.
- Marketing landing page — README serves this role for a dev tool pre-traction.
- Hosted dashboard, paid tier, legal entity — gated on repeat-usage signal (Phase 3).
- Full WCAG rule coverage — depth on the four fixers first; expand on demand.
