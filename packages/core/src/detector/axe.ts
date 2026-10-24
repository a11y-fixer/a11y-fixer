import type { Detector, DetectorOptions, A11yViolation, A11yNode } from './index.js';

const AXE_WCAG_MAP: Record<string, string> = {
  'image-alt': '1.1.1',
  'button-name': '4.1.2',
  'label': '1.3.1',
  'html-has-lang': '3.1.1',
  'html-lang-valid': '3.1.1',
  'heading-order': '2.4.6',
  'meta-viewport': '1.4.4',
  'color-contrast': '1.4.3',
  'link-name': '2.4.4',
  'video-caption': '1.2.2',
  'tabindex': '2.4.3',
  'meta-refresh': '2.2.1',
  'scrollable-region-focusable': '2.1.1',
};

function toWcagId(axeRuleId: string): string {
  return AXE_WCAG_MAP[axeRuleId] ?? axeRuleId;
}

export class AxeDetector implements Detector {
  async scan(options: DetectorOptions): Promise<A11yViolation[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let puppeteer: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let AxePuppeteer: any;

    try {
      puppeteer = await import('puppeteer');
      const axePuppeteerMod = await import('@axe-core/puppeteer');
      AxePuppeteer = axePuppeteerMod.default;
    } catch {
      throw new Error(
        'AxeDetector requires puppeteer and @axe-core/puppeteer.\n' +
        'Install them: pnpm add -D puppeteer @axe-core/puppeteer'
      );
    }

    const browser = await puppeteer.launch({ headless: true });
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
