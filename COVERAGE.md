# Coverage: what we fix vs. what we only detect

**Scope in one line:** the fixers target **accessible-name, alt-text and title**
problems — **16 AI fixers** covering **~16 axe-core rule IDs** across **5 WCAG
success criteria** (1.1.1, 1.3.1, 2.4.2, 2.4.4, 4.1.2), plus the deterministic
fixers inherited from [`@a11y-fixer/core`](https://www.npmjs.com/package/@a11y-fixer/core).
Everything else axe-core and `jsx-a11y` surface is **detected but not
auto-fixed** — see [Detected but not fixable](#detected-but-not-fixable).

This file is the human-readable coverage map. The machine-checked sources of
truth are the fixer registry
([`packages/ai/src/fixers/registry.ts`](./packages/ai/src/fixers/registry.ts))
and the benchmark's `COVERED_RULES`
([`benchmarks/act-detection/rules.mjs`](./benchmarks/act-detection/rules.mjs)).
**When you add a fixer, update this table, `rules.mjs`, and both benchmark
baselines.**

## What we can fix

Every AI fixer, the axe rule ID it claims, how it matches (`id ===` is
rule-specific; `wcagId ===` is a broad catch-all that also absorbs the
`jsx-a11y` equivalents on the JSX path), and the scan path that surfaces it.

| WCAG | Fixer | File | Matches | Scan path |
|---|---|---|---|---|
| 1.1.1 | `AltTextFixer` | `alt-text.ts` | `wcagId === '1.1.1'` (axe `image-alt` + `jsx-a11y` alt rules) | HTML + JSX |
| 1.1.1 | `InputImageAltFixer` | `input-image-alt.ts` | `id === 'input-image-alt'` | HTML |
| 1.1.1 | `AreaAltFixer` | `area-alt.ts` | `id === 'area-alt'` | HTML |
| 1.1.1 | `ObjectAltFixer` | `object-alt.ts` | `id === 'object-alt'` | HTML |
| 1.1.1 | `SvgImgAltFixer` | `svg-img-alt.ts` | `id === 'svg-img-alt'` | HTML |
| 1.3.1 | `FormLabelFixer` | `form-label.ts` | `id === 'label'` | HTML |
| 1.3.1 | `SelectNameFixer` | `select-name.ts` | `id === 'select-name'` | HTML |
| 1.3.1 | `AriaInputFieldNameFixer` | `aria-input-field-name.ts` | `id === 'aria-input-field-name'` | HTML |
| 1.3.1 | `AriaToggleFieldNameFixer` | `aria-toggle-field-name.ts` | `id === 'aria-toggle-field-name'` | HTML |
| 2.4.2 | `DocumentTitleFixer` | `document-title.ts` | `id === 'document-title'` | HTML |
| 2.4.4 | `LinkNameFixer` | `link-name.ts` | `id === 'link-name'` | HTML |
| 2.4.4 | `LinkTextFixer` | `link-text.ts` | `wcagId === '2.4.4'` (`jsx-a11y` `anchor-has-content`; usually **human-flags**) | JSX |
| 4.1.2 | `ButtonNameFixer` | `button-name.ts` | `id === 'button-name'` | HTML |
| 4.1.2 | `InputButtonNameFixer` | `input-button-name.ts` | `id === 'input-button-name'` | HTML |
| 4.1.2 | `AriaCommandNameFixer` | `aria-command-name.ts` | `id === 'aria-command-name'` | HTML |
| 4.1.2 | `FrameTitleFixer` | `frame-title.ts` | `id === 'frame-title'` | HTML |

Fixers all live in [`packages/ai/src/fixers/`](./packages/ai/src/fixers/).
`element-tag.ts` and `source-line.ts` in that directory are shared helpers, not
fixers. On top of the table above, `registerCoreFixers()` adds the deterministic
ESLint/core fixers from `@a11y-fixer/core`.

When a fixer can't safely apply a change — no source location, a conflicting
`role` (e.g. `role="none"` on an empty link), a missing `<head>`, or no API key
— it **human-flags** the violation instead of guessing. A human-flag still
counts the rule as "covered"; it just routes that instance to a person.

## Detected but not fixable

Detection runs the real scanner, `scanSource()` from `@a11y-fixer/core`, over one
of two **disjoint** paths per run:

- **HTML path** (`html: true`): **axe-core** (~90+ rules) against rendered HTML.
- **JSX path** (default): **ESLint + `jsx-a11y`** (~30+ rules).

So the tool *detects* far more than it fixes. The fixers cover only the
accessible-name slice above; everything else is reported but left for a human.
Out-of-scope **categories** (not auto-fixed) include:

- Color contrast
- Keyboard / focus order / focus-visible
- ARIA validity & structure (roles, required attributes, parent/child)
- Heading and landmark structure
- Tables (headers, captions)
- Page language / `lang` attributes
- Timing, motion, autoplay
- Duplicate IDs, bypass blocks, and the rest of the axe/jsx-a11y catalog

The exact detect-universe is **not enumerated in this repo** — it lives in the
external `@a11y-fixer/core` package (and ultimately axe-core / `jsx-a11y`), and
it shifts with their versions. We deliberately track the *fixable* set
precisely and the *unfixable* set by category rather than rule-by-rule.

## The scan-path caveat (real-world coverage)

Fix mode is **static-only and single-path per run** — see
[`packages/github-action/src/index.ts`](./packages/github-action/src/index.ts).
The two paths emit different rule IDs for the same WCAG criterion (axe
`link-name` vs. `jsx-a11y` `anchor-has-content`, both 2.4.4), which is why the
registry carries both id-keyed and broad wcagId-keyed fixers.

Practically:

- **HTML/axe path** auto-fixes the full set above (13 rules auto-applied).
- **JSX path** effectively only auto-fixes **alt-text**, and human-flags
  link-text.

So the fixable coverage on any given repo is **whichever single path you ran**,
not the union. The [demo site](./examples/demo-site/) ships two separate jobs for
exactly this reason.

## Benchmarked quality

Both benchmarks drive the real scanner against the
[W3C ACT Rules test cases](https://act-rules.github.io/), scoped to the covered
accessible-name rules, and gate on committed baselines. See
[`benchmarks/README.md`](./benchmarks/README.md).

- **Detection** (`act-detection/baseline.json`, snapshot 2026-11-15):
  **tp 32 · fp 0 · fn 3** across the 6 covered ACT rule groups. The 3 false
  negatives are documented axe scope gaps (e.g. `<div role="img">`
  CSS-background images), not missing fixers.
- **Fix clearance** (`fix-clearance/baseline.json`): of **32** detected
  violations, **31 cleared, 0 introduced**. The one non-clear is correct
  behavior — the `role="none"` link that `LinkNameFixer` human-flags rather than
  adding a prohibited `aria-label`.

## Sync notes & known gaps

- `COVERED_RULES` in `rules.mjs` tracks **6 ACT accessible-name rule groups**.
  `DocumentTitleFixer` (2.4.2) ships in the registry but has **no row there**:
  the vendored ACT corpus has no `document-title` fixtures, so adding an ACT row
  would break the detection benchmark. It is tracked here instead.
- `AreaAltFixer`, `ObjectAltFixer`, `SvgImgAltFixer`, and `AriaCommandNameFixer`
  are in the registry but, like `document-title`, are not individually
  represented in the ACT corpus; they're covered here.
- When a fixer is added: update the table above, add its ACT rule to `rules.mjs`
  **if** the corpus has fixtures for it, and refresh both benchmark baselines.
