import type { Detector, DetectorOptions, A11yViolation, A11yNode } from './index.js';
import { launchBrowser } from './load-puppeteer.js';

/**
 * Maps axe rule ids to their primary WCAG success-criterion number. Every rule
 * that a fixer claims must appear here so scans report the real WCAG id instead
 * of falling through to the raw axe id (see `toWcagId`).
 */
export const AXE_WCAG_MAP: Record<string, string> = {
  'image-alt': '1.1.1',
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
};

export function toWcagId(axeRuleId: string): string {
  return AXE_WCAG_MAP[axeRuleId] ?? axeRuleId;
}

export class AxeDetector implements Detector {
  async scan(options: DetectorOptions): Promise<A11yViolation[]> {
    const browser = await launchBrowser();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let AxePuppeteer: any;
    try {
      const axePuppeteerMod = await import('@axe-core/puppeteer');
      AxePuppeteer = axePuppeteerMod.default;
    } catch {
      await browser.close();
      throw new Error(
        'AxeDetector requires @axe-core/puppeteer.\n' +
        'Install it: pnpm add -D @axe-core/puppeteer'
      );
    }

    try {
      const page = await browser.newPage();

      if (options.html) {
        await page.setContent(options.html, { waitUntil: 'networkidle0' });
      } else if (options.url) {
        await page.goto(options.url, { waitUntil: 'networkidle0' });
      } else {
        throw new Error('DetectorOptions must include either url or html');
      }

      const axe = new AxePuppeteer(page);
      if (options.rules?.length) {
        axe.withRules(options.rules);
      }
      const results = await axe.analyze();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return results.violations.map((v: any): A11yViolation => ({
        id: v.id,
        wcagId: toWcagId(v.id),
        impact: (v.impact ?? 'moderate') as A11yViolation['impact'],
        description: v.description,
        helpUrl: v.helpUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes: v.nodes.map((n: any): A11yNode => ({
          html: n.html,
          target: n.target.map(String),
          failureSummary: n.failureSummary ?? '',
        })),
      }));
    } finally {
      await browser.close();
    }
  }
}
