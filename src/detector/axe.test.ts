import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../../../../tests/fixtures');

/**
 * Whether a real browser can actually launch here. CI installs the puppeteer
 * package but not a Chrome binary (pnpm skips puppeteer's browser-download
 * postinstall), so probing the package import is not enough — we must try to
 * launch and skip the browser-backed assertions when that fails.
 */
async function browserAvailable(): Promise<boolean> {
  try {
    const { launchBrowser } = await import('./load-puppeteer.js');
    const browser = await launchBrowser();
    await browser.close();
    return true;
  } catch {
    return false;
  }
}

describe('AxeDetector', () => {
  it('finds violations in broken.html', async () => {
    if (!(await browserAvailable())) {
      console.warn('Skipping AxeDetector test: no launchable browser');
      return;
    }

    const { AxeDetector } = await import('./axe.js');
    const html = await readFile(path.join(FIXTURES, 'broken.html'), 'utf8');
    const detector = new AxeDetector();
    const violations = await detector.scan({ html });

    expect(violations.length).toBeGreaterThanOrEqual(3);

    const ruleIds = violations.map(v => v.id);
    expect(ruleIds).toContain('image-alt');
  });

  it('returns empty array for clean HTML', async () => {
    if (!(await browserAvailable())) return;

    const { AxeDetector } = await import('./axe.js');
    const detector = new AxeDetector();

    const violations = await detector.scan({
      html: `<!DOCTYPE html>
<html lang="en">
<head><title>Clean page</title></head>
<body><h1>Hello</h1><p>Valid content</p></body>
</html>`,
    });

    const serious = violations.filter(v =>
      v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious.length).toBe(0);
  });

  it('throws when neither url nor html is provided', async () => {
    // No browser needed: scan() validates its inputs before launching one.
    const { AxeDetector } = await import('./axe.js');
    const detector = new AxeDetector();
    await expect(detector.scan({})).rejects.toThrow('DetectorOptions must include');
  });
});
