import { FixerRegistry, registerCoreFixers, ImageRedundantAltFixer } from '@a11y-fixer/core';
import type { AIProvider } from '../provider/index.js';
import { AltTextFixer, type ScreenshotProvider } from './alt-text.js';
import { LinkTextFixer } from './link-text.js';
import { LinkNameFixer } from './link-name.js';
import { ButtonNameFixer } from './button-name.js';
import { InputLabelFixer } from './input-label.js';
import { FormLabelFixer } from './form-label.js';
import { SelectNameFixer } from './select-name.js';
import { InputButtonNameFixer } from './input-button-name.js';
import { InputImageAltFixer } from './input-image-alt.js';
import { AreaAltFixer } from './area-alt.js';
import { ObjectAltFixer } from './object-alt.js';
import { SvgImgAltFixer } from './svg-img-alt.js';
import { RoleImgAltFixer } from './role-img-alt.js';
import { AriaCommandNameFixer } from './aria-command-name.js';
import { AriaInputFieldNameFixer } from './aria-input-field-name.js';
import { AriaToggleFieldNameFixer } from './aria-toggle-field-name.js';
import { AriaTooltipNameFixer } from './aria-tooltip-name.js';
import { AriaDialogNameFixer } from './aria-dialog-name.js';
import { AriaMeterNameFixer } from './aria-meter-name.js';
import { AriaProgressbarNameFixer } from './aria-progressbar-name.js';
import { FrameTitleFixer } from './frame-title.js';
import { DocumentTitleFixer } from './document-title.js';
import { EmptyHeadingFixer } from './empty-heading.js';
import { AutocompleteValidFixer } from './autocomplete-valid.js';
import { EmptyTableHeaderFixer } from './empty-table-header.js';
import { FrameTitleUniqueFixer } from './frame-title-unique.js';
import { MarkdownAltTextFixer } from './markdown-alt-text.js';
import { MarkdownLinkTextFixer } from './markdown-link-text.js';

/**
 * Builds the full fixer registry used by the paid GitHub Action: the
 * AI-assisted fixers plus every deterministic fixer from `@a11y-fixer/core`.
 *
 * The AI-assisted fixers are registered *first* so that, with canFix-based
 * dispatch, they claim the axe rules (button-name, label, …) that share a WCAG
 * id with an ESLint rule before the generic EslintFixer registered by
 * {@link registerCoreFixers}.
 *
 * Ordering within the AI fixers matters too: id-keyed fixers must precede the
 * wcagId-keyed {@link LinkTextFixer}. `getFixer` returns the first `canFix`
 * match, and core maps axe's `link-name` rule to WCAG 2.4.4 — the same id
 * LinkTextFixer claims. So LinkNameFixer (specific: `id === 'link-name'`) is
 * registered before LinkTextFixer (broad: `wcagId === '2.4.4'`); otherwise
 * LinkTextFixer swallows every icon/empty-link violation and LinkNameFixer
 * never runs. JSX empty anchors (`id = jsx-a11y/anchor-has-content`, 2.4.4) do
 * not match LinkNameFixer's id, so they still route to LinkTextFixer.
 *
 * For the same reason {@link InputImageAltFixer}, {@link AreaAltFixer},
 * {@link ObjectAltFixer}, {@link SvgImgAltFixer} and {@link RoleImgAltFixer}
 * (each specific: `id === '<axe-id>'`) are registered before
 * {@link AltTextFixer} (broad: `wcagId === '1.1.1'`). Core leaves these ids out of AXE_WCAG_MAP today, so their wcagId is
 * the raw id and AltTextFixer would not claim them — but if core ever maps one
 * to 1.1.1, this ordering keeps the element-specific fixer ahead of the
 * `<img>`-only AltTextFixer. SelectNameFixer, InputButtonNameFixer, and the
 * three `aria-*-name` fixers and {@link FrameTitleFixer} (4.1.2) key on unique
 * axe ids with no broad 4.1.2 fixer to collide with, so their order is free.
 * The widget accessible-name fixers {@link AriaTooltipNameFixer} and
 * {@link AriaDialogNameFixer} (4.1.2), {@link AriaMeterNameFixer} and
 * {@link AriaProgressbarNameFixer} (1.1.1) are likewise id-keyed
 * (`aria-tooltip-name`/`aria-dialog-name`/`aria-meter-name`/`aria-progressbar-name`)
 * with no broad collider at their criterion, so their order is free too.
 * {@link DocumentTitleFixer} (`document-title`, 2.4.2) is likewise id-keyed with
 * no broad collider, so its position is free too.
 */
