/**
 * Maps WCAG success criterion IDs to eslint-plugin-jsx-a11y rule names.
 * axe-core uses WCAG IDs; ESLint plugin uses its own rule names.
 *
 * WCAG_TO_ESLINT: one canonical jsx-a11y rule per criterion (used for PR
 * annotation links and fixer dispatch).
 *
 * ESLINT_TO_WCAG: broader — every rule that can fire maps back to a WCAG ID,
 * including additional jsx-a11y rules that share a criterion and the custom
 * inline rules defined in EslintRunner.
 */
export const WCAG_TO_ESLINT: Record<string, string> = {
  '1.1.1': 'jsx-a11y/alt-text',
  '4.1.2': 'jsx-a11y/aria-props',
  '1.3.1': 'jsx-a11y/label-has-associated-control',
  '3.1.1': 'jsx-a11y/html-has-lang',
  '2.4.6': 'jsx-a11y/heading-has-content',
  '2.4.4': 'jsx-a11y/anchor-has-content',
  '4.1.3': 'jsx-a11y/aria-activedescendant-has-tabindex',
  '2.1.1': 'jsx-a11y/interactive-supports-focus',
};

export const ESLINT_TO_WCAG: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(WCAG_TO_ESLINT).map(([wcag, rule]) => [rule, wcag])
  ),
  // Custom inline rules (defined in EslintRunner) that fill jsx-a11y gaps
  'a11y-custom/button-must-have-label': '4.1.2',
  'a11y-custom/input-must-have-label': '1.3.1',
  'a11y-custom/no-generic-link-text': '2.4.4',
};

/** Rules that eslint-plugin-jsx-a11y can auto-fix with --fix */
export const AUTO_FIXABLE_RULES = new Set([
  'jsx-a11y/html-has-lang',
  'jsx-a11y/alt-text',
  'jsx-a11y/anchor-has-content',
  'jsx-a11y/heading-has-content',
]);
