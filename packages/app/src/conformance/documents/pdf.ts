// HTML → PDF via a headless browser. Isolated here so the heavy browser deps
// (puppeteer-core + @sparticuz/chromium) stay out of the webpack bundle: the
// document route marks them `serverExternalPackages` and loads them only at
// request time through this module.
//
// Launch strategy:
//   - Serverless/production: @sparticuz/chromium supplies a Lambda-safe Chromium
//     binary that puppeteer-core drives.
//   - Local dev: that binary is usually absent, so fall back to a full
//     `puppeteer` install if present. If neither can launch, throw a clear
//     error the route turns into a 501 rather than a crash.

/** Thrown when no headless browser is available to render a PDF. */
export class PdfUnavailableError extends Error {
  constructor(cause: string) {
    super(`PDF rendering is unavailable in this environment: ${cause}`);
    this.name = 'PdfUnavailableError';
  }
}

/** The slice of a puppeteer page we use — kept local so no dep types leak in. */
interface PdfPage {
  setContent(html: string, opts: { waitUntil: string; timeout: number }): Promise<void>;
  pdf(opts: Record<string, unknown>): Promise<Uint8Array>;
  setDefaultTimeout(ms: number): void;
}
interface PdfBrowser {
  newPage(): Promise<PdfPage>;
  close(): Promise<void>;
}
interface Launcher {
  launch(opts: Record<string, unknown>): Promise<PdfBrowser>;
}

/** Resolve a Chromium executable path + args from @sparticuz/chromium, or null. */
async function serverlessChromium(): Promise<{ executablePath: string; args: string[] } | null> {
  try {
    const mod = (await import('@sparticuz/chromium')) as unknown as {
      default?: { executablePath(): Promise<string>; args: string[] };
      executablePath?(): Promise<string>;
      args?: string[];
    };
    const chromium = mod.default ?? mod;
    const executablePath = await chromium.executablePath?.();
    if (!executablePath) return null;
    return { executablePath, args: chromium.args ?? [] };
  } catch {
    return null;
  }
}

async function launch(): Promise<PdfBrowser> {
  const puppeteer = ((await import('puppeteer-core')) as unknown as { default: Launcher }).default;

  // @sparticuz/chromium.executablePath() eagerly extracts and returns a path on
  // ANY platform, including local dev where its Lambda/Linux binary cannot
  // actually launch. So try the serverless launch, but fall through to the full
  // `puppeteer` install if it throws — otherwise the local fallback below would
  // be unreachable and a launch failure would surface as a 500, not the 501 the
  // route is designed to return.
  const serverless = await serverlessChromium();
  if (serverless) {
    try {
      return await puppeteer.launch({ executablePath: serverless.executablePath, args: serverless.args, headless: true });
    } catch {
      // Fall through to the local-dev fallback.
    }
  }

  // Local dev fallback: a full `puppeteer` install ships its own Chromium. The
  // specifier is built indirectly so tsc/webpack don't require the (optional,
  // often absent) package at build time.
  try {
    const spec = 'puppeteer';
    const full = (await import(/* webpackIgnore: true */ spec)) as unknown as {
      default: { executablePath(): string };
    };
    return await puppeteer.launch({ executablePath: full.default.executablePath(), headless: true });
  } catch {
    throw new PdfUnavailableError('no Chromium binary (@sparticuz/chromium or puppeteer) could launch');
  }
}

/** Render a standalone HTML document to a PDF Buffer (A4, background graphics on). */
export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    // Bound every page operation (setContent and pdf alike) so a stuck render can
    // never hang the request past the platform's own function limit.
    page.setDefaultTimeout(15000);
    // The document is fully self-contained (inline CSS, no external requests), so
    // networkidle0 settles at once; the explicit timeout bounds a stuck render.
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
    const bytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      timeout: 15000,
      margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
    });
    return Buffer.from(bytes);
  } finally {
    await browser.close();
  }
}
