import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as actionsCore from '@actions/core';

// Shared spies/state, hoisted so the vi.mock factory below can close over them.
const h = vi.hoisted(() => ({
  createPR: vi.fn(async (..._args: unknown[]) => ({ url: 'https://github.com/o/r/pull/42', branch: 'a11y-fixer/x', number: 42 })),
  scan: vi.fn(),
  scanOpts: vi.fn(),
  applyAll: vi.fn(),
  prCtor: vi.fn(),
  puppeteerCtor: vi.fn(),
  cacheCtor: vi.fn(),
  cacheSave: vi.fn(async () => {}),
  scanWithCookies: vi.fn(),
  readStore: vi.fn(async (..._a: unknown[]) => [] as unknown[]),
  reconcile: vi.fn(async (r: unknown[], ..._rest: unknown[]) => r),
  recordProposals: vi.fn((..._a: unknown[]) => [] as unknown[]),
  loadExamples: vi.fn((..._a: unknown[]) => ({}) as Record<string, string[]>),
  writeStore: vi.fn(async (..._a: unknown[]) => {}),
  scanMarkdown: vi.fn(async (..._a: unknown[]) => [] as unknown[]),
  // Mutable GitHub context: tests set `ctx.payload` to flip repo visibility or
  // supply a PR. Reset in beforeEach.
  ctx: { repo: { owner: 'o', repo: 'r' }, sha: 'deadbeef', payload: {} as Record<string, unknown> },
  octokitThrows: false,
  checksCreate: vi.fn(async (..._a: unknown[]) => ({ data: { id: 1 } })),
  checksUpdate: vi.fn(async (..._a: unknown[]) => ({})),
  listComments: vi.fn(async (..._a: unknown[]) => ({ data: [] as unknown[] })),
  createComment: vi.fn(async (..._a: unknown[]) => ({})),
  updateComment: vi.fn(async (..._a: unknown[]) => ({})),
}));

vi.mock('@actions/github', () => ({
  get context() {
    return h.ctx;
  },
  getOctokit: () => {
    // Simulate a getOctokit that throws (bad token), to prove reporting never
    // escapes its best-effort guard. Reset in beforeEach.
    if (h.octokitThrows) throw new Error('bad token');
    return {
    rest: {
      checks: { create: (...a: unknown[]) => h.checksCreate(...a), update: (...a: unknown[]) => h.checksUpdate(...a) },
      issues: {
        listComments: (...a: unknown[]) => h.listComments(...a),
        createComment: (...a: unknown[]) => h.createComment(...a),
        updateComment: (...a: unknown[]) => h.updateComment(...a),
      },
    },
    };
  },
}));

// vitest >=3 forbids vi.spyOn on live ESM namespace exports (they are
// non-configurable). `{ spy: true }` auto-wraps every @actions/core export in a
// spy while keeping its real implementation, so getInput still reads INPUT_*
// env vars and we can assert on setOutput/info/warning/setFailed via vi.mocked.
vi.mock('@actions/core', { spy: true });

vi.mock('./cookies-scanner.js', () => ({
  scanWithCookies: (...args: unknown[]) => h.scanWithCookies(...args),
}));

vi.mock('./learning-store.js', () => ({
  DEFAULT_STORE_PATH: '.a11y-fixer/learning.jsonl',
  readStore: (...a: unknown[]) => h.readStore(...a),
  reconcile: (...a: [unknown[], ...unknown[]]) => h.reconcile(...a),
  recordProposals: (...a: unknown[]) => h.recordProposals(...a),
  loadExamples: (...a: unknown[]) => h.loadExamples(...a),
  writeStore: (...a: unknown[]) => h.writeStore(...a),
  makeFileReader: () => async () => null,
}));

vi.mock('@a11y-fixer/ai', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AISDKProvider: class { constructor(..._args: any[]) {} },
  resolveAIConfig: () => ({ provider: 'anthropic', model: 'claude-haiku-4-5', apiKey: '' }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LearningProvider: class { constructor(..._args: any[]) {} drainGenerations() { return []; } },
  CachingProvider: class {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      h.cacheCtor(...args);
    }
    available() {
      return false;
    }
    save() {
      return h.cacheSave();
    }
  },
  buildFullRegistry: () => ({ register() {}, applyAll: () => h.applyAll() }),
  // The action's `scanAll` wrapper concatenates these onto core's scanSource
  // output only when the `markdown` input is set.
  scanMarkdown: (...a: unknown[]) => h.scanMarkdown(...a),
}));