export function buildFullRegistry(
  aiProvider: AIProvider,
  rootDir: string,
  screenshots?: ScreenshotProvider,
): FixerRegistry {
  const registry = new FixerRegistry();

  // Markdown fixers key on the `md-*` ids the repo-local markdown scanner emits
  // and share WCAG 1.1.1 / 2.4.4 with the broad HTML AltTextFixer/LinkTextFixer.
  // Register them first so canFix dispatch routes `.md` violations to the
  // Markdown-syntax fixers before the HTML-markup fixers can claim them.
  registry.register(new MarkdownAltTextFixer(aiProvider, rootDir));
  registry.register(new MarkdownLinkTextFixer(aiProvider, rootDir));

  // 1.1.1 id-keyed fixers must precede the broad wcagId-keyed AltTextFixer.
  registry.register(new InputImageAltFixer(aiProvider, rootDir));
  registry.register(new AreaAltFixer(aiProvider, rootDir));
  registry.register(new ObjectAltFixer(aiProvider, rootDir));
  registry.register(new SvgImgAltFixer(aiProvider, rootDir));
  registry.register(new RoleImgAltFixer(aiProvider, rootDir));
  // Deterministic id-keyed fixer (image-redundant-alt → 1.1.1); must precede the
  // broad wcagId-keyed AltTextFixer or it would swallow the redundant-alt case.
  registry.register(new ImageRedundantAltFixer(rootDir));
  registry.register(new AltTextFixer(aiProvider, rootDir, screenshots));
  registry.register(new LinkNameFixer(aiProvider, rootDir));
  registry.register(new LinkTextFixer(aiProvider, rootDir));
  registry.register(new ButtonNameFixer(aiProvider, rootDir));
  // Input accessible-name fixer. Keyed on the JSX path's unique
  // `a11y-custom/input-must-have-label` id (no broad collider at 1.3.1), so its
  // position is free — but it must precede registerCoreFixers so it beats the
  // deterministic EslintFixer, which can only human-flag the same finding.
  registry.register(new InputLabelFixer(aiProvider, rootDir));
  registry.register(new FormLabelFixer(aiProvider, rootDir));
  registry.register(new SelectNameFixer(aiProvider, rootDir));
  registry.register(new InputButtonNameFixer(aiProvider, rootDir));
  registry.register(new AriaCommandNameFixer(aiProvider, rootDir));
  registry.register(new AriaInputFieldNameFixer(aiProvider, rootDir));
  registry.register(new AriaToggleFieldNameFixer(aiProvider, rootDir));
  registry.register(new AriaTooltipNameFixer(aiProvider, rootDir));
  registry.register(new AriaDialogNameFixer(aiProvider, rootDir));
  registry.register(new AriaMeterNameFixer(aiProvider, rootDir));
  registry.register(new AriaProgressbarNameFixer(aiProvider, rootDir));
  registry.register(new FrameTitleFixer(aiProvider, rootDir));
  registry.register(new DocumentTitleFixer(aiProvider, rootDir));
  // Unique id-keyed fixers (empty-heading → 1.3.1, autocomplete-valid → 1.3.5)
  // with no broad AI collider at their criterion, so position here is free — but
  // they belong in the AI block so the committed-dist action bundles them.
  registry.register(new EmptyHeadingFixer(aiProvider, rootDir));
  registry.register(new AutocompleteValidFixer(aiProvider, rootDir));
  // empty-table-header → 1.3.1 and frame-title-unique → 4.1.2 are id-keyed with
  // no broad AI collider at their criterion, so position here is free — but they
  // belong in the AI block so the committed-dist action bundles them.
  registry.register(new EmptyTableHeaderFixer(aiProvider, rootDir));
  registry.register(new FrameTitleUniqueFixer(aiProvider, rootDir));

  registerCoreFixers(registry, rootDir);

  return registry;
}
