# a11y-fixer

Find **and deterministically fix** accessibility (WCAG) violations in your
React/JSX and HTML source — then open an annotated pull request with the fixes.
Rule-based and fully deterministic: no API keys, no AI.

## Packages

| Package | npm | What it is |
|---|---|---|
| `@a11y-fixer/cli` | [![npm](https://img.shields.io/npm/v/@a11y-fixer/cli.svg)](https://www.npmjs.com/package/@a11y-fixer/cli) | Command-line tool (`scan` / `check` / `fix`) |
| `@a11y-fixer/core` | [![npm](https://img.shields.io/npm/v/@a11y-fixer/core.svg)](https://www.npmjs.com/package/@a11y-fixer/core) | Programmatic engine (detectors + fixers) |

## Quick start

```sh
npx @a11y-fixer/cli scan ./src
```

Install globally for repeated use:

```sh
npm install -g @a11y-fixer/cli
a11y-fixer check ./src     # CI gate: exits 1 on violations
a11y-fixer fix ./src --dry-run
```

See [`packages/cli`](./packages/cli) and [`packages/core`](./packages/core) for
full usage and API docs.

## AI-assisted fixes

Violations without a deterministic fix (e.g. image alt text) are reported for
human review here. AI-assisted fixing and the GitHub Action that ships it are a
separate paid product — see
[a11y-fixer-pro](https://github.com/a11y-fixer/a11y-fixer-pro).

## Development

```sh
pnpm install
pnpm -r build
pnpm -r coverage
```

## License

MIT
