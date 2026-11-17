import { AriaNamedWidgetFixer, type AriaNamedWidgetConfig } from './aria-named-widget.js';

/**
 * Fixes elements with `role="progressbar"` that have no accessible name (axe
 * `aria-progressbar-name`, WCAG 1.1.1) by adding an AI-generated `aria-label`.
 * See {@link AriaNamedWidgetFixer} for the shared body.
 */
export class AriaProgressbarNameFixer extends AriaNamedWidgetFixer {
  readonly config: AriaNamedWidgetConfig = {
    ruleId: 'aria-progressbar-name',
    wcagId: '1.1.1',
    label: 'Progress bar element (role progressbar)',
  };
}
