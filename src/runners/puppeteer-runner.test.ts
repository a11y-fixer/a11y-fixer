import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Puppeteer is lazily `import()`ed inside PuppeteerRunner and is actually
// installed here, so we mock it to drive both the happy path and the
// not-installed path deterministically. `state.mode` switches behavior and
// vi.resetModules() forces the factory to re-run per test.
const state = vi.hoisted(() => ({
  mode: 'ok' as 'ok' | 'throw',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  browser: null as any,
}));

vi.mock('puppeteer', () => {
  if (state.mode === 'throw') throw new Error('Cannot find package puppeteer');
  const launch = vi.fn().mockImplementation(async () => state.browser);
  return { launch, default: { launch } };
});

function makeBrowser(matches: Record<string, Buffer>) {
  const close = vi.fn().mockResolvedValue(undefined);
  const seen: string[] = [];
  const page = {
    goto: vi.fn().mockResolvedValue(undefined),
    $: vi.fn(async (selector: string) => {
      seen.push(selector);
      const buf = matches[selector];
      if (!buf) return null;
      return {
        screenshot: vi.fn().mockResolvedValue(buf),
        dispose: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
  const browser = { newPage: vi.fn().mockResolvedValue(page), close };
  return { browser, close, seen };
}

async function freshRunner(url = 'http://localhost') {
  vi.resetModules();
  const { PuppeteerRunner } = await import('./puppeteer-runner.js');
  return new PuppeteerRunner(url);
}

describe('PuppeteerRunner', () => {
  beforeEach(() => { state.mode = 'ok'; state.browser = null; });
  afterEach(() => { vi.clearAllMocks(); });

  it('throws an install hint when puppeteer is not available', async () => {
    state.mode = 'throw';
    const runner = await freshRunner();
    await expect(runner.screenshotElement(['img'])).rejects.toThrow(/requires puppeteer/i);
  });

  it('returns the screenshot of the first matching selector', async () => {
    const buf = Buffer.from([1, 2, 3]);
    const { browser, seen } = makeBrowser({ '#logo': buf });
    state.browser = browser;

    const runner = await freshRunner();
    const result = await runner.screenshotElement(['#missing', '#logo']);

    expect(result).toEqual(buf);
    // Tried the missing selector first, then the matching one.
    expect(seen).toEqual(['#missing', '#logo']);
  });

  it('returns null when no selector matches', async () => {
    const { browser } = makeBrowser({});
    state.browser = browser;

    const runner = await freshRunner();
    expect(await runner.screenshotElement(['#nope', '.gone'])).toBeNull();
  });

  it('closes the browser and is a no-op when never launched', async () => {
    const { browser, close } = makeBrowser({ img: Buffer.from([9]) });
    state.browser = browser;

    const runner = await freshRunner();
    await runner.screenshotElement(['img']);
    await runner.close();
    expect(close).toHaveBeenCalledTimes(1);

    // A second close after teardown does nothing.
    await runner.close();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
