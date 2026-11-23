import type { Detector, DetectorOptions, A11yViolation, A11yNode } from './index.js';
import { launchBrowser } from './load-puppeteer.js';

// The axe→WCAG mapping lives in a puppeteer-free module so the WCAG catalog can
// import it without pulling in the detector. Re-exported here for existing callers.
export { AXE_WCAG_MAP, toWcagId } from './axe-wcag-map.js';
import { toWcagId } from './axe-wcag-map.js';

export class AxeDetector implements Detector {
  async scan(options: DetectorOptions): Promise<A11yViolation[]> {
    // Validate inputs before launching a browser, so bad input fails fast with
    // a clear message instead of first paying the cost of (or failing at)
    // starting Chrome.
    if (!options.html && !options.url) {
      throw new Error('DetectorOptions must include either url or html');
    }

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

      // Inputs were validated above: exactly one of html/url is present.
      if (options.html) {
        await page.setContent(options.html, { waitUntil: 'networkidle0' });
      } else {
        await page.goto(options.url!, { waitUntil: 'networkidle0' });
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
