import { AriaNamedWidgetFixer, type AriaNamedWidgetConfig } from './aria-named-widget.js';

/**
 * Fixes elements with `role="dialog"` or `role="alertdialog"` that have no
 * accessible name (axe `aria-dialog-name`, WCAG 4.1.2) by adding an
 * AI-generated `aria-label`. See {@link AriaNamedWidgetFixer} for the shared
 * body — the role can sit on any tag and the fix is a safe single-line
 * `aria-label` insert, so this is a thin wrapper like the tooltip/meter/
 * progressbar fixers.
 */
export class AriaDialogNameFixer extends AriaNamedWidgetFixer {
  readonly config: AriaNamedWidgetConfig = {
    ruleId: 'aria-dialog-name',
    wcagId: '4.1.2',
    label: 'Dialog element (role dialog/alertdialog)',
  };
}