vi.mock('@a11y-fixer/core', () => {
  class EslintRunner {
    scan() {
      return h.scan();
    }
  }
  class FixerRegistry {
    register() {}
    applyAll() {
      return h.applyAll();
    }
  }
  class PullRequestBuilder {
    constructor(opts: unknown) {
      h.prCtor(opts);
    }
    createPR(...args: unknown[]) {
      return h.createPR(...args);
    }
  }
  const noop = class {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(..._args: any[]) {}
  };
  class PuppeteerRunner {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      h.puppeteerCtor(...args);
    }
    close() {}
  }
  return {
    EslintRunner,
    FixerRegistry,
    PullRequestBuilder,
    AxeDetector: noop,
    PuppeteerRunner,
    ReactJSXMapper: noop,
    // The action delegates scanning to core's scanSource; route it to the spy
    // and record the options so URL/HTML routing can be asserted.
    scanSource: (_dir: string, opts: unknown) => {
      h.scanOpts(opts);
      return h.scan();
    },
    // Real behavior: repo-absolute files of applied fixes, de-duplicated.
    dedupeFixFiles: (fixes: Array<{ applied?: boolean; sourceLocation?: { file: string } }>) => {
      const set = new Set<string>();
      for (const f of fixes) {
        if (f.applied && f.sourceLocation) set.add(f.sourceLocation.file);
      }
      return [...set];
    },
  };
});

const APPLIED_FIX = {
  wcagId: '3.1.1',
  description: 'Add lang attribute',
  applied: true,
  sourceLocation: { file: '/repo/src/App.tsx', line: 1, column: 1 },
};

/** Sets the action's inputs via the INPUT_* env vars @actions/core reads. */
function setInputs(inputs: Record<string, string>): void {
  for (const [name, value] of Object.entries(inputs)) {
    process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value;
  }
}

const savedEnv = { ...process.env };

// A real token signed by the production key (sub=test@example.com, exp ~2126).
// Every mode requires a valid license, so supply one by default; the license
// tests override it.
const VALID_LICENSE =
  'eyJ2IjoxLCJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjo0OTQ2NTkxMDQ3fQ.PUo1x635LMj2Hyg5piVzY-U83FTutaRKoPF-8ioK599Oi_0QXlx8MF28dB2dY3sZE9Yl_maZ1HJObSwaSTFDBQ';

beforeEach(() => {
  vi.clearAllMocks();
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('INPUT_')) delete process.env[k];
  }
  process.env['INPUT_LICENSE-KEY'] = VALID_LICENSE;
  // Default: private repo, no PR context. Reporting tests override this.
  h.ctx.payload = {};
  h.ctx.sha = 'deadbeef';
  h.octokitThrows = false;
});

afterEach(() => {
  process.env = { ...savedEnv };
});

