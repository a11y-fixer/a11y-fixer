import { describe, it, expect, vi } from 'vitest';
import type { A11yViolation } from '@a11y-fixer/core';
import { EslintFixer, HtmlLangFixer, ImageRedundantAltFixer } from '@a11y-fixer/core';
import { buildFullRegistry } from './registry.js';
import { AltTextFixer } from './alt-text.js';
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
import { EmptyHeadingFixer } from './empty-heading.js';
import { AutocompleteValidFixer } from './autocomplete-valid.js';
import { EmptyTableHeaderFixer } from './empty-table-header.js';
import { FrameTitleUniqueFixer } from './frame-title-unique.js';
import { MarkdownAltTextFixer } from './markdown-alt-text.js';
import { MarkdownLinkTextFixer } from './markdown-link-text.js';
import { LinkTextFixer } from './link-text.js';
import type { AIProvider } from '../provider/index.js';

const provider: AIProvider = {
  available: () => true,
  describeImage: vi.fn(),
  suggestAltText: vi.fn(),
  rewriteLinkText: vi.fn(),
  suggestAccessibleName: vi.fn(),
};

function violation(id: string, wcagId: string): A11yViolation {
  return {
    id,
    wcagId,
    impact: 'serious',
    description: '',
    helpUrl: '',
    nodes: [{ html: '', target: [], failureSummary: '' }],
  };
}

