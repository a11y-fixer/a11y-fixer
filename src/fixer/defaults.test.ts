import { describe, it, expect } from 'vitest';
import { buildCoreRegistry } from './defaults.js';
import { EslintFixer } from './rule-based/eslint-fixer.js';
import { HtmlLangFixer } from './rule-based/html-lang.js';
import { HeadingOrderFixer } from './rule-based/heading-order.js';
import { MetaViewportFixer } from './rule-based/meta-viewport.js';
import { ColorContrastFixer } from './rule-based/color-contrast.js';
import { TabindexFixer } from './rule-based/tabindex.js';
import { MetaRefreshFixer } from './rule-based/meta-refresh.js';
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

  it('still routes ESLint-sourced violations to EslintFixer', () => {
    const fixer = registry.getFixer(violation('jsx-a11y/heading-has-content', '2.4.6'));
    expect(fixer).toBeInstanceOf(EslintFixer);
  });
});
