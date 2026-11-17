/**
 * The W3C ACT accessible-name rules whose axe-core counterpart this product's
 * fixers cover. Each ACT rule ships a set of passed/failed/inapplicable HTML
 * fixtures; we scan them with the real HTML scanner and check that the matching
 * axe rule fires on `failed` cases and stays silent on `passed`/`inapplicable`.
 *
 * `axe` is the set of rule ids `scanSource({ html: true })` may emit for this
 * requirement (A11yViolation.id) — a single ACT rule like "Form field has a
 * name" is split by axe across several rules (label, select-name, the aria-*
 * field-name rules), and the product ships a fixer for each, so a `failed` case
 * counts as detected if ANY of them fires. `wcag` is the success criterion it
 * maps to (A11yViolation.wcagId). Keep this list in sync with the fixers in
 * packages/ai/src/fixers that key off these rule ids.
 *
 * This is only the subset with ACT fixtures, so it is narrower than the full
 * fixer set: fixers whose rule has no ACT corpus entry (e.g. document-title,
 * area-alt, object-alt, svg-img-alt, aria-command-name) are NOT listed here and
 * are tracked in ../../COVERAGE.md instead. Add a row here only when the vendored
 * ACT corpus actually has fixtures for the rule, and update COVERAGE.md too.
 */
export const COVERED_RULES = [
  { act: '23a2a8', axe: ['image-alt'], wcag: '1.1.1', name: 'Image has non-empty accessible name' },
  { act: '59796f', axe: ['input-image-alt'], wcag: '1.1.1', name: 'Image button has non-empty accessible name' },
  { act: '97a4e1', axe: ['button-name', 'input-button-name'], wcag: '4.1.2', name: 'Button has non-empty accessible name' },
  { act: 'c487ae', axe: ['link-name'], wcag: '2.4.4', name: 'Link has non-empty accessible name' },
  {
    act: 'e086e5',
    axe: ['label', 'select-name', 'aria-input-field-name', 'aria-toggle-field-name'],
    wcag: '1.3.1',
    name: 'Form field has non-empty accessible name',
  },
  { act: 'cae760', axe: ['frame-title'], wcag: '4.1.2', name: 'Iframe has non-empty accessible name' },
];

export const ACT_RULE_IDS = COVERED_RULES.map((r) => r.act);
