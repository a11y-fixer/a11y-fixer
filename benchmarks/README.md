# Benchmarks

Two benchmarks measure the product against the **W3C ACT Rules test cases** — the
standard conformance corpus — scoped to the accessibility-name rules the fixers
cover (image/button/link/form-field names). Both drive the *real* scanner
(`scanSource`, the same call the Action uses) and gate on a committed baseline so
CI fails on a regression, not on the absolute (and legitimately imperfect) numbers.

| | What it measures | Provider | CI |
|---|---|---|---|
| `act-detection` | Does the scanner fire on `failed` cases and stay silent on `passed`/`inapplicable` ones? (precision / recall) | none | gated |
| `fix-clearance` | Of the violations we detect, how many do the fixers actually clear on re-scan, without introducing new ones? (clear-rate) | fake (deterministic) by default; `--real` for fix-similarity | gated |

Both need **Chrome** (puppeteer) for the HTML scan path:
`node node_modules/puppeteer/install.mjs` (CI downloads it in the `benchmarks` job).

## Covered rules

`act-detection/rules.mjs` is the single source of truth: it maps each covered ACT
rule to the axe rule id(s) the scanner emits. A single ACT rule (e.g. "Form field
has a name") is split by axe across several rules (`label`, `select-name`, the
`aria-*-field-name` rules), and the product ships a fixer for each — so a case
counts as detected if any of them fires. **When a fixer is added for a new axe
accessible-name rule, add its ACT rule here.**

## Running

```sh
pnpm bench:detect        # precision/recall vs ACT, gated on baseline.json
pnpm bench:fix           # clear-rate, deterministic, gated on baseline.json
pnpm bench:fix -- --real # same, but with the Anthropic provider (needs ANTHROPIC_API_KEY)
```

Each writes a `results.json` (gitignored) and compares it to the committed
`baseline.json`. To accept a new baseline (e.g. after a core bump that legitimately
changes detection), review the diff and copy `results.json` → `baseline.json`.

## Refreshing the ACT corpus

Fixtures are vendored under `act-detection/fixtures/` (pinned snapshot +
`manifest.json`) so runs are deterministic and offline. To re-pin to the current
ACT suite:

```sh
pnpm --filter @a11y-fixer/bench-act-detection run fetch
```

Then re-run both benchmarks and, if the changes are expected, refresh both
baselines. Source: <https://act-rules.github.io/testcases.json>
(license: <https://act-rules.github.io/pages/license/>).

## What the baselines currently encode

`act-detection`: **0 false positives** across all covered rules; a few false
negatives that are genuine, documented axe scope gaps rather than harness bugs —
e.g. `<div role="img">` CSS-background images, which ACT flags but axe's
`image-alt` rule (scoped to real `<img>`/image inputs) does not.

`fix-clearance`: the fixers clear every violation they detect **without
introducing a new one** (`introduced-new = 0` is gated). The one remaining
non-clear is correct behavior, not a bug: on `<a href role="none">` the
`role="none"` both hides the link's name and prohibits `aria-label`, so
`LinkNameFixer` now human-flags it (removing the conflicting role is a human
decision) instead of adding a label. This case is exactly what first exposed the
`introduced-new` gate — before the fix, the fixer added an `aria-label` and
traded `link-name` for `aria-prohibited-attr`; see `link-name.ts` and its test.

## Extending the fix benchmark with AccessGuru

`fix-clearance` reuses the ACT `failed` cases as a single-violation fix corpus
because clear-rate needs only a re-scan, not a reference fix. To score fix
*similarity* against human-expert fixes, drop in the
[AccessGuru](https://arxiv.org/abs/2507.19549) corpus (snippets + expert fixes,
filtered to the covered rules) and compare `--real` output against the reference.
That path needs the real provider and is local/manual (token cost), not gated.
