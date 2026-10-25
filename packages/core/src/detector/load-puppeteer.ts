/**
 * Shared puppeteer loader used by every browser-backed scanner (AxeDetector,
 * PuppeteerRunner). Puppeteer is imported lazily so the package stays
 * installable without it, and resolution falls back from the full `puppeteer`
 * package (used locally / by the CLI, ships its own Chromium) to the
 * bundle-friendly `puppeteer-core` (used by the published GitHub Action, which
 * bundles the JS and drives a system Chrome via PUPPETEER_EXECUTABLE_PATH).
 */

/** Options passed to `launch`. Honors PUPPETEER_EXECUTABLE_PATH when set so the
 * caller can point puppeteer-core at a pre-installed Chrome; when unset, full
 * puppeteer uses its own bundled Chromium. */
export function launchOptions(): { headless: true; executablePath?: string } {
  const executablePath = process.env['PUPPETEER_EXECUTABLE_PATH'];
  return executablePath ? { headless: true, executablePath } : { headless: true };
}

/**
 * Resolves a puppeteer module: `puppeteer` first, then `puppeteer-core`.
 * Throws an install hint only when neither is available.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadPuppeteer(): Promise<any> {
  try {
    return await import('puppeteer');
  } catch {
    // Fall back to puppeteer-core below.
  }
  try {
    return await import('puppeteer-core');
  } catch {
    throw new Error(
      'A browser scan requires puppeteer or puppeteer-core.\n' +
      'Install one: pnpm add -D puppeteer @axe-core/puppeteer',
    );
  }
}

/** Loads puppeteer and launches a headless browser with {@link launchOptions}. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function launchBrowser(): Promise<any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await loadPuppeteer();
  // Full puppeteer exposes `launch` on the namespace; puppeteer-core on the
  // default export. Prefer the default export when present.
  const target = mod.default ?? mod;
  return target.launch(launchOptions());
}
