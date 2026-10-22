import { describe, it, expect, vi } from 'vitest';
import { buildDefaultRegistry } from './defaults.js';
import { ButtonNameFixer } from './ai-assisted/button-name.js';
import { FormLabelFixer } from './ai-assisted/form-label.js';
import { EslintFixer } from './rule-based/eslint-fixer.js';
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

  it('still routes ESLint-sourced violations to EslintFixer', () => {
    const fixer = registry.getFixer(violation('jsx-a11y/heading-has-content', '2.4.6'));
    expect(fixer).toBeInstanceOf(EslintFixer);
  });
});