describe('buildFullRegistry dispatch', () => {
  const registry = buildFullRegistry(provider, '/tmp');

  it('routes axe image-alt (WCAG 1.1.1) to AltTextFixer', () => {
    expect(registry.getFixer(violation('image-alt', '1.1.1'))).toBeInstanceOf(AltTextFixer);
  });

  it('routes axe button-name (WCAG 4.1.2) to ButtonNameFixer, not EslintFixer', () => {
    expect(registry.getFixer(violation('button-name', '4.1.2'))).toBeInstanceOf(ButtonNameFixer);
  });

  it('routes axe link-name (WCAG 4.1.2) to LinkNameFixer, not EslintFixer', () => {
    expect(registry.getFixer(violation('link-name', '4.1.2'))).toBeInstanceOf(LinkNameFixer);
  });

  it('routes the JSX button rule to ButtonNameFixer, not EslintFixer', () => {
    expect(
      registry.getFixer(violation('a11y-custom/button-must-have-label', '4.1.2')),
    ).toBeInstanceOf(ButtonNameFixer);
  });

  it('routes the JSX input rule to InputLabelFixer, not EslintFixer', () => {
    expect(
      registry.getFixer(violation('a11y-custom/input-must-have-label', '1.3.1')),
    ).toBeInstanceOf(InputLabelFixer);
  });

  it('routes axe label (WCAG 1.3.1) to FormLabelFixer, not EslintFixer', () => {
    expect(registry.getFixer(violation('label', '1.3.1'))).toBeInstanceOf(FormLabelFixer);
  });

  it('routes axe select-name to SelectNameFixer', () => {
    expect(registry.getFixer(violation('select-name', 'select-name'))).toBeInstanceOf(SelectNameFixer);
  });

  it('routes axe input-button-name to InputButtonNameFixer', () => {
    expect(registry.getFixer(violation('input-button-name', 'input-button-name'))).toBeInstanceOf(InputButtonNameFixer);
  });

  it('routes axe input-image-alt to InputImageAltFixer, not AltTextFixer', () => {
    // Unmapped in core, so wcagId is the raw id; even if core later maps it to
    // 1.1.1, InputImageAltFixer is registered first and still wins.
    expect(registry.getFixer(violation('input-image-alt', 'input-image-alt'))).toBeInstanceOf(InputImageAltFixer);
    expect(registry.getFixer(violation('input-image-alt', '1.1.1'))).toBeInstanceOf(InputImageAltFixer);
  });

  it('routes axe area-alt to AreaAltFixer, not AltTextFixer', () => {
    expect(registry.getFixer(violation('area-alt', 'area-alt'))).toBeInstanceOf(AreaAltFixer);
    expect(registry.getFixer(violation('area-alt', '1.1.1'))).toBeInstanceOf(AreaAltFixer);
  });

  it('routes axe object-alt to ObjectAltFixer, not AltTextFixer', () => {
    expect(registry.getFixer(violation('object-alt', 'object-alt'))).toBeInstanceOf(ObjectAltFixer);
    expect(registry.getFixer(violation('object-alt', '1.1.1'))).toBeInstanceOf(ObjectAltFixer);
  });

  it('routes axe svg-img-alt to SvgImgAltFixer, not AltTextFixer', () => {
    expect(registry.getFixer(violation('svg-img-alt', 'svg-img-alt'))).toBeInstanceOf(SvgImgAltFixer);
    expect(registry.getFixer(violation('svg-img-alt', '1.1.1'))).toBeInstanceOf(SvgImgAltFixer);
  });

  it('routes axe role-img-alt to RoleImgAltFixer, not AltTextFixer', () => {
    expect(registry.getFixer(violation('role-img-alt', 'role-img-alt'))).toBeInstanceOf(RoleImgAltFixer);
    expect(registry.getFixer(violation('role-img-alt', '1.1.1'))).toBeInstanceOf(RoleImgAltFixer);
  });

  it('routes axe aria-command-name to AriaCommandNameFixer', () => {
    expect(registry.getFixer(violation('aria-command-name', 'aria-command-name'))).toBeInstanceOf(AriaCommandNameFixer);
  });

  it('routes axe aria-input-field-name to AriaInputFieldNameFixer', () => {
    expect(registry.getFixer(violation('aria-input-field-name', 'aria-input-field-name'))).toBeInstanceOf(AriaInputFieldNameFixer);
  });

  it('routes axe aria-toggle-field-name to AriaToggleFieldNameFixer', () => {
    expect(registry.getFixer(violation('aria-toggle-field-name', 'aria-toggle-field-name'))).toBeInstanceOf(AriaToggleFieldNameFixer);
  });

  it('routes axe aria-tooltip-name to AriaTooltipNameFixer', () => {
    expect(registry.getFixer(violation('aria-tooltip-name', 'aria-tooltip-name'))).toBeInstanceOf(AriaTooltipNameFixer);
  });

  it('routes axe aria-dialog-name to AriaDialogNameFixer', () => {
    expect(registry.getFixer(violation('aria-dialog-name', 'aria-dialog-name'))).toBeInstanceOf(AriaDialogNameFixer);
  });

  it('routes axe aria-meter-name to AriaMeterNameFixer', () => {
    expect(registry.getFixer(violation('aria-meter-name', 'aria-meter-name'))).toBeInstanceOf(AriaMeterNameFixer);
  });

  it('routes axe aria-progressbar-name to AriaProgressbarNameFixer', () => {
    expect(registry.getFixer(violation('aria-progressbar-name', 'aria-progressbar-name'))).toBeInstanceOf(AriaProgressbarNameFixer);
  });

  it('routes axe frame-title (WCAG 4.1.2) to FrameTitleFixer, not EslintFixer', () => {
    expect(registry.getFixer(violation('frame-title', '4.1.2'))).toBeInstanceOf(FrameTitleFixer);
  });

  it('routes axe empty-heading (WCAG 1.3.1) to EmptyHeadingFixer', () => {
    expect(registry.getFixer(violation('empty-heading', '1.3.1'))).toBeInstanceOf(EmptyHeadingFixer);
  });

  it('routes axe autocomplete-valid (WCAG 1.3.5) to AutocompleteValidFixer', () => {
    expect(registry.getFixer(violation('autocomplete-valid', '1.3.5'))).toBeInstanceOf(AutocompleteValidFixer);
  });

  it('routes axe empty-table-header (WCAG 1.3.1) to EmptyTableHeaderFixer', () => {
    expect(registry.getFixer(violation('empty-table-header', '1.3.1'))).toBeInstanceOf(EmptyTableHeaderFixer);
  });

  it('routes axe frame-title-unique (WCAG 4.1.2) to FrameTitleUniqueFixer', () => {
    expect(registry.getFixer(violation('frame-title-unique', '4.1.2'))).toBeInstanceOf(FrameTitleUniqueFixer);
  });

  it('routes axe image-redundant-alt (WCAG 1.1.1) to the deterministic ImageRedundantAltFixer, not AltTextFixer', () => {
    // The redundant-alt fixer is id-keyed and registered before the broad
    // wcagId==='1.1.1' AltTextFixer so it wins despite sharing the criterion.
    expect(registry.getFixer(violation('image-redundant-alt', '1.1.1'))).toBeInstanceOf(ImageRedundantAltFixer);
  });

  it('still routes deterministic axe html-has-lang (WCAG 3.1.1) to HtmlLangFixer', () => {
    expect(registry.getFixer(violation('html-has-lang', '3.1.1'))).toBeInstanceOf(HtmlLangFixer);
  });

  it('still routes ESLint-sourced violations to EslintFixer', () => {
    expect(registry.getFixer(violation('jsx-a11y/heading-has-content', '2.4.6'))).toBeInstanceOf(EslintFixer);
  });

  it('routes Markdown image-alt (md-image-alt, 1.1.1) to MarkdownAltTextFixer, not AltTextFixer', () => {
    expect(registry.getFixer(violation('md-image-alt', '1.1.1'))).toBeInstanceOf(MarkdownAltTextFixer);
    // The HTML <img> fixer still owns plain axe image-alt.
    expect(registry.getFixer(violation('image-alt', '1.1.1'))).toBeInstanceOf(AltTextFixer);
  });

  it('routes Markdown link-text (md-link-text, 2.4.4) to MarkdownLinkTextFixer, not LinkTextFixer', () => {
    expect(registry.getFixer(violation('md-link-text', '2.4.4'))).toBeInstanceOf(MarkdownLinkTextFixer);
    // JSX empty anchors still route to the HTML link fixer.
    expect(registry.getFixer(violation('anchor-has-content', '2.4.4'))).toBeInstanceOf(LinkTextFixer);
  });

  it('routes raw-HTML Markdown image-alt (md-html-img-alt, 1.1.1) to MarkdownAltTextFixer', () => {
    // The scanner emits a separate id for <img> written inline in Markdown; it
    // must share the Markdown alt fixer, not the HTML AltTextFixer.
    expect(registry.getFixer(violation('md-html-img-alt', '1.1.1'))).toBeInstanceOf(MarkdownAltTextFixer);
  });
});
