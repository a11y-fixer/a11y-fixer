# @a11y-fixer/core

The deterministic engine behind [a11y-fixer](https://github.com/a11y-fixer/a11y-fixer):
detect accessibility (WCAG) violations in React/JSX and HTML source and apply
**rule-based, deterministic** fixes. No API keys, no AI.

Most users want the [`@a11y-fixer/cli`](https://www.npmjs.com/package/@a11y-fixer/cli)
instead. This package is the programmatic API for building your own tooling.

## Install

```sh
npm install @a11y-fixer/core
```

## Quick start

```ts
import { scanSource, buildCoreRegistry } from '@a11y-fixer/core';

const rootDir = process.cwd();

// 1. Find violations (static JSX/TSX by default).
const before = await scanSource(rootDir, {});

// 2. Apply the deterministic fixers.
const registry = buildCoreRegistry(rootDir);
const results = await registry.applyAll(before);

for (const r of results) {
  console.log(r.applied ? `fixed ${r.wcagId}` : `needs review: ${r.wcagId}`);
}
```

`scanSource` also accepts `{ html: true }` to scan `.html`/`.htm` files and
`{ url }` to scan a live page with axe-core (requires a browser via the optional
`puppeteer` peer dependency).

## What's exported

- **Scanning:** `scanSource`, `EslintRunner`, `HtmlFileRunner`, `PuppeteerRunner`,
  `AxeDetector`.
- **Fixing:** `FixerRegistry`, `buildCoreRegistry`, `registerCoreFixers`, the
  individual rule-based fixers (`HtmlLangFixer`, `ColorContrastFixer`,
  `TabindexFixer`, `MetaRefreshFixer`, `EslintFixer`, …), and `dedupeFixFiles`.
- **Source mapping:** `ReactJSXMapper`, `HtmlMapper`, `locateElementInHtml`.
- **PRs:** `PullRequestBuilder`.
- Types: `A11yViolation`, `A11yNode`, `Fixer`, `FixResult`, `FixerBucket`, etc.

## License

MIT
