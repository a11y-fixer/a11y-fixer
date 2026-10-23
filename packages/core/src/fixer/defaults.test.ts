import { describe, it, expect, vi } from 'vitest';
import { buildDefaultRegistry } from './defaults.js';
import { ButtonNameFixer } from './ai-assisted/button-name.js';
import { FormLabelFixer } from './ai-assisted/form-label.js';
import { EslintFixer } from './rule-based/eslint-fixer.js';
import { HtmlLangFixer } from './rule-based/html-lang.js';
import { HeadingOrderFixer } from './rule-based/heading-order.js';
import type { AIProvider } from '../ai-provider/index.js';
import type { A11yViolation } from '../detector/index.js';

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

describe('buildDefaultRegistry dispatch', () => {
  const registry = buildDefaultRegistry(provider, '/tmp');

  it('routes axe button-name (WCAG 4.1.2) to ButtonNameFixer, not EslintFixer', () => {
    const fixer = registry.getFixer(violation('button-name', '4.1.2'));
    expect(fixer).toBeInstanceOf(ButtonNameFixer);
  });

  it('routes axe label (WCAG 1.3.1) to FormLabelFixer, not EslintFixer', () => {
    const fixer = registry.getFixer(violation('label', '1.3.1'));
    expect(fixer).toBeInstanceOf(FormLabelFixer);
  });

  it('routes axe html-has-lang (WCAG 3.1.1) to HtmlLangFixer, not EslintFixer', () => {
    const fixer = registry.getFixer(violation('html-has-lang', '3.1.1'));
    expect(fixer).toBeInstanceOf(HtmlLangFixer);
  });

  it('routes axe heading-order (WCAG 2.4.6) to HeadingOrderFixer, not the human-flag fallback', () => {
    const fixer = registry.getFixer(violation('heading-order', '2.4.6'));
    expect(fixer).toBeInstanceOf(HeadingOrderFixer);
  });

  it('still routes ESLint-sourced violations to EslintFixer', () => {
    const fixer = registry.getFixer(violation('jsx-a11y/heading-has-content', '2.4.6'));
    expect(fixer).toBeInstanceOf(EslintFixer);
  });
});
