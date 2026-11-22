# Contributing

This is a pnpm monorepo with six packages:

| Package | npm | License | What it is |
|---|---|---|---|
| `packages/core` | `@a11y-fixer/core` | MIT | Free deterministic engine: scanners (JSX/HTML/Markdown), WCAG map, rule-based fixers, baselines, `PullRequestBuilder` |
| `packages/cli` | `@a11y-fixer/cli` | MIT | Free CLI over `core` |
| `packages/ai` | `@a11y-fixer/ai` | BSL (private) | Multi-provider LLM layer + AI-assisted fixers |
| `packages/github-action` | `@a11y-fixer/github-action` | BSL (private) | The composite GitHub Action |
| `packages/licensing` | `@a11y-fixer/licensing` | MIT (private) | The single Ed25519 license-minting source of truth (`signLicense`) |
| `packages/app` | `@a11y-fixer/app` | UNLICENSED (private) | Hosted GitHub App control plane: Check Run ingest + cross-repo dashboard + Marketplace billing |

`ai` and `github-action` depend on `core` via `workspace:*`. `core` and `cli`
are the only packages published to npm; `ai`, `github-action`, `licensing`, and
`app` are `private`. (`benchmarks/*` are workspace packages too, but they are
test harnesses, not shipped code.)

## Setup

```sh
pnpm install
pnpm -r build
pnpm -r coverage   # runs every package's tests + coverage gates
```

The `core` axe detector test drives a real headless Chrome. If it can't find a
browser, install one: `node "$(find node_modules/.pnpm -maxdepth 4 -path '*puppeteer/install.mjs' | head -1)"`.

## Where a new fixer goes (the placement rule)

Decide by **how the fix content is produced**, not by which rule triggered it:

- **Deterministic / rule-based** — the corrected markup is computable from the
  source alone (e.g. add a missing `type="button"`, associate a `<label>`).
  → `packages/core/src/fixer/rule-based/`, registered in
  `packages/core/src/fixer/registry.ts`. **MIT, free.**

- **Needs an LLM to generate content** — the fix requires judgment about
  human-meaningful text (alt text, link text, `aria-label` wording).
  → `packages/ai/src/fixers/`, registered in
  `packages/ai/src/fixers/registry.ts`. **Paid.** `buildFullRegistry` layers
  these ahead of the deterministic core fixers.

When two fixers' `canFix` could match the same violation, the AI registry wins
by being layered first — keep that ordering intentional, and prefer a single
owner per violation id.

## Fixture discipline

No new fixer lands without a planted violation that proves it:

- Unit-level fixtures for scanners/fixers live beside their tests and in
  `tests/fixtures/` (shared across `core` and `cli`).
- A user-visible fixer should also gain a deliberately-broken case in
  [`examples/demo-site/`](./examples/demo-site/) so the end-to-end demo
  exercises it.

## Before you open a PR

```sh
pnpm -r build && pnpm -r coverage
pnpm --filter @a11y-fixer/github-action run build   # rebuild the committed ncc bundle
```

CI fails if `packages/github-action/dist/` is out of date, so commit the rebuilt
bundle whenever you touch `github-action` or anything it bundles (including
`core`). Coverage thresholds live in each package's `vitest.config.ts`.

## Versioning & release

`core` and `cli` version in lockstep. Bump both `packages/{core,cli}/package.json`,
then publishing a GitHub Release runs `.github/workflows/release.yml`, which
publishes both to npm via OIDC Trusted Publishing and moves the Action's floating
`v1` tag. Each publish step is idempotent (skips a version already on npm).