describe('github-action fix mode', () => {
  it('opens a PR when a fix is applied and a token is present', async () => {
    h.scan.mockResolvedValueOnce([{}, {}]).mockResolvedValueOnce([{}]); // before: 2, after: 1
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok', 'base-branch': 'develop' });

    const { run } = await import('./index.js');
    await run();

    expect(h.createPR).toHaveBeenCalledTimes(1);
    const [fixes, before, after, changedFiles] = h.createPR.mock.calls[0];
    expect(fixes).toEqual([APPLIED_FIX]);
    expect(before).toHaveLength(2);
    expect(after).toHaveLength(1);
    expect(changedFiles).toEqual(['/repo/src/App.tsx']);
    expect(h.prCtor).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'o', repo: 'r', baseBranch: 'develop' }),
    );
  });

  it('wires the PR url to the pr-url output and logs the PR lifecycle', async () => {
    h.scan.mockResolvedValueOnce([{}, {}]).mockResolvedValueOnce([{}]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    const setOutput = vi.mocked(actionsCore.setOutput);
    const info = vi.mocked(actionsCore.info);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok', 'base-branch': 'develop' });

    const { run } = await import('./index.js');
    await run();

    expect(setOutput).toHaveBeenCalledWith('pr-url', 'https://github.com/o/r/pull/42');
    expect(info).toHaveBeenCalledWith('Opening PR against o/r@develop...');
    expect(info).toHaveBeenCalledWith('PR created: https://github.com/o/r/pull/42');
  });

  it('passes the current working directory as repoRoot to PullRequestBuilder', async () => {
    h.scan.mockResolvedValueOnce([{}]).mockResolvedValueOnce([{}]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok', 'base-branch': 'develop' });

    const { run } = await import('./index.js');
    await run();

    expect(h.prCtor).toHaveBeenCalledWith(
      expect.objectContaining({ repoRoot: process.cwd() }),
    );
  });

  it('defaults the PR base branch to main when base-branch is unset', async () => {
    h.scan.mockResolvedValueOnce([{}]).mockResolvedValueOnce([{}]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    const info = vi.mocked(actionsCore.info);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.prCtor).toHaveBeenCalledWith(
      expect.objectContaining({ baseBranch: 'main' }),
    );
    expect(info).toHaveBeenCalledWith('Opening PR against o/r@main...');
  });

  it('fails the run (and sets no pr-url) when createPR rejects', async () => {
    h.scan.mockResolvedValueOnce([{}]).mockResolvedValueOnce([{}]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    h.createPR.mockRejectedValueOnce(new Error('boom'));
    const setFailed = vi.mocked(actionsCore.setFailed);
    const setOutput = vi.mocked(actionsCore.setOutput);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).toHaveBeenCalledWith('boom');
    expect(setOutput).not.toHaveBeenCalledWith('pr-url', expect.anything());
  });

  it('does not open a PR when nothing was applied', async () => {
    h.scan.mockResolvedValue([{}]);
    h.applyAll.mockResolvedValue([{ wcagId: '1.1.1', description: 'x', applied: false, humanNote: 'review' }]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.createPR).not.toHaveBeenCalled();
  });

  it('does not open a PR when no github-token is provided', async () => {
    h.scan.mockResolvedValue([{}]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    setInputs({ mode: 'fix', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(h.createPR).not.toHaveBeenCalled();
  });

  it('does not open a PR when applied fixes touched no files', async () => {
    h.scan.mockResolvedValue([{}]);
    // Applied, but with no sourceLocation → dedupeFixFiles yields [].
    h.applyAll.mockResolvedValue([{ wcagId: '4.1.2', description: 'x', applied: true }]);
    const info = vi.mocked(actionsCore.info);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.createPR).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith('No files were changed — skipping PR.');
  });

  it('wraps the provider in a cache (threading cache-file) and flushes it after applying', async () => {
    h.scan.mockResolvedValue([]);
    h.applyAll.mockResolvedValue([]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok', 'cache-file': '/tmp/ai-cache.json' });

    const { run } = await import('./index.js');
    await run();

    expect(h.cacheCtor).toHaveBeenCalledWith(expect.anything(), { cacheFile: '/tmp/ai-cache.json' });
    expect(h.cacheSave).toHaveBeenCalledTimes(1);
  });

  it('passes an undefined cache-file through when none is set', async () => {
    h.scan.mockResolvedValue([]);
    h.applyAll.mockResolvedValue([]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.cacheCtor).toHaveBeenCalledWith(expect.anything(), { cacheFile: undefined });
  });

  it('warns and ignores url in fix mode (static-only)', async () => {
    h.scan.mockResolvedValue([]);
    h.applyAll.mockResolvedValue([]);
    const warning = vi.mocked(actionsCore.warning);
    setInputs({ mode: 'fix', dir: '.', url: 'https://example.com', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(warning).toHaveBeenCalledWith(expect.stringContaining('URL fix-mode is not supported'));
    // No browser runner is constructed, and scanning uses the static path.
    expect(h.puppeteerCtor).not.toHaveBeenCalled();
    expect(h.scanOpts).toHaveBeenCalledWith({ html: false });
  });

  it('records proposals and persists the learning store after a fix run', async () => {
    h.scan.mockResolvedValueOnce([{}, {}]).mockResolvedValueOnce([{}]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    // A prior record (so reconcile runs), a fresh proposal, and learned examples.
    h.readStore.mockResolvedValueOnce([{ id: 'old', status: 'proposed' }]);
    h.recordProposals.mockReturnValueOnce([{ id: 'new', status: 'proposed' }]);
    h.loadExamples.mockReturnValueOnce({ alt: ['A golden retriever'] });
    const info = vi.mocked(actionsCore.info);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.reconcile).toHaveBeenCalledTimes(1);
    expect(h.writeStore).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith(expect.stringContaining('Learning: 1 new proposal(s)'));
  });

  it('persists the store when a reconcile resolved a record even with no new proposals', async () => {
    h.scan.mockResolvedValueOnce([{}, {}]).mockResolvedValueOnce([{}]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    // Reconcile marked a prior record resolved; no new proposals this run.
    h.readStore.mockResolvedValueOnce([{ id: 'old', status: 'proposed' }]);
    h.reconcile.mockResolvedValueOnce([{ id: 'old', status: 'merged', resolvedAt: 't1' }]);
    h.recordProposals.mockReturnValueOnce([]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.writeStore).toHaveBeenCalledTimes(1);
  });

  it('skips the learning store entirely when learning is off', async () => {
    h.scan.mockResolvedValueOnce([{}, {}]).mockResolvedValueOnce([{}]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok', learning: 'off' });

    const { run } = await import('./index.js');
    await run();

    expect(h.readStore).not.toHaveBeenCalled();
    expect(h.recordProposals).not.toHaveBeenCalled();
    expect(h.writeStore).not.toHaveBeenCalled();
  });
});

describe('github-action check mode', () => {
  it('fails the run and lists violations when any are found', async () => {
    h.scan.mockResolvedValue([{ wcagId: '1.1.1', description: 'Image missing alt' }]);
    const setFailed = vi.mocked(actionsCore.setFailed);
    setInputs({ mode: 'check', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).toHaveBeenCalledWith(expect.stringContaining('1 accessibility violation'));
    expect(setFailed).toHaveBeenCalledWith(expect.stringContaining('WCAG 1.1.1'));
  });

  it('passes when no violations are found', async () => {
    h.scan.mockResolvedValue([]);
    const setFailed = vi.mocked(actionsCore.setFailed);
    const info = vi.mocked(actionsCore.info);
    setInputs({ mode: 'check', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('No accessibility violations'));
  });
});

describe('github-action scan mode', () => {
  it('outputs the violations JSON', async () => {
    const violations = [{ wcagId: '1.4.3', description: 'contrast' }];
    h.scan.mockResolvedValue(violations);
    const setOutput = vi.mocked(actionsCore.setOutput);
    setInputs({ mode: 'scan', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(setOutput).toHaveBeenCalledWith('violations', JSON.stringify(violations));
  });

  it('passes the url through to the scanner in scan mode', async () => {
    h.scan.mockResolvedValue([]);
    setInputs({ mode: 'scan', dir: '.', url: 'https://example.com' });

    const { run } = await import('./index.js');
    await run();

    expect(h.scanOpts).toHaveBeenCalledWith({ url: 'https://example.com', html: false });
  });

  it('merges scanMarkdown violations onto the base scan when markdown is enabled', async () => {
    const base = [{ wcagId: '1.4.3', description: 'contrast', id: 'color-contrast' }];
    const md = [{ wcagId: '1.1.1', description: 'Markdown image has no alt text', id: 'md-image-alt' }];
    h.scan.mockResolvedValue(base);
    h.scanMarkdown.mockResolvedValue(md);
    const setOutput = vi.mocked(actionsCore.setOutput);
    setInputs({ mode: 'scan', dir: '.', markdown: 'true' });

    const { run } = await import('./index.js');
    await run();

    expect(h.scanMarkdown).toHaveBeenCalledTimes(1);
    expect(setOutput).toHaveBeenCalledWith('violations', JSON.stringify([...base, ...md]));
  });

  it('does not invoke the Markdown scanner when markdown is unset', async () => {
    h.scan.mockResolvedValue([]);
    setInputs({ mode: 'scan', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(h.scanMarkdown).not.toHaveBeenCalled();
  });
});

describe('github-action cookies support', () => {
  const COOKIES = [{ name: 'session', value: 'abc123', domain: 'example.com' }];

  it('routes to cookies-scanner in scan mode when both url and cookies are set', async () => {
    h.scanWithCookies.mockResolvedValue([]);
    setInputs({ mode: 'scan', dir: '.', url: 'https://example.com', cookies: JSON.stringify(COOKIES) });

    const { run } = await import('./index.js');
    await run();

    expect(h.scanWithCookies).toHaveBeenCalledWith(expect.any(String), { url: 'https://example.com', cookies: COOKIES });
    expect(h.scanOpts).not.toHaveBeenCalled();
  });

  it('routes to cookies-scanner in check mode when both url and cookies are set', async () => {
    h.scanWithCookies.mockResolvedValue([]);
    setInputs({ mode: 'check', dir: '.', url: 'https://example.com', cookies: JSON.stringify(COOKIES) });

    const { run } = await import('./index.js');
    await run();

    expect(h.scanWithCookies).toHaveBeenCalledWith(expect.any(String), { url: 'https://example.com', cookies: COOKIES });
    expect(h.scanOpts).not.toHaveBeenCalled();
  });

  it('fails early with a clear message when cookies JSON is invalid', async () => {
    const setFailed = vi.mocked(actionsCore.setFailed);
    setInputs({ mode: 'scan', dir: '.', url: 'https://example.com', cookies: 'not-json' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).toHaveBeenCalledWith(expect.stringContaining('Invalid `cookies` input'));
    expect(h.scanWithCookies).not.toHaveBeenCalled();
  });

  it('never echoes the raw cookies input into the failure message', async () => {
    const setFailed = vi.mocked(actionsCore.setFailed);
    // Malformed JSON (trailing comma) that still carries a session token.
    setInputs({
      mode: 'scan',
      dir: '.',
      url: 'https://example.com',
      cookies: '[{"name":"s","value":"SUPER_SECRET_TOKEN", ,}]',
    });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).toHaveBeenCalledWith(expect.stringContaining('Invalid `cookies` input'));
    expect(setFailed).toHaveBeenCalledWith(expect.not.stringContaining('SUPER_SECRET_TOKEN'));
    expect(h.scanWithCookies).not.toHaveBeenCalled();
  });

  it('masks every cookie value as a secret before scanning', async () => {
    h.scanWithCookies.mockResolvedValue([]);
    const setSecret = vi.mocked(actionsCore.setSecret);
    const twoCookies = [
      { name: 'session', value: 'tok-aaa', domain: 'example.com' },
      { name: 'csrf', value: 'tok-bbb', domain: 'example.com' },
    ];
    setInputs({ mode: 'scan', dir: '.', url: 'https://example.com', cookies: JSON.stringify(twoCookies) });

    const { run } = await import('./index.js');
    await run();

    expect(setSecret).toHaveBeenCalledWith('tok-aaa');
    expect(setSecret).toHaveBeenCalledWith('tok-bbb');
  });

  it('warns and ignores cookies in fix mode', async () => {
    h.scan.mockResolvedValue([]);
    h.applyAll.mockResolvedValue([]);
    const warning = vi.mocked(actionsCore.warning);
    setInputs({ mode: 'fix', dir: '.', url: 'https://example.com', cookies: JSON.stringify(COOKIES), 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(warning).toHaveBeenCalledWith(expect.stringContaining('URL fix-mode is not supported'));
    expect(h.scanWithCookies).not.toHaveBeenCalled();
    expect(h.scanOpts).toHaveBeenCalledWith({ html: false });
  });

  it('warns when cookies is set without url', async () => {
    h.scan.mockResolvedValue([]);
    const warning = vi.mocked(actionsCore.warning);
    setInputs({ mode: 'scan', dir: '.', cookies: JSON.stringify(COOKIES) });

    const { run } = await import('./index.js');
    await run();

    expect(warning).toHaveBeenCalledWith(expect.stringContaining('`cookies` is set but `url` is not'));
    expect(h.scanWithCookies).not.toHaveBeenCalled();
  });
});

describe('github-action error handling', () => {
  it('calls setFailed with the error message when a scan throws', async () => {
    h.scan.mockRejectedValue(new Error('scan exploded'));
    const setFailed = vi.mocked(actionsCore.setFailed);
    setInputs({ mode: 'check', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).toHaveBeenCalledWith('scan exploded');
  });
});

describe('github-action license gating', () => {
  it('fails and does nothing when no license key is provided', async () => {
    delete process.env['INPUT_LICENSE-KEY'];
    const setFailed = vi.mocked(actionsCore.setFailed);
    setInputs({ mode: 'check', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).toHaveBeenCalledWith(expect.stringContaining('valid license key'));
    expect(h.scan).not.toHaveBeenCalled();
  });

  it('fails when the license key is invalid', async () => {
    process.env['INPUT_LICENSE-KEY'] = 'garbage.token';
    const setFailed = vi.mocked(actionsCore.setFailed);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).toHaveBeenCalledWith(expect.stringContaining('license key'));
    expect(h.applyAll).not.toHaveBeenCalled();
    expect(h.createPR).not.toHaveBeenCalled();
  });
});

describe('github-action public-repo free tier', () => {
  it('runs without a license on a public repo', async () => {
    delete process.env['INPUT_LICENSE-KEY'];
    h.ctx.payload = { repository: { private: false } };
    h.scan.mockResolvedValue([]);
    const setFailed = vi.mocked(actionsCore.setFailed);
    const info = vi.mocked(actionsCore.info);
    setInputs({ mode: 'check', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).not.toHaveBeenCalled();
    expect(h.scan).toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(expect.stringContaining('free public-repo tier'));
  });

  it('still fails without a license on a private repo', async () => {
    delete process.env['INPUT_LICENSE-KEY'];
    h.ctx.payload = { repository: { private: true } };
    const setFailed = vi.mocked(actionsCore.setFailed);
    setInputs({ mode: 'check', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).toHaveBeenCalledWith(expect.stringContaining('valid license key'));
    expect(h.scan).not.toHaveBeenCalled();
  });
});

describe('github-action GitHub-native reporting', () => {
  it('posts a Check Run and creates a sticky PR comment in check mode', async () => {
    h.ctx.payload = { repository: { private: false }, pull_request: { number: 7 } };
    h.scan.mockResolvedValue([
      { id: 'image-alt', wcagId: '1.1.1', impact: 'serious', description: 'alt', helpUrl: 'h', nodes: [] },
    ]);
    setInputs({ mode: 'check', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.checksCreate).toHaveBeenCalledTimes(1);
    expect(h.listComments).toHaveBeenCalledTimes(1);
    expect(h.createComment).toHaveBeenCalledTimes(1);
    expect(h.updateComment).not.toHaveBeenCalled();
  });

  it('updates the existing sticky comment instead of creating a second', async () => {
    h.ctx.payload = { repository: { private: false }, pull_request: { number: 7 } };
    h.listComments.mockResolvedValueOnce({
      data: [{ id: 99, body: 'old\n<!-- a11y-fixer-report -->' }],
    });
    h.scan.mockResolvedValue([]);
    setInputs({ mode: 'check', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.updateComment).toHaveBeenCalledTimes(1);
    expect(h.createComment).not.toHaveBeenCalled();
  });

  it('warns (does not fail) when the Check Run API errors', async () => {
    h.ctx.payload = { repository: { private: false } };
    h.checksCreate.mockRejectedValueOnce(new Error('no checks permission'));
    h.scan.mockResolvedValue([]);
    const warning = vi.mocked(actionsCore.warning);
    const setFailed = vi.mocked(actionsCore.setFailed);
    setInputs({ mode: 'check', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(warning).toHaveBeenCalledWith(expect.stringContaining('check run'));
    expect(setFailed).not.toHaveBeenCalled();
  });

  it('falls back to inline workflow-command annotations when the Check Run is denied', async () => {
    h.ctx.payload = { repository: { private: false } };
    h.checksCreate.mockRejectedValueOnce(new Error('Resource not accessible by integration'));
    h.scan.mockResolvedValue([
      {
        id: 'image-alt',
        wcagId: '1.1.1',
        impact: 'serious',
        description: 'Image missing alt',
        helpUrl: 'https://help/image-alt',
        nodes: [{ html: '<img>', target: ['img'], failureSummary: 'fix it', sourceFile: 'src/App.tsx', sourceLine: 12 }],
      },
    ]);
    const error = vi.mocked(actionsCore.error);
    setInputs({ mode: 'check', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    // One error-level annotation pinned to the source location (plus the
    // setFailed summary error, which carries no file — assert on the pinned one).
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('Image missing alt'),
      expect.objectContaining({ file: 'src/App.tsx', startLine: 12, title: expect.stringContaining('image-alt') }),
    );
  });

  it('fallback routes moderate to warning and minor to notice annotations', async () => {
    h.ctx.payload = { repository: { private: false } };
    h.checksCreate.mockRejectedValueOnce(new Error('denied'));
    h.scan.mockResolvedValue([
      { id: 'r1', wcagId: '1.4.3', impact: 'moderate', description: 'contrast', helpUrl: 'h', nodes: [{ html: '', target: [], failureSummary: '', sourceFile: 'a.tsx', sourceLine: 1 }] },
      { id: 'r2', wcagId: '2.4.4', impact: 'minor', description: 'linknote', helpUrl: 'h', nodes: [{ html: '', target: [], failureSummary: '', sourceFile: 'b.tsx', sourceLine: 2 }] },
    ]);
    const warning = vi.mocked(actionsCore.warning);
    const notice = vi.mocked(actionsCore.notice);
    setInputs({ mode: 'check', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(warning).toHaveBeenCalledWith(expect.stringContaining('contrast'), expect.objectContaining({ file: 'a.tsx' }));
    expect(notice).toHaveBeenCalledWith(expect.stringContaining('linknote'), expect.objectContaining({ file: 'b.tsx' }));
  });

  it('pins the Check Run to the PR head sha, not the merge-commit context sha', async () => {
    h.ctx.sha = 'mergecommitsha';
    h.ctx.payload = {
      repository: { private: false },
      pull_request: { number: 7, head: { sha: 'realheadsha' } },
    };
    h.scan.mockResolvedValue([]);
    setInputs({ mode: 'check', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.checksCreate).toHaveBeenCalledTimes(1);
    expect((h.checksCreate.mock.calls[0][0] as { head_sha?: string }).head_sha).toBe('realheadsha');
  });

  it('never fails the run when the GitHub client cannot be built', async () => {
    h.ctx.payload = { repository: { private: false } };
    h.scan.mockResolvedValue([]);
    // Make getOctokit itself throw — the old code called it outside the try/catch.
    h.octokitThrows = true;
    const setFailed = vi.mocked(actionsCore.setFailed);
    const warning = vi.mocked(actionsCore.warning);
    setInputs({ mode: 'check', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(setFailed).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('could not initialize the GitHub client'));
  });

  it('fix mode posts a neutral Check Run so it never hard-blocks a merge', async () => {
    h.ctx.payload = { repository: { private: false }, pull_request: { number: 5, head: { sha: 'h' } } };
    h.scan.mockResolvedValue([
      { id: 'x', wcagId: '1.1.1', impact: 'serious', description: 'd', helpUrl: 'u', nodes: [] },
    ]);
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    const neutral = h.checksCreate.mock.calls.find(
      c => (c[0] as { conclusion?: string }).conclusion === 'neutral',
    );
    expect(neutral).toBeTruthy();
  });

  it('skips reporting entirely when no github-token is provided', async () => {
    h.ctx.payload = { repository: { private: false } };
    h.scan.mockResolvedValue([]);
    setInputs({ mode: 'check', dir: '.' });

    const { run } = await import('./index.js');
    await run();

    expect(h.checksCreate).not.toHaveBeenCalled();
    expect(h.listComments).not.toHaveBeenCalled();
  });

  it('warns (does not fail) when the sticky comment API errors', async () => {
    h.ctx.payload = { repository: { private: false }, pull_request: { number: 7 } };
    h.createComment.mockRejectedValueOnce(new Error('no pull-requests permission'));
    h.scan.mockResolvedValue([]);
    const warning = vi.mocked(actionsCore.warning);
    const setFailed = vi.mocked(actionsCore.setFailed);
    setInputs({ mode: 'check', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(warning).toHaveBeenCalledWith(expect.stringContaining('PR comment'));
    expect(setFailed).not.toHaveBeenCalled();
  });

  it('leaves a before -> after sticky comment on the triggering PR in fix mode', async () => {
    h.ctx.payload = { repository: { private: false }, pull_request: { number: 7 } };
    h.scan.mockResolvedValueOnce([{}, {}]).mockResolvedValueOnce([{}]); // before: 2, after: 1
    h.applyAll.mockResolvedValue([APPLIED_FIX]);
    setInputs({ mode: 'fix', dir: '.', 'github-token': 'tok' });

    const { run } = await import('./index.js');
    await run();

    expect(h.checksCreate).toHaveBeenCalledTimes(1);
    expect(h.createComment).toHaveBeenCalledTimes(1);
    expect(h.createComment).toHaveBeenCalledWith(
      expect.objectContaining({ issue_number: 7, body: expect.stringContaining('→') }),
    );
  });
});
