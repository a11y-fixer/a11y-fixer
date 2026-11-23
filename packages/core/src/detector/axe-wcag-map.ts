// Pure axe-rule → WCAG success-criterion data, split out from `axe.ts` so it can
// be imported without pulling in the puppeteer-backed detector (and its heavy
// transitive deps). The WCAG catalog and anything that only needs the mapping
// import from here; `axe.ts` re-exports both for existing callers.

/**
 * Maps axe rule ids to their primary WCAG success-criterion number. Every rule
 * that a fixer claims must appear here so scans report the real WCAG id instead
 * of falling through to the raw axe id (see `toWcagId`).
 */
export const AXE_WCAG_MAP: Record<string, string> = {
  'image-alt': '1.1.1',
  'input-image-alt': '1.1.1',
  'button-name': '4.1.2',
  'label': '1.3.1',
  'html-has-lang': '3.1.1',
  'html-lang-valid': '3.1.1',
  'html-xml-lang-mismatch': '3.1.1',
  'heading-order': '2.4.6',
  'meta-viewport': '1.4.4',
  'meta-viewport-large': '1.4.4',
  'color-contrast': '1.4.3',
  'link-name': '2.4.4',
  'video-caption': '1.2.2',
  'tabindex': '2.4.3',
  'meta-refresh': '2.2.1',
  'scrollable-region-focusable': '2.1.1',
  'aria-hidden-body': '4.1.2',
  'aria-hidden-focus': '4.1.2',
  'frame-title': '4.1.2',
  'document-title': '2.4.2',
  'blink': '2.2.2',
  'marquee': '2.2.2',
  'list': '1.3.1',
  'listitem': '1.3.1',
  'definition-list': '1.3.1',
  'dlitem': '1.3.1',
  'aria-allowed-attr': '4.1.2',
  'aria-prohibited-attr': '4.1.2',
  'link-in-text-block': '1.4.1',
  'empty-heading': '1.3.1',
  'autocomplete-valid': '1.3.5',
  'valid-lang': '3.1.2',
  'no-autoplay-audio': '1.4.2',
  'server-side-image-map': '2.1.1',
  'aria-roles': '4.1.2',
  'presentation-role-conflict': '4.1.2',
  'scope-attr-valid': '1.3.1',
  'aria-deprecated-role': '4.1.2',
  'image-redundant-alt': '1.1.1',
  'empty-table-header': '1.3.1',
  'frame-title-unique': '4.1.2',
  'aria-allowed-role': '4.1.2',
  'aria-roledescription': '4.1.2',
  'aria-braillelabel-equivalent': '4.1.2',
  'aria-brailleroledescription-equivalent': '4.1.2',
  'aria-valid-attr': '4.1.2',
  'aria-conditional-attr': '4.1.2',
  'aria-valid-attr-value': '4.1.2',
  'table-duplicate-name': '1.3.1',
  'td-headers-attr': '1.3.1',
  'meta-refresh-no-exceptions': '2.2.4',
  'avoid-inline-spacing': '1.4.12',
  'accesskeys': '2.1.1',
};

export function toWcagId(axeRuleId: string): string {
  return AXE_WCAG_MAP[axeRuleId] ?? axeRuleId;
}
