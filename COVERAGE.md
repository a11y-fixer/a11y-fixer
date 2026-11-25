# Coverage: what we fix vs. what we only detect

**Scope in one line:** two fixer tiers. The paid **AI tier** targets
**accessible-name, alt-text and title** problems (**27 AI fixers** across WCAG
1.1.1, 1.3.1, 1.3.5, 2.4.2, 2.4.4, 4.1.2, plus 2 Markdown rules), and the free
**deterministic core tier** ([`@a11y-fixer/core`](https://www.npmjs.com/package/@a11y-fixer/core))
repairs a broad set of structural, language, contrast, keyboard, timing, motion,
ARIA-role/attribute/value hygiene, media-autoplay and list/table problems
rule-by-rule (no API key needed).
Everything else axe-core and `jsx-a11y` surface is **detected but not
auto-fixed** — see [Detected but not fixable](#detected-but-not-fixable).

This file is the human-readable coverage map. The machine-checked sources of
truth are the two registries —
[`packages/ai/src/fixers/registry.ts`](./packages/ai/src/fixers/registry.ts)
(`buildFullRegistry`) and
[`packages/core/src/fixer/defaults.ts`](./packages/core/src/fixer/defaults.ts)
(`registerCoreFixers`) — plus the benchmark's `COVERED_RULES`
([`benchmarks/act-detection/rules.mjs`](./benchmarks/act-detection/rules.mjs)).
**When you add a fixer, update the right table below, `rules.mjs` (if the ACT
corpus has fixtures), and both benchmark baselines.**

The effective fixable set is the **union** of the two tiers: the paid GitHub
Action registers the AI fixers first and then every core fixer, so AI fixers win
on overlap by registration order. The free OSS CLI ships the core tier alone.

## What we can fix — AI tier (`packages/ai/src/fixers/`)

Every AI fixer, the axe/scanner rule ID it claims, how it matches (`id ===` is
rule-specific; `wcagId ===` is a broad catch-all that also absorbs the
`jsx-a11y` equivalents on the JSX path), and the scan path that surfaces it.

| WCAG | Fixer | File | Matches | Scan path |
|---|---|---|---|---|
| 1.1.1 | `MarkdownAltTextFixer` | `markdown-alt-text.ts` | `id === 'md-image-alt'` or `'md-html-img-alt'` | Markdown |
| 1.1.1 | `AltTextFixer` | `alt-text.ts` | `wcagId === '1.1.1'` (axe `image-alt` + `jsx-a11y` alt rules) | HTML + JSX |
| 1.1.1 | `InputImageAltFixer` | `input-image-alt.ts` | `id === 'input-image-alt'` | HTML |
| 1.1.1 | `AreaAltFixer` | `area-alt.ts` | `id === 'area-alt'` | HTML |
| 1.1.1 | `ObjectAltFixer` | `object-alt.ts` | `id === 'object-alt'` | HTML |
| 1.1.1 | `SvgImgAltFixer` | `svg-img-alt.ts` | `id === 'svg-img-alt'` | HTML |
| 1.1.1 | `RoleImgAltFixer` | `role-img-alt.ts` | `id === 'role-img-alt'` | HTML |
| 1.1.1 | `AriaMeterNameFixer` | `aria-meter-name.ts` | `id === 'aria-meter-name'` | HTML |
| 1.1.1 | `AriaProgressbarNameFixer` | `aria-progressbar-name.ts` | `id === 'aria-progressbar-name'` | HTML |
| 1.3.1 | `FormLabelFixer` | `form-label.ts` | `id === 'label'` | HTML |
| 1.3.1 | `SelectNameFixer` | `select-name.ts` | `id === 'select-name'` | HTML |
| 1.3.1 | `AriaInputFieldNameFixer` | `aria-input-field-name.ts` | `id === 'aria-input-field-name'` | HTML |
| 1.3.1 | `AriaToggleFieldNameFixer` | `aria-toggle-field-name.ts` | `id === 'aria-toggle-field-name'` | HTML |
| 1.3.1 | `EmptyHeadingFixer` | `empty-heading.ts` | `id === 'empty-heading'` (AI-generated heading text) | HTML |
| 1.3.1 | `EmptyTableHeaderFixer` | `empty-table-header.ts` | `id === 'empty-table-header'` (AI-generated `<th>` text) | HTML |
| 1.3.5 | `AutocompleteValidFixer` | `autocomplete-valid.ts` | `id === 'autocomplete-valid'` (heuristic token correction; `rule-based` bucket) | HTML |
| 2.4.2 | `DocumentTitleFixer` | `document-title.ts` | `id === 'document-title'` | HTML |
| 2.4.4 | `MarkdownLinkTextFixer` | `markdown-link-text.ts` | `id === 'md-link-text'` | Markdown |
| 2.4.4 | `LinkNameFixer` | `link-name.ts` | `id === 'link-name'` | HTML |
| 2.4.4 | `LinkTextFixer` | `link-text.ts` | `wcagId === '2.4.4'` (`jsx-a11y` `anchor-has-content`; usually **human-flags**) | JSX |
| 4.1.2 | `ButtonNameFixer` | `button-name.ts` | `id === 'button-name'` | HTML |
| 4.1.2 | `InputButtonNameFixer` | `input-button-name.ts` | `id === 'input-button-name'` | HTML |
| 4.1.2 | `AriaCommandNameFixer` | `aria-command-name.ts` | `id === 'aria-command-name'` | HTML |
| 4.1.2 | `AriaTooltipNameFixer` | `aria-tooltip-name.ts` | `id === 'aria-tooltip-name'` | HTML |
| 4.1.2 | `AriaDialogNameFixer` | `aria-dialog-name.ts` | `id === 'aria-dialog-name'` | HTML |
| 4.1.2 | `FrameTitleFixer` | `frame-title.ts` | `id === 'frame-title'` | HTML |
| 4.1.2 | `FrameTitleUniqueFixer` | `frame-title-unique.ts` | `id === 'frame-title-unique'` (AI-generated distinct `<iframe>` title) | HTML |

The core-tier `ImageRedundantAltFixer` (`id === 'image-redundant-alt'`, 1.1.1) is
also registered in the AI block — ahead of the broad `AltTextFixer` — so the full
Action routes redundant-alt to the deterministic fixer; it is listed in the core
table below.

`element-tag.ts`, `source-line.ts` and `aria-named-widget.ts` in that directory
are shared helpers/base classes, not fixers.

## What we can fix — core tier (`packages/core/src/fixer/rule-based/`)

Deterministic, no API key. Registered by `registerCoreFixers()` and shipped in
the free OSS CLI; the paid Action layers these under the AI tier.

| WCAG | Fixer | File | Matches |
|---|---|---|---|
| 1.1.1 | `ImageAltFixer` | `image-alt.ts` | `id === 'image-alt'` / `jsx-a11y/alt-text` |
| 1.1.1 | `InputImageAltFixer` | `input-image-alt.ts` | `id === 'input-image-alt'` |
| 1.1.1 | `ImageRedundantAltFixer` | `image-redundant-alt.ts` | `id === 'image-redundant-alt'` (empties alt that duplicates adjacent text) |
| 1.3.1 | `LabelFixer` | `label.ts` | `id === 'label'` |
| 1.3.1 | `ListFixer` | `list.ts` | `id === 'list'` / `'listitem'` |
| 1.3.1 | `DefinitionListFixer` | `definition-list.ts` | `id === 'definition-list'` / `'dlitem'` |
| 1.3.1 | `ScopeAttrValidFixer` | `scope-attr-valid.ts` | `id === 'scope-attr-valid'` (corrects invalid `scope` token) |
| 1.3.1 | `TableDuplicateNameFixer` | `table-duplicate-name.ts` | `id === 'table-duplicate-name'` (removes a `summary` that duplicates the `<caption>`) |
| 1.3.1 | `TdHeadersAttrFixer` | `td-headers-attr.ts` | `id === 'td-headers-attr'` (removes a broken `headers` attribute) |
| 1.3.1 | `MarkdownTableHeaderFixer` | `markdown-table-header.ts` | `id === 'md-table-header'` |
| 1.4.1 | `LinkInTextBlockFixer` | `link-in-text-block.ts` | `id === 'link-in-text-block'` (adds `text-decoration: underline`) |
| 1.4.2 | `AutoplayAudioFixer` | `no-autoplay-audio.ts` | `id === 'no-autoplay-audio'` (removes `autoplay` from `<audio>`/`<video>`) |
| 1.4.3 | `ColorContrastFixer` | `color-contrast.ts` | `id === 'color-contrast'` (luminance-adjusts inline colors) |
| 1.4.4 | `MetaViewportFixer` / `MetaViewportLargeFixer` | `meta-viewport*.ts` | `id === 'meta-viewport'` / `'meta-viewport-large'` |
| 1.4.12 | `AvoidInlineSpacingFixer` | `avoid-inline-spacing.ts` | `id === 'avoid-inline-spacing'` (drops `!important` from inline `letter-spacing`/`word-spacing`/`line-height`) |
| 2.1.1 | `ScrollableRegionFocusableFixer` | `scrollable-region-focusable.ts` | `id === 'scrollable-region-focusable'` |
| 2.1.1 | `ServerSideImageMapFixer` | `server-side-image-map.ts` | `id === 'server-side-image-map'` (removes `ismap`) |
| 2.1.1 | `AccesskeysFixer` | `accesskeys.ts` | `id === 'accesskeys'` (removes a duplicate `accesskey`) |
| 2.2.1 | `MetaRefreshFixer` | `meta-refresh.ts` | `id === 'meta-refresh'` |
| 2.2.4 | `MetaRefreshNoExceptionsFixer` | `meta-refresh-no-exceptions.ts` | `id === 'meta-refresh-no-exceptions'` (removes a pure timed refresh) |
| 2.2.2 | `BlinkMarqueeFixer` | `blink-marquee.ts` | `id === 'blink'` / `'marquee'` |
| 2.4.2 | `DocumentTitleFixer` | `document-title.ts` | `id === 'document-title'` |
| 2.4.3 | `TabindexFixer` | `tabindex.ts` | `id === 'tabindex'` |
| 2.4.6 | `HeadingOrderFixer` | `heading-order.ts` | `id === 'heading-order'` |
| 2.4.6 | `MarkdownHeadingOrderFixer` | `markdown-heading-order.ts` | `id === 'md-heading-order'` |
| 3.1.1 | `HtmlLangFixer` / `HtmlLangValidFixer` / `HtmlXmlLangMismatchFixer` | `html-lang*.ts` | `id === 'html-has-lang'` / `'html-lang-valid'` / `'html-xml-lang-mismatch'` |
| 3.1.2 | `ValidLangFixer` | `valid-lang.ts` | `id === 'valid-lang'` (canonicalizes element `lang`/`xml:lang`) |
| 4.1.2 | `AriaHiddenBodyFixer` / `AriaHiddenFocusFixer` | `aria-hidden-*.ts` | `id === 'aria-hidden-body'` / `'aria-hidden-focus'` |
| 4.1.2 | `AriaAllowedAttrFixer` | `aria-allowed-attr.ts` | `id === 'aria-allowed-attr'` / `'aria-prohibited-attr'` (strips disallowed ARIA attrs) |
| 4.1.2 | `AriaRolesFixer` | `aria-roles.ts` | `id === 'aria-roles'` (removes an invalid/abstract `role`) |
| 4.1.2 | `AriaAllowedRoleFixer` | `aria-allowed-role.ts` | `id === 'aria-allowed-role'` (removes a `role` not allowed on the element) |
| 4.1.2 | `AriaRoledescriptionFixer` | `aria-roledescription.ts` | `id === 'aria-roledescription'` (removes an unsupported `aria-roledescription`) |
| 4.1.2 | `AriaBrailleLabelEquivalentFixer` | `aria-braillelabel-equivalent.ts` | `id === 'aria-braillelabel-equivalent'` (removes an `aria-braillelabel` with no `aria-label`) |
| 4.1.2 | `AriaBrailleRoledescriptionEquivalentFixer` | `aria-brailleroledescription-equivalent.ts` | `id === 'aria-brailleroledescription-equivalent'` (removes an `aria-brailleroledescription` with no `aria-roledescription`) |
| 4.1.2 | `AriaValidAttrFixer` | `aria-valid-attr.ts` | `id === 'aria-valid-attr'` (removes misspelled/unknown `aria-*` names from the failure summary) |
| 4.1.2 | `AriaConditionalAttrFixer` | `aria-conditional-attr.ts` | `id === 'aria-conditional-attr'` (removes a conflicting conditional `aria-*` from the failure summary) |
| 4.1.2 | `AriaValidAttrValueFixer` | `aria-valid-attr-value.ts` | `id === 'aria-valid-attr-value'` (normalizes a near-miss boolean ARIA value to `true`/`false`) |
| 4.1.2 | `AriaDeprecatedRoleFixer` | `aria-deprecated-role.ts` | `id === 'aria-deprecated-role'` (maps a deprecated role to its replacement) |
| 4.1.2 | `PresentationRoleConflictFixer` | `presentation-role-conflict.ts` | `id === 'presentation-role-conflict'` (drops a conflicting `role="presentation"`/`"none"`) |
| 4.1.2 | `FrameTitleFixer` | `frame-title.ts` | `id === 'frame-title'` |
| various | `EslintFixer` | `eslint-fixer.ts` | any `jsx-a11y/*` rule whose WCAG id ∈ {3.1.1, 4.1.2, 1.3.1, 2.4.6, 2.4.4} |

When a fixer can't safely apply a change — no source location, a conflicting
`role`, a missing `<head>`, structurally ambiguous markup, or no API key — it
**human-flags** the violation instead of guessing. A human-flag still counts the
rule as "covered"; it just routes that instance to a person.

## Detected but not fixable

Detection runs the real scanner, `scanSource()` from `@a11y-fixer/core`, over one
of two **disjoint** core paths per run, plus two optional source-tree paths
(Markdown, components) layered on top:

- **HTML path** (`html: true`): **axe-core** (~90+ rules) against rendered HTML.
- **JSX path** (default): **ESLint + `jsx-a11y`** (~30+ rules).
- **Markdown path** (`markdown: true`): a remark/mdast scanner
  ([`packages/core/src/scanner/markdown.ts`](./packages/core/src/scanner/markdown.ts))
  for image alt, non-descriptive link text, heading order, and empty table
  headers, over `.md`/`.markdown`/`.mdx`. MDX additionally flags JSX `<img>`
  without alt (emitted as `md-html-img-alt`).
- **Component path** (`components: true`): a scanner
  ([`packages/core/src/scanner/components/`](./packages/core/src/scanner/components/))
  that isolates the template markup of each supported format and runs it through
  the **same axe-core** detector as the HTML path — so it surfaces, and fixes,
  the same element-level rules. How each format is masked is declared once as a
  `FrameworkSpec` (`specs.ts`); adding a format is one spec entry. Supported:
  - `.vue`/`.svelte`/`.astro` — blank `<script>`/`<style>`/frontmatter in place.
  - Handlebars (`.hbs`/`.handlebars`) — pure HTML; `{{…}}`/`{{#if}}`/`{{> …}}` are inert.
  - Blade (`.blade.php`) — blank `<?php ?>`, `@php…@endphp`, and `{{-- --}}` comments;
    `{{ $x }}`, `{!! !!}`, and `@directives` are left inert.
  - Angular — external `.component.html` templates (routed here as fragments, *not*
    through the `--html` document path, to avoid false document-level findings) and
    inline `template:` string literals in `.component.ts`.

  Masking preserves `\n`/`\r` so lines map 1:1 to source. Whole-document rules
  (`document-title`, `html-has-lang`, `region`, `landmark-one-main`,
  `page-has-heading-one`, …) are dropped, since a component fragment doesn't own
  them. Requires puppeteer. Raw non-Blade `.php` is **not** supported (such files
  are often whole documents, not fragments).

So the tool *detects* far more than it fixes. The two tiers above now cover
accessible names, alt/title text, page and element language, contrast,
keyboard/focus, viewport, timing, motion, autoplaying media, invalid/deprecated/
disallowed/conflicting ARIA roles, ARIA-hidden/disallowed/invalid/conditional
attributes, near-miss boolean ARIA values, orphaned braille labels, redundant
alt, unique iframe titles, and list, definition-list, empty table headers (HTML
+ Markdown), duplicate table names and table-header `scope`/broken `headers`
structure, inline text-spacing `!important` overrides and duplicate access keys.
The genuinely-unfixable remainder (reported, left for a human) still includes:

- Captions/transcripts for media (`video-caption`, 1.2.2)
- Landmark / region structure (one-main, unique landmarks, `region`)
- HTML/JSX table header *associations* & captions (`th-has-data-cells`,
  `table-fake-caption` — empty `<th>` text, invalid `scope`, a duplicate table
  `summary`/`caption`, and a *broken* `td`/`th` `headers` reference are now
  fixed, but rebuilding a *correct* set of header ids is left for a human)
- Duplicate IDs, bypass blocks (skip links)
- ARIA value correctness for *token-valued* / tristate / required attributes and
  children — an *invalid* or *deprecated* role, an *unknown* or *conditional*
  attribute, and a *near-miss boolean* value are now fixed, but inventing a
  *correct* missing value or token is left for a human
- …and the rest of the axe / `jsx-a11y` catalog with no safe deterministic or
  AI-assisted repair.

The exact detect-universe is **not enumerated by hand** — it comes from
`@a11y-fixer/core` (now vendored in [`packages/core`](./packages/core)) and
ultimately from axe-core / `jsx-a11y`, and it shifts with their versions. We
track the *fixable* set precisely and the *unfixable* set by category.

## The scan-path caveat (real-world coverage)

Fix mode is **static-only**, and the two **core** paths are single-path per run
— see [`packages/github-action/src/index.ts`](./packages/github-action/src/index.ts).
The HTML and JSX paths emit different rule IDs for the same WCAG criterion (axe
`link-name` vs. `jsx-a11y` `anchor-has-content`, both 2.4.4), which is why the
registry carries both id-keyed and broad wcagId-keyed fixers. The Markdown and
component paths are independent and **layer onto** whichever core path you pick
(`markdown: true`, `components: true`).

Practically:

- **HTML/axe path** auto-fixes the full HTML set above.
- **JSX path** effectively only auto-fixes **alt-text**, and human-flags most of
  the rest (no source-level markup to edit deterministically).
- **Markdown path** auto-fixes image alt, link text, heading order, and empty
  table headers in `.md`/`.markdown`/`.mdx` source, independent of the core path.
- **Component path** reuses axe + the HTML fixers against component/template
  markup (`.vue`/`.svelte`/`.astro`, Handlebars, Blade, Angular), so it auto-fixes
  the same element-level set as the HTML path (e.g. `image-alt` → `<img alt>`)
  directly in the source. Directive-/expression-bound attributes are skipped for
  v1: `:src`/`v-if` (Vue), Svelte/Astro expressions, Angular `[attr]`/`*ngIf`/
  `(event)` bindings, and Blade `{{ }}`/`{!! !!}` echoes.

So the fixable coverage on any given repo is **whichever core path you ran**
(optionally plus Markdown and/or components), not the union. The
[demo site](./examples/demo-site/) ships separate jobs for exactly this reason.

## Benchmarked quality

Both benchmarks drive the real scanner against the
[W3C ACT Rules test cases](https://act-rules.github.io/), scoped to the covered
accessible-name rules, and gate on committed baselines. See
[`benchmarks/README.md`](./benchmarks/README.md).

- **Detection** (`act-detection/baseline.json`): tracks the accessible-name ACT
  rule groups in `rules.mjs`.
- **Fix clearance** (`fix-clearance/baseline.json`): detected violations must
  clear without introducing new ones.

## Sync notes & known gaps

- `COVERED_RULES` in `rules.mjs` tracks the **ACT accessible-name rule groups**.
  Fixers with no ACT fixtures are tracked here instead, not in `rules.mjs`, so
  the detection benchmark stays green:
  - AI tier: `DocumentTitleFixer`, `AreaAltFixer`, `ObjectAltFixer`,
    `SvgImgAltFixer`, `AriaCommandNameFixer`, the widget-name fixers,
    `EmptyHeadingFixer`, `AutocompleteValidFixer`, and the new
    `EmptyTableHeaderFixer` and `FrameTitleUniqueFixer`.
  - Core tier: the deterministic structural/language/contrast/keyboard/timing/
    motion fixers, `AriaAllowedAttrFixer`, `LinkInTextBlockFixer`,
    `DefinitionListFixer`, `ValidLangFixer`, `AutoplayAudioFixer`,
    `ServerSideImageMapFixer`, `AriaRolesFixer`, `PresentationRoleConflictFixer`,
    `ScopeAttrValidFixer`, `AriaDeprecatedRoleFixer`, `ImageRedundantAltFixer`,
    plus the new `AriaAllowedRoleFixer`, `AriaRoledescriptionFixer`,
    `AriaBrailleLabelEquivalentFixer`,
    `AriaBrailleRoledescriptionEquivalentFixer`, `AriaValidAttrFixer`,
    `AriaConditionalAttrFixer`, `AriaValidAttrValueFixer`,
    `TableDuplicateNameFixer`, `TdHeadersAttrFixer` and
    `MetaRefreshNoExceptionsFixer`.
- The Markdown fixers run on the Markdown path, which the ACT corpus (HTML/JSX
  only) does not exercise; they have their own unit, registry, and end-to-end
  tests and are tracked here.
- When a fixer is added: update the right table above, add its ACT rule to
  `rules.mjs` **if** the corpus has fixtures for it, and refresh both benchmark
  baselines.
