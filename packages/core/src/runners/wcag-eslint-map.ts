/**
 * Maps WCAG success criterion IDs to eslint-plugin-jsx-a11y rule names.
 * axe-core uses WCAG IDs; ESLint plugin uses its own rule names.
 */
export const WCAG_TO_ESLINT: Record<string, string> = {
  '1.1.1': 'jsx-a11y/alt-text',
  '4.1.2': 'jsx-a11y/aria-props',
  '1.3.1': 'jsx-a11y/label-has-associated-control',
  '3.1.1': 'jsx-a11y/html-has-lang',
  '2.4.6': 'jsx-a11y/heading-has-content',
  '2.4.4': 'jsx-a11y/anchor-has-content',
  '4.1.3': 'jsx-a11y/aria-activedescendant-has-tabindex',
  '1.4.3': 'jsx-a11y/interactive-supports-focus',
};

export const ESLINT_TO_WCAG: Record<string, string> = Object.fromEntries(
  Object.entries(WCAG_TO_ESLINT).map(([wcag, rule]) => [rule, wcag])
);

/** Rules that eslint-plugin-jsx-a11y can auto-fix with --fix */
export const AUTO_FIXABLE_RULES = new Set([
  'jsx-a11y/html-has-lang',
  'jsx-a11y/alt-text',
  'jsx-a11y/anchor-has-content',
  'jsx-a11y/heading-has-content',
]);
