// Value: protects=htmlToPdf surfaces a typed PdfUnavailableError (not a raw
// crash) when no Chromium can launch, which is what lets the route return a
// clean 501; fails_when=the terminal launch failure is left to throw a raw
// error or the local-dev fallback swallows it; why_new=pdf.ts had no unit test
// and the review found the serverless-launch failure path could escape as a
// 500; seam=none (the browser deps are dynamically imported and stubbed here —
// a real Chromium cannot run in CI, same pattern as core's self-skipping
// axe.test); no_claim=does not prove a real PDF renders (no Chromium); only the
// no-browser-available failure path is exercised.
import { describe, it, expect, vi } from 'vitest';

// puppeteer-core is present but its launch is never reached on this path.
vi.mock('puppeteer-core', () => ({ default: { launch: vi.fn() } }));
// @sparticuz/chromium resolves an empty executablePath, so serverlessChromium()
// returns null and the local-`puppeteer` fallback runs; puppeteer is not
// installed, so that dynamic import throws and must become PdfUnavailableError.
vi.mock('@sparticuz/chromium', () => ({ default: { executablePath: async () => '', args: [] } }));

import { htmlToPdf, PdfUnavailableError } from './pdf.js';

describe('htmlToPdf', () => {
  it('throws PdfUnavailableError when no Chromium binary can launch', async () => {
    await expect(htmlToPdf('<!doctype html><title>x</title>')).rejects.toBeInstanceOf(PdfUnavailableError);
  });
});
