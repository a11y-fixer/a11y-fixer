# @a11y-fixer/cli

Command-line tool that finds **and deterministically fixes** accessibility
(WCAG) violations in your React/JSX and HTML source — then can open an annotated
pull request with the fixes.

Rule-based and fully deterministic: no API keys, no network calls, no AI. (The
optional AI-assisted fixes for things like image alt text live in a separate
paid product.)

## Install

```sh
npm install -g @a11y-fixer/cli
# or run without installing:
npx @a11y-fixer/cli --help
```

## Usage

```sh
a11y-fixer <command> <dir> [options]
```

### `scan` — report violations

```sh
a11y-fixer scan ./src
```

Options: `--static`, `--html` (scan `.html`/`.htm` with axe-core), `--url <url>`,
`--concurrency <n>`.

### `check` — CI gate

Exits with code `1` if any accessibility violations are found, so you can fail a
build on regressions.

```sh
a11y-fixer check ./src
```

Options: `--html`, `--url <url>`.

### `fix` — apply fixes (and optionally open a PR)

```sh
# preview without writing changes
a11y-fixer fix ./src --dry-run

# apply fixes and open a PR
a11y-fixer fix ./src --owner my-org --repo my-repo --base main
```

Options: `--dry-run`, `--owner <owner>`, `--repo <repo>`, `--base <branch>`,
`--repo-root <path>`, `--html`, `--url <url>`.

Violations with no deterministic fix are reported for human review rather than
guessed at.

## What it fixes

Deterministic fixers cover rules such as missing `lang`, invalid/ mismatched
`lang`, color contrast, `tabindex`, meta refresh, heading order, list structure,
and the auto-fixable `jsx-a11y` ESLint rules. See
[`@a11y-fixer/core`](https://www.npmjs.com/package/@a11y-fixer/core) for the
underlying engine.

## License

MIT
