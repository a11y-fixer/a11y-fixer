import { launchBrowser } from '../detector/load-puppeteer.js';

/**
 * Loads a URL in a headless browser and screenshots individual elements so the
 * AI provider can generate alt text from real pixels. Puppeteer is loaded
 * lazily via the shared loader (same pattern as AxeDetector) so it stays an
 * optional peer dependency.
 */
export class PuppeteerRunner {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private browser: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private page: any = null;

  constructor(private readonly url: string) {}

  private async ensurePage(): Promise<void> {
    if (this.page) return;

    this.browser = await launchBrowser();
    this.page = await this.browser.newPage();
    await this.page.goto(this.url, { waitUntil: 'networkidle0' });
  }

  /**
   * Screenshots the first element matching one of the axe `target` CSS selectors.
   * Returns null when the element can't be found or captured.
   */
  async screenshotElement(target: string[]): Promise<Buffer | null> {
    await this.ensurePage();

    for (const selector of target) {
      try {
        const handle = await this.page.$(selector);
        if (!handle) continue;
        const buffer = await handle.screenshot({ type: 'png' });
        await handle.dispose();
        return Buffer.from(buffer);
      } catch {
        // Try the next selector.
      }
    }
    return null;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}
