import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildCoreRegistry } from './defaults.js';
import { EslintFixer } from './rule-based/eslint-fixer.js';
import { HtmlLangFixer } from './rule-based/html-lang.js';
import { HeadingOrderFixer } from './rule-based/heading-order.js';
import { MetaViewportFixer } from './rule-based/meta-viewport.js';
import { ColorContrastFixer } from './rule-based/color-contrast.js';
import { TabindexFixer } from './rule-based/tabindex.js';
import { MetaRefreshFixer } from './rule-based/meta-refresh.js';
import { LabelFixer } from './rule-based/label.js';
import { InputImageAltFixer } from './rule-based/input-image-alt.js';
import { ImageAltFixer } from './rule-based/image-alt.js';
import { MarkdownHeadingOrderFixer } from './rule-based/markdown-heading-order.js';
import { MarkdownTableHeaderFixer } from './rule-based/markdown-table-header.js';
import { AriaAllowedAttrFixer } from './rule-based/aria-allowed-attr.js';
import { LinkInTextBlockFixer } from './rule-based/link-in-text-block.js';
import { DefinitionListFixer } from './rule-based/definition-list.js';
import { ValidLangFixer } from './rule-based/valid-lang.js';
import { AutoplayAudioFixer } from './rule-based/no-autoplay-audio.js';
import { ServerSideImageMapFixer } from './rule-based/server-side-image-map.js';
import { AriaRolesFixer } from './rule-based/aria-roles.js';
import { PresentationRoleConflictFixer } from './rule-based/presentation-role-conflict.js';
import { ScopeAttrValidFixer } from './rule-based/scope-attr-valid.js';
import { AriaDeprecatedRoleFixer } from './rule-based/aria-deprecated-role.js';
import { ImageRedundantAltFixer } from './rule-based/image-redundant-alt.js';
import type { A11yViolation } from '../detector/index.js';

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

