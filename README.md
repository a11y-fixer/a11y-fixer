# a11y-fixer

**Source-available** tooling for [a11y-fixer](https://github.com/a11y-fixer/a11y-fixer):
the **AI-assisted** accessibility fixes and the **GitHub Action** that ships them.
**Free for everyone during early access.**

This is a **monorepo**. The free, deterministic engine and CLI live in
[`packages/core`](./packages/core) and [`packages/cli`](./packages/cli), are
**MIT-licensed**, and are published to npm as
[`@a11y-fixer/core`](https://www.npmjs.com/package/@a11y-fixer/core) and
[`@a11y-fixer/cli`](https://www.npmjs.com/package/@a11y-fixer/cli). The
AI-assisted fixers and the GitHub Action build on top of them (via
`workspace:*`), add value behind a license key, and are **source-available under
the BSL** — see [License & pricing](#license--pricing).

## License & pricing

The source here is available to read under the **Business Source License 1.1**
(see [`LICENSE`](./LICENSE)). During early access a11y-fixer is **free for every
repository.** Public repos run free with no key at all; private repos use a
**free** early-access license key you can get at <https://a11y-fixer.com>. Each
version converts to Apache-2.0 on its Change Date. Evaluation, testing, and
development use are free. We may introduce paid tiers later, with notice.

## Using the Action

```yaml
- uses: a11y-fixer/a11y-fixer@v1
  with:
    mode: fix
    license-key: ${{ secrets.A11Y_FIXER_LICENSE_KEY }}
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Store your license key as a repository (or org) secret. On a private repo,
without a valid key the action fails fast with a clear message — grab a free
early-access key at <https://a11y-fixer.com>; public repos run free without one.
See [`action.yml`](./action.yml) for all inputs and outputs.

### Required permissions

The Action reports results the way you already read them — a Check Run with
inline annotations and one sticky PR comment — and in `fix` mode opens a PR.
Grant the workflow (or the job) these permissions:

```yaml
permissions:
  contents: write        # fix mode: push the fix branch
  pull-requests: write   # open the PR and post the sticky comment
  checks: write          # publish the Check Run + inline annotations
  security-events: write # public repos: upload SARIF to the Security tab
```

Reporting is best-effort: a missing permission only logs a warning, it never
fails an otherwise-successful run (and it needs **no** GitHub Advanced Security).
For `check`/`scan` only (no PR), `contents: read` plus `checks: write` is enough.
Public repositories run free — no license key required.

On **public repositories** the Action also uploads violations as SARIF to the
**Security tab** (code scanning), so they appear as alerts alongside CodeQL and
Dependabot — grant `security-events: write` for this. It's automatic, needs no
configuration, and clears alerts again once the violations are fixed. Private
repositories skip SARIF entirely: GitHub only ingests it there with paid Code
Security, so the Action never attempts it (the Check Run, annotations, and
sticky comment still work everywhere).

### Choosing an LLM provider (bring your own key)

AI-assisted fixes default to Claude, but you can bring your own key for any
supported provider instead of adding an Anthropic key — handy if your org is
already standardized on OpenAI or Gemini:

```yaml
- uses: a11y-fixer/a11y-fixer@v1
  with:
    mode: fix
    license-key: ${{ secrets.A11Y_FIXER_LICENSE_KEY }}
    ai-provider: openai            # anthropic (default) | openai | google
    ai-model: gpt-4o-mini          # optional; a sensible default per provider
    ai-api-key: ${{ secrets.OPENAI_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

`anthropic-api-key` remains a shortcut for `ai-provider: anthropic`. Your key is
sent only to the provider you choose. Model ids are provider-specific.

## Security & pinning

**What runs in your CI.** This is a composite Action: it executes our committed
`packages/github-action/dist/index.js` in *your* runner with the secrets you pass
it — your `anthropic-api-key`, and in `fix` mode a `github-token` with
`contents: write` and `pull-requests: write` so it can push a branch and open a PR.
Reporting (the Check Run + inline annotations) also needs `checks: write`.
Setup also fetches [`browser-actions/setup-chrome`](https://github.com/browser-actions/setup-chrome)
and installs runtime deps via `scripts/install-action-runtime-deps.sh`. This is the
standard GitHub Action trust model — the same trust you extend to any `uses:` step.

**Pin to a commit SHA for stronger guarantees.** `@v1` is a *floating* major tag we
force-move to each new release, so it is convenient but mutable. For reproducible,
tamper-evident runs, pin to a full commit SHA instead:

```yaml
- uses: a11y-fixer/a11y-fixer@<full-commit-sha>  # immutable; replaces @v1
```

[Dependabot](https://docs.github.com/code-security/dependabot)'s `github-actions`
ecosystem can keep a pinned SHA up to date for you.

**Integrity guarantee.** The committed `dist/` bundle is rebuilt and diffed against
source on every PR in CI, and re-verified at release time before the `v1` tag is
moved — so a pinned SHA always corresponds to reviewed source, not a hand-edited
bundle. License verification is fully offline (Ed25519, see
[Issuing license keys](#issuing-license-keys-maintainers)): the Action makes no
license phone-home and sends your secrets nowhere but your chosen LLM provider
(Anthropic by default) and your own repo.

### Try it on the demo site

[`examples/demo-site/`](./examples/demo-site/) is a deliberately-broken site for
demoing the Action end-to-end. Its `seed.sh` publishes it to a standalone GitHub
repo where the workflow opens real fix PRs. The two core scan paths run **one
per run**, so the demo ships three jobs: a static-HTML site (`html: true`) that
auto-fixes alt-text, link-name, button-name, form-label, select-name,
input-button-name, input-image-alt, area-alt, object-alt, svg-img-alt,
aria-command-name, aria-input-field-name and aria-toggle-field-name; a JSX
page that auto-fixes alt-text and human-flags link-text; and a Markdown handbook
(`markdown: true`) that auto-fixes image alt text (inline, reference, and raw
`<img>`), non-descriptive link text, heading order, and empty table headers
directly in the `.md` source. The broken state lives on `main`
and each run opens a throwaway PR, so the demo is repeatable without re-cloning.

## Coverage

What the fixers auto-fix versus what the scanner only detects — the full table,
the scan-path caveat, and the benchmark numbers — is tracked in
[`COVERAGE.md`](./COVERAGE.md).

## AI cost controls

Identical AI requests (the same repeated "click here" link, the same logo image
across pages, the same icon button) cost at most one Anthropic call.
**Within a run** this deduplication is automatic — no configuration.

For savings **across runs**, point `cache-file` at a JSON file and persist it
with [`actions/cache`](https://github.com/actions/cache), keyed on your source
so the cache is reused until the code changes:

```yaml
- uses: actions/cache@v4
  with:
    path: .a11y-fixer-cache.json
    key: a11y-fixer-ai-${{ hashFiles('src/**') }}

- uses: a11y-fixer/a11y-fixer@v1
  with:
    mode: fix
    license-key: ${{ secrets.A11Y_FIXER_LICENSE_KEY }}
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    cache-file: .a11y-fixer-cache.json
```

## Learning from your reviews

In `mode: fix`, the Action learns your codebase's voice. Every AI fix that
survives the re-scan gate is recorded to a committed store
(`.a11y-fixer/learning.jsonl`). On later runs it reconciles each record against
your repo: a fix you merged as-is is an accepted example, and a fix you **edited
before merging** is captured as a correction — the richest signal. Those
accepted values are fed back as few-shot examples, so future alt text, link
text, and `aria-label`s match the style, tone, and length your team actually
ships. Correction rate falls the more you use it.

This happens **entirely inside your repo** — the store is committed alongside
your code and nothing about your corrections is sent anywhere. Commit
`.a11y-fixer/learning.jsonl` to keep the benefit; it compounds over time. Set
`learning: off` to disable.

## Packages

- **`packages/core`** (`@a11y-fixer/core`, **MIT**, published) — the free,
  deterministic engine: axe (HTML) + ESLint/jsx-a11y (JSX) scanners, the
  WCAG map, deterministic fixers, and the `PullRequestBuilder`.
- **`packages/cli`** (`@a11y-fixer/cli`, **MIT**, published) — the free CLI
  (`a11y-fixer scan|fix|check`) over `core`.
- **`packages/ai`** (`@a11y-fixer/ai`, **BSL**, private) — multi-provider LLM layer (Anthropic/OpenAI/Google via the Vercel AI SDK) + AI-assisted fixers
  (alt text, link text, button name, form label, link name, select name, input
  button name, input image alt, plus the Markdown alt-text and link-text fixers)
  and `buildFullRegistry`, which layers them ahead of the deterministic core
  fixers.
- **`packages/github-action`** (`@a11y-fixer/github-action`, **BSL**, private) —
  the composite Action. `action.yml` (repo root) runs the bundled
  `packages/github-action/dist/index.js`; `src/license.ts` enforces the key.
- **`packages/licensing`** (`@a11y-fixer/licensing`, **MIT**, private) — the
  single Ed25519 license-minting source of truth (`signLicense`); every issuer
  goes through it so no re-implementation drifts from what the Action verifies.
- **`packages/app`** (`@a11y-fixer/app`, private) — the hosted GitHub App control
  plane: it ingests the Action's Check Runs for a cross-repo **dashboard**,
  orchestrates multi-repo scans, drafts **conformance audits** (VPAT/ACR) from a
  repo's latest scan for human review before publishing — and generates four
  document kinds from a reviewed audit (VPAT/ACR, accessibility statement,
  remediation roadmap, and conformance letter; HTML, PDF, and DOCX; drafts are
  watermarked "not for distribution"). Publishing freezes an immutable revision
  served over a public, unguessable statement permalink, with a per-repo revision
  history. It sells seats via GitHub Marketplace and augments, not replaces, the
  CI Action. See
  [`packages/app/README.md`](./packages/app/README.md).

## Development

```sh
pnpm install
pnpm -r build
pnpm -r coverage
```

The Action's `dist/` is a committed `@vercel/ncc` bundle; rebuild it with
`pnpm --filter @a11y-fixer/github-action run build` and commit the result (CI
verifies it is up to date).

## Issuing license keys (maintainers)

Keys are Ed25519-signed tokens verified offline against the public key embedded
in `src/license.ts`. The private signing key is **never** committed. Mint a key:

```sh
node scripts/issue-license.mjs --sub "customer@example.com" --days 365 \
  --key /path/to/a11y-fixer-LICENSE-SIGNING-KEY.pem
```
