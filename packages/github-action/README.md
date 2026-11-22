# @a11y-fixer/github-action

The composite **GitHub Action** that runs a11y-fixer in your CI: it scans for
accessibility (WCAG) violations, reports them the way you already read results,
and in `fix` mode opens an annotated PR with AI-assisted fixes.

> **Private, source-available (BSL).** Not published to npm — it's consumed as a
> GitHub Action (`a11y-fixer/a11y-fixer@v1`), not a package. See the root
> [`LICENSE`](../../LICENSE).

## Usage

The Action is defined by [`action.yml`](../../action.yml) at the repo root, which
runs the committed bundle `packages/github-action/dist/index.js`.

```yaml
- uses: a11y-fixer/a11y-fixer@v1
  with:
    mode: fix
    license-key: ${{ secrets.A11Y_FIXER_LICENSE_KEY }}
    anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

**`action.yml` is the authoritative reference for all inputs and outputs** —
including `mode`, `dir`, `html`, `markdown`, the `ai-provider` / `ai-model` /
`ai-api-key` BYOK trio, `cache-file`, and `learning`. See the root
[`README.md`](../../README.md) for worked examples (permissions, LLM provider
choice, AI cost caching, learning).

## Modes

- **`check`** (default, CI gate) — fails the job if any violations remain.
- **`scan`** — reports violations (and emits the `violations` JSON output).
- **`fix`** — applies AI-assisted fixes behind a verify-then-revert gate and
  opens a PR. Static source only (JSX/HTML/Markdown); live `url` fix is rejected.

## Reporting

GitHub-native, best-effort (a missing permission logs a warning, never fails an
otherwise-successful run):

- A **Check Run** named `a11y-fixer` whose `output.text` embeds a machine-readable
  `ScanReport` (`schema: a11y-fixer.scan/1`) the control plane ingests.
- Inline **annotations** on the offending lines (batched).
- One **sticky PR comment** (upserted, keyed by an HTML marker), showing the
  before→after delta in `fix` mode.
- On **public repos only**, violations are also uploaded as **SARIF** to the
  Security tab (code scanning) — needs no GitHub Advanced Security. Private repos
  skip SARIF (GitHub only ingests it there with paid Code Security).

## Licensing

Private repos require a valid license key; **public repos run free** without one.
License verification is **fully offline** (`src/license.ts` embeds the Ed25519
public key) — no phone-home. Keys are minted by
[`@a11y-fixer/licensing`](../licensing).

## The committed bundle

`dist/` is a committed [`@vercel/ncc`](https://github.com/vercel/ncc) bundle so a
SHA-pinned `uses:` always corresponds to reviewed source. Rebuild it after
touching this package or anything it bundles (including `core`):

```sh
pnpm --filter @a11y-fixer/github-action run build
```

CI fails if the committed `dist/` is out of date, and the release workflow
re-verifies it before moving the floating `v1` tag.

## License

Business Source License 1.1 (see the root [`LICENSE`](../../LICENSE)).
