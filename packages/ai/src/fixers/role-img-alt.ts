import { AriaNamedWidgetFixer, type AriaNamedWidgetConfig } from './aria-named-widget.js';

/**
 * Fixes elements with `role="img"` that have no accessible name (axe
 * `role-img-alt`, WCAG 1.1.1) by adding an AI-generated `aria-label`.
 *
 * Unlike {@link SvgImgAltFixer} (which owns the `<svg>`-specific rule) and
 * {@link AltTextFixer} (the broad WCAG 1.1.1 `<img>` fixer), the `role="img"`
 * host can be any tag — `<span role="img">🎉</span>`, `<div role="img">`, an
 * `<i>` icon, etc. So this reuses the role-on-any-tag machinery in
 * {@link AriaNamedWidgetFixer}: derive the opening-tag regex from the source
 * line and add a safe single-line `aria-label`. See that base for the shared
 * body.
 */
export class RoleImgAltFixer extends AriaNamedWidgetFixer {
  readonly config: AriaNamedWidgetConfig = {
    ruleId: 'role-img-alt',
    wcagId: '1.1.1',
    label: 'Image element (role img)',
  };
}
