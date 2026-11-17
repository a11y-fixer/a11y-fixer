import { describe, it, expect } from 'vitest';
import { EmptyHeadingFixer } from './empty-heading.js';
import type { A11yViolation } from '@a11y-fixer/core';

function violation(id = 'empty-heading', html = '<h2></h2>'): A11yViolation {
  return {
    id,
    wcagId: id,
    impact: 'moderate',
    description: 'Headings should not be empty',
    helpUrl: '',
    nodes: [{ html, target: ['h2'], failureSummary: '', sourceFile: 'page.html', sourceLine: 3, sourceColumn: 1 }],
  };
}

describe('EmptyHeadingFixer', () => {
  const fixer = new EmptyHeadingFixer();

  it('canFix matches only axe empty-heading', () => {
    expect(fixer.canFix(violation())).toBe(true);
    expect(fixer.canFix(violation('heading-order'))).toBe(false);
    expect(fixer.canFix(violation('jsx-a11y/heading-has-content'))).toBe(false);
  });

  it('reports WCAG 1.3.1', () => {
    expect(fixer.wcagId).toBe('1.3.1');
  });

  it('never auto-fixes — always human-flags with rule-specific guidance', async () => {
    const result = await fixer.fix(violation());
    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
    expect(result.after).toBeUndefined();
    expect(result.humanNote).toContain('author the heading text');
    expect(result.description).toContain('not auto-generated');
  });

  it('carries the offending markup through as `before`', async () => {
    const result = await fixer.fix(violation('empty-heading', '<h3 class="title"></h3>'));
    expect(result.before).toBe('<h3 class="title"></h3>');
  });

  it('survives a node-less violation without throwing', async () => {
    const v = { ...violation(), nodes: [] };
    const result = await fixer.fix(v);
    expect(result.bucket).toBe('human-flagged');
    expect(result.before).toBe('');
  });
});
