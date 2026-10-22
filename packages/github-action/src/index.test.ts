import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Shared spies/state, hoisted so the vi.mock factory below can close over them.
const h = vi.hoisted(() => ({
  createPR: vi.fn(async (..._args: unknown[]) => ({ url: 'https://github.com/o/r/pull/42', branch: 'a11y-fixer/x', number: 42 })),
  scan: vi.fn(),
  applyAll: vi.fn(),
  prCtor: vi.fn(),
}));

vi.mock('@actions/github', () => ({
  context: { repo: { owner: 'o', repo: 'r' } },
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
  return {
    EslintRunner,
    FixerRegistry,
    buildDefaultRegistry: () => new FixerRegistry(),
    PullRequestBuilder,
    AxeDetector: noop,
    PuppeteerRunner: noop,
    ReactJSXMapper: noop,
    AnthropicProvider: noop,
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

beforeEach(() => {
  vi.clearAllMocks();
  for (const k of Object.keys(process.env)) {
    if (k.startsWith('INPUT_')) delete process.env[k];
  }
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
});
