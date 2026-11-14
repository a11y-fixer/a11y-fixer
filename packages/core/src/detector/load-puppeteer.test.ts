import { describe, it, expect, vi, afterEach } from 'vitest';

// puppeteer and puppeteer-core are `import()`ed lazily inside the loader. Each
// test installs fresh mocks with vi.doMock (not hoisted vi.mock, whose factory
// result is cached across resetModules) so the resolve/fallback path is exact.

interface Mocks {
  puppeteer?: 'ok' | 'default-only' | 'absent';
  core?: 'ok' | 'absent';
}

/** Records the options launch() was called with. */
const captured: { opts?: unknown } = {};

function install({ puppeteer = 'absent', core = 'absent' }: Mocks): void {
  vi.resetModules();
  captured.opts = undefined;

  if (puppeteer === 'absent') {
    vi.doMock('puppeteer', () => { throw new Error('Cannot find package puppeteer'); });
  } else {
    vi.doMock('puppeteer', () => {
      const launch = vi.fn(async (o: unknown) => { captured.opts = o; return { id: 'browser' }; });
      const base = { launch, __pkg: 'puppeteer' };
      return puppeteer === 'default-only' ? { default: base } : { ...base, default: base };
    });
  }

  if (core === 'absent') {
    vi.doMock('puppeteer-core', () => { throw new Error('Cannot find package puppeteer-core'); });
  } else {
    vi.doMock('puppeteer-core', () => {
      const launch = vi.fn(async (o: unknown) => { captured.opts = o; return { id: 'browser-core' }; });
      return { default: { launch, __pkg: 'puppeteer-core' } };
    });
  }
}

afterEach(() => { vi.resetModules(); vi.clearAllMocks(); });

describe('launchOptions', () => {
  const saved = process.env['PUPPETEER_EXECUTABLE_PATH'];
  afterEach(() => {
    if (saved === undefined) delete process.env['PUPPETEER_EXECUTABLE_PATH'];
    else process.env['PUPPETEER_EXECUTABLE_PATH'] = saved;
  });

  it('omits executablePath when PUPPETEER_EXECUTABLE_PATH is unset', async () => {
    delete process.env['PUPPETEER_EXECUTABLE_PATH'];
    const { launchOptions } = await import('./load-puppeteer.js');
    expect(launchOptions()).toEqual({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  it('includes executablePath when PUPPETEER_EXECUTABLE_PATH is set', async () => {
    process.env['PUPPETEER_EXECUTABLE_PATH'] = '/usr/bin/chrome';
    const { launchOptions } = await import('./load-puppeteer.js');
    expect(launchOptions()).toEqual({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/usr/bin/chrome',
    });
  });
});

describe('loadPuppeteer', () => {
  it('returns the full puppeteer package when available', async () => {
    install({ puppeteer: 'ok' });
    const { loadPuppeteer } = await import('./load-puppeteer.js');
    const mod = await loadPuppeteer();
    expect(mod.__pkg).toBe('puppeteer');
  });

  it('falls back to puppeteer-core when puppeteer is unavailable', async () => {
    install({ puppeteer: 'absent', core: 'ok' });
    const { loadPuppeteer } = await import('./load-puppeteer.js');
    const mod = await loadPuppeteer();
    expect(mod.default.__pkg).toBe('puppeteer-core');
  });

  it('throws an install hint when neither package is available', async () => {
    install({ puppeteer: 'absent', core: 'absent' });
    const { loadPuppeteer } = await import('./load-puppeteer.js');
    await expect(loadPuppeteer()).rejects.toThrow(/requires puppeteer/i);
  });
});

describe('launchBrowser', () => {
  const saved = process.env['PUPPETEER_EXECUTABLE_PATH'];
  afterEach(() => {
    if (saved === undefined) delete process.env['PUPPETEER_EXECUTABLE_PATH'];
    else process.env['PUPPETEER_EXECUTABLE_PATH'] = saved;
  });

  it('launches with the resolved options', async () => {
    delete process.env['PUPPETEER_EXECUTABLE_PATH'];
    install({ puppeteer: 'ok' });
    const { launchBrowser } = await import('./load-puppeteer.js');
    expect(await launchBrowser()).toEqual({ id: 'browser' });
    expect(captured.opts).toEqual({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  it('prefers the default export and forwards executablePath', async () => {
    process.env['PUPPETEER_EXECUTABLE_PATH'] = '/opt/chrome';
    install({ puppeteer: 'default-only' });
    const { launchBrowser } = await import('./load-puppeteer.js');
    expect(await launchBrowser()).toEqual({ id: 'browser' });
    expect(captured.opts).toEqual({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/opt/chrome',
    });
  });
});
