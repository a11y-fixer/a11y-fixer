import { AriaNamedWidgetFixer, type AriaNamedWidgetConfig } from './aria-named-widget.js';

/**
 * Fixes elements with `role="meter"` that have no accessible name (axe
 * `aria-meter-name`, WCAG 1.1.1) by adding an AI-generated `aria-label`.
 * See {@link AriaNamedWidgetFixer} for the shared body.
 */
export class AriaMeterNameFixer extends AriaNamedWidgetFixer {
  readonly config: AriaNamedWidgetConfig = {
    ruleId: 'aria-meter-name',
    wcagId: '1.1.1',
    label: 'Meter element (role meter)',
  };
}
