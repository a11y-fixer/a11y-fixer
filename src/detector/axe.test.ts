import { describe, it, expect, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../../../../tests/fixtures');

describe('AxeDetector', () => {
  it('finds violations in broken.html', async () => {
    // Dynamically import to allow optional dep mocking in CI without Chromium
    const puppeteerAvailable = await import('puppeteer').then(() => true).catch(() => false);

    if (!puppeteerAvailable) {
      console.warn('Skipping AxeDetector test: puppeteer not installed');
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
    const puppeteerAvailable = await import('puppeteer').then(() => true).catch(() => false);
    if (!puppeteerAvailable) return;

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
    const puppeteerAvailable = await import('puppeteer').then(() => true).catch(() => false);
    if (!puppeteerAvailable) return;

    const { AxeDetector } = await import('./axe.js');
    const detector = new AxeDetector();
    await expect(detector.scan({})).rejects.toThrow('DetectorOptions must include');
  });
});
