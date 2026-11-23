# @a11y-fixer/core

The deterministic engine behind [a11y-fixer](https://github.com/a11y-fixer/a11y-fixer):
detect accessibility (WCAG) violations in React/JSX, HTML, and Markdown source
and apply **rule-based, deterministic** fixes. No API keys, no AI.

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
`puppeteer` peer dependency). For Markdown, call `scanMarkdown(rootDir)` (or
`scanContent` for a single string) to scan `.md`/`.markdown` source — image alt
text (inline, reference, raw `<img>`), non-descriptive link text, heading order,
and empty table headers — and merge the result onto a base scan.

## What's exported

- **Scanning:** `scanSource`, `scanMarkdown`, `scanContent`, `EslintRunner`,
  `HtmlFileRunner`, `PuppeteerRunner`, `AxeDetector`.
- **Fixing:** `FixerRegistry`, `buildCoreRegistry`, `registerCoreFixers`, the
  individual rule-based fixers (`HtmlLangFixer`, `ColorContrastFixer`,
  `TabindexFixer`, `MetaRefreshFixer`, `EslintFixer`, the Markdown fixers
  `MarkdownHeadingOrderFixer` and `MarkdownTableHeaderFixer`, …), and
  `dedupeFixFiles`.
- **Source mapping:** `ReactJSXMapper`, `HtmlMapper`, `locateElementInHtml`.
- **Baselines:** `loadBaseline`, `buildBaseline`, `saveBaseline`,
  `diffAgainstBaseline` (the `check`-gate baseline used by the CLI).
- **PRs:** `PullRequestBuilder`.
- **WCAG catalog:** `SUCCESS_CRITERIA` (the WCAG 2.1 + 2.2 Level A/AA
  success-criteria catalog, with titles, conformance levels, a standards
  cross-walk, and automated-coverage flags derived from the detector maps),
  `getSuccessCriterion`, `isKnownCriterion`, `criteriaWithAutomatedCoverage`,
  and `SECTION_508_INCORPORATION`. A criterion's `hasAutomatedCoverage` means
  a11y-fixer has at least one detector that fires for it — not that it is fully
  machine-verifiable.
- Types: `A11yViolation`, `A11yNode`, `Fixer`, `FixResult`, `FixerBucket`,
  `SuccessCriterion`, `ConformanceLevel`, `WcagVersion`, etc.

## License

MIT