describe('buildCoreRegistry dispatch', () => {
  const registry = buildCoreRegistry('/tmp');

  it('routes axe html-has-lang (WCAG 3.1.1) to HtmlLangFixer, not EslintFixer', () => {
    const fixer = registry.getFixer(violation('html-has-lang', '3.1.1'));
    expect(fixer).toBeInstanceOf(HtmlLangFixer);
  });

  it('routes axe heading-order (WCAG 2.4.6) to HeadingOrderFixer, not the human-flag fallback', () => {
    const fixer = registry.getFixer(violation('heading-order', '2.4.6'));
    expect(fixer).toBeInstanceOf(HeadingOrderFixer);
  });

  it('routes axe meta-viewport (WCAG 1.4.4) to MetaViewportFixer', () => {
    const fixer = registry.getFixer(violation('meta-viewport', '1.4.4'));
    expect(fixer).toBeInstanceOf(MetaViewportFixer);
  });

  it('routes axe color-contrast (WCAG 1.4.3) to ColorContrastFixer', () => {
    const fixer = registry.getFixer(violation('color-contrast', '1.4.3'));
    expect(fixer).toBeInstanceOf(ColorContrastFixer);
  });

  it('routes axe tabindex (WCAG 2.4.3) to TabindexFixer', () => {
    const fixer = registry.getFixer(violation('tabindex', '2.4.3'));
    expect(fixer).toBeInstanceOf(TabindexFixer);
  });

  it('routes axe meta-refresh (WCAG 2.2.1) to MetaRefreshFixer', () => {
    const fixer = registry.getFixer(violation('meta-refresh', '2.2.1'));
    expect(fixer).toBeInstanceOf(MetaRefreshFixer);
  });

  it('routes axe label (WCAG 1.3.1) to LabelFixer, not EslintFixer', () => {
    const fixer = registry.getFixer(violation('label', '1.3.1'));
    expect(fixer).toBeInstanceOf(LabelFixer);
  });

  it('routes axe input-image-alt (WCAG 1.1.1) to InputImageAltFixer', () => {
    const fixer = registry.getFixer(violation('input-image-alt', '1.1.1'));
    expect(fixer).toBeInstanceOf(InputImageAltFixer);
  });

  it('routes axe image-alt (WCAG 1.1.1) to ImageAltFixer, not InputImageAltFixer', () => {
    const fixer = registry.getFixer(violation('image-alt', '1.1.1'));
    expect(fixer).toBeInstanceOf(ImageAltFixer);
  });

  it('routes axe aria-allowed-attr and aria-prohibited-attr (WCAG 4.1.2) to AriaAllowedAttrFixer', () => {
    expect(registry.getFixer(violation('aria-allowed-attr', '4.1.2'))).toBeInstanceOf(AriaAllowedAttrFixer);
    expect(registry.getFixer(violation('aria-prohibited-attr', '4.1.2'))).toBeInstanceOf(AriaAllowedAttrFixer);
  });

  it('routes axe link-in-text-block (WCAG 1.4.1) to LinkInTextBlockFixer', () => {
    expect(registry.getFixer(violation('link-in-text-block', '1.4.1'))).toBeInstanceOf(LinkInTextBlockFixer);
  });

  it('routes axe definition-list and dlitem (WCAG 1.3.1) to DefinitionListFixer', () => {
    expect(registry.getFixer(violation('definition-list', '1.3.1'))).toBeInstanceOf(DefinitionListFixer);
    expect(registry.getFixer(violation('dlitem', '1.3.1'))).toBeInstanceOf(DefinitionListFixer);
  });

  it('routes axe valid-lang (WCAG 3.1.2) to ValidLangFixer', () => {
    expect(registry.getFixer(violation('valid-lang', '3.1.2'))).toBeInstanceOf(ValidLangFixer);
  });

  it('routes axe no-autoplay-audio (WCAG 1.4.2) to AutoplayAudioFixer', () => {
    expect(registry.getFixer(violation('no-autoplay-audio', '1.4.2'))).toBeInstanceOf(AutoplayAudioFixer);
  });

  it('routes axe server-side-image-map (WCAG 2.1.1) to ServerSideImageMapFixer', () => {
    expect(registry.getFixer(violation('server-side-image-map', '2.1.1'))).toBeInstanceOf(ServerSideImageMapFixer);
  });

  it('routes axe aria-roles (WCAG 4.1.2) to AriaRolesFixer', () => {
    expect(registry.getFixer(violation('aria-roles', '4.1.2'))).toBeInstanceOf(AriaRolesFixer);
  });

  it('routes axe presentation-role-conflict (WCAG 4.1.2) to PresentationRoleConflictFixer', () => {
    expect(registry.getFixer(violation('presentation-role-conflict', '4.1.2'))).toBeInstanceOf(PresentationRoleConflictFixer);
  });

  it('routes axe scope-attr-valid (WCAG 1.3.1) to ScopeAttrValidFixer, not LabelFixer', () => {
    expect(registry.getFixer(violation('scope-attr-valid', '1.3.1'))).toBeInstanceOf(ScopeAttrValidFixer);
  });

  it('routes axe aria-deprecated-role (WCAG 4.1.2) to AriaDeprecatedRoleFixer', () => {
    expect(registry.getFixer(violation('aria-deprecated-role', '4.1.2'))).toBeInstanceOf(AriaDeprecatedRoleFixer);
  });

  it('routes axe image-redundant-alt (WCAG 1.1.1) to ImageRedundantAltFixer, not ImageAltFixer', () => {
    expect(registry.getFixer(violation('image-redundant-alt', '1.1.1'))).toBeInstanceOf(ImageRedundantAltFixer);
  });

  it('still routes ESLint-sourced violations to EslintFixer', () => {
    const fixer = registry.getFixer(violation('jsx-a11y/heading-has-content', '2.4.6'));
    expect(fixer).toBeInstanceOf(EslintFixer);
  });

  // The default static-JSX path emits these four ESLint rule ids. alt-text is
  // deterministically fixable; the three a11y-custom rules are detection-only
  // (no deterministic label/link text) and must fall through to human-flag.
  describe('default static-JSX violation types', () => {
    it('routes ESLint jsx-a11y/alt-text (WCAG 1.1.1) to ImageAltFixer', () => {
      const fixer = registry.getFixer(violation('jsx-a11y/alt-text', '1.1.1'));
      expect(fixer).toBeInstanceOf(ImageAltFixer);
    });

    it.each([
      ['a11y-custom/button-must-have-label', '4.1.2'],
      ['a11y-custom/input-must-have-label', '1.3.1'],
      ['a11y-custom/no-generic-link-text', '2.4.4'],
    ])('leaves %s (WCAG %s) unclaimed so it human-flags', (id, wcagId) => {
      expect(registry.getFixer(violation(id, wcagId))).toBeUndefined();
    });
  });

  // The Markdown scan path emits five md-* ids. Two have deterministic source
  // fixers in core; the other three need AI (alt/link text) and live only in the
  // paid @a11y-fixer/ai registry, so core must leave them for human review.
  describe('Markdown violation types', () => {
    it('routes md-heading-order (WCAG 2.4.6) to MarkdownHeadingOrderFixer', () => {
      expect(registry.getFixer(violation('md-heading-order', '2.4.6')))
        .toBeInstanceOf(MarkdownHeadingOrderFixer);
    });

    it('routes md-table-header (WCAG 1.3.1) to MarkdownTableHeaderFixer', () => {
      expect(registry.getFixer(violation('md-table-header', '1.3.1')))
        .toBeInstanceOf(MarkdownTableHeaderFixer);
    });

    it.each([
      ['md-image-alt', '1.1.1'],
      ['md-html-img-alt', '1.1.1'],
      ['md-link-text', '2.4.4'],
    ])('leaves AI-only %s (WCAG %s) unclaimed so it human-flags in core', (id, wcagId) => {
      expect(registry.getFixer(violation(id, wcagId))).toBeUndefined();
    });
  });
});

describe('buildCoreRegistry lang option', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'defaults-lang-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('threads the lang option through to HtmlLangFixer', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<!doctype html>\n<html>\n<head></head>\n</html>');
    const registry = buildCoreRegistry(dir, { lang: 'fr' });

    const v: A11yViolation = {
      id: 'html-has-lang',
      wcagId: '3.1.1',
      impact: 'serious',
      description: '',
      helpUrl: '',
      nodes: [{ html: '<html>', target: ['html'], failureSummary: '', sourceFile: file, sourceLine: 2, sourceColumn: 1 }],
    };

    const [result] = await registry.applyAll([v]);
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<html lang="fr">');
  });
});
