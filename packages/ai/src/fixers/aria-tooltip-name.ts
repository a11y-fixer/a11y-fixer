import { AriaNamedWidgetFixer, type AriaNamedWidgetConfig } from './aria-named-widget.js';

/**
 * Fixes elements with `role="tooltip"` that have no accessible name (axe
 * `aria-tooltip-name`, WCAG 4.1.2) by adding an AI-generated `aria-label`.
 * See {@link AriaNamedWidgetFixer} for the shared body.
 */
export class AriaTooltipNameFixer extends AriaNamedWidgetFixer {
  readonly config: AriaNamedWidgetConfig = {
    ruleId: 'aria-tooltip-name',
    wcagId: '4.1.2',
    label: 'Tooltip element (role tooltip)',
  };
}
