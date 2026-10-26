import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { A11yViolation, FixResult } from '@a11y-fixer/core';

// The fix command's PR-creation branch calls PullRequestBuilder (git + GitHub
// network) and needs *applied* fixes to commit. Both are mocked here so the
// branch is exercised hermetically. vi.mock is file-scoped, so this lives in its
// own file rather than commands.test.ts, whose tests assert the real, offline
// behavior of core.
const h = vi.hoisted(() => ({
  scanSource: vi.fn(),
  applyAll: vi.fn(),
  dedupeFixFiles: vi.fn(),
  createPR: vi.fn(),
  builderCtor: vi.fn(),
}));

vi.mock('@a11y-fixer/core', () => ({
  scanSource: h.scanSource,
  dedupeFixFiles: h.dedupeFixFiles,
  buildCoreRegistry: vi.fn(() => ({ applyAll: h.applyAll })),
  PullRequestBuilder: class {
    constructor(opts: unknown) {
      h.builderCtor(opts);
    }
    createPR = h.createPR;
  },
}));

const { fixCommand } = await import('./fix.js');

const violation: A11yViolation = {
  id: 'color-contrast',
  wcagId: '1.4.3',
  impact: 'serious',
  description: 'Elements must meet contrast ratio thresholds',
  helpUrl: 'https://example.test/color-contrast',
  nodes: [],
};

const appliedFix: FixResult = {
  wcagId: '1.4.3',
  bucket: 'rule-based',
  applied: true,
  description: 'Raised foreground contrast',
  before: '#777',
  after: '#595959',
  sourceLocation: { file: '/repo/Foo.tsx', line: 10, column: 3 },
};

const flaggedFix: FixResult = {
  wcagId: '1.1.1',
  bucket: 'ai-assisted',
  applied: false,
  description: 'Image needs alt text',
  before: '<img>',
  humanNote: 'Needs a human-authored alt description',
};

/** Captures console.log/error written while `fn` runs. */
async function captureOutput(fn: () => Promise<unknown>): Promise<string> {
  const lines: string[] = [];
  const push = (...args: unknown[]) => void lines.push(args.map(String).join(' '));
  const logSpy = vi.spyOn(console, 'log').mockImplementation(push);
  const errSpy = vi.spyOn(console, 'error').mockImplementation(push);
  try {
    await fn();
  } finally {
    logSpy.mockRestore();
    errSpy.mockRestore();
  }
  return lines.join('\n');
}

beforeEach(() => {
  h.scanSource.mockResolvedValue([violation]);
  h.applyAll.mockResolvedValue([appliedFix, flaggedFix]);
  h.dedupeFixFiles.mockReturnValue(['/repo/Foo.tsx']);
  h.createPR.mockResolvedValue({ url: 'https://github.test/pr/7', branch: 'a11y-fixer/x', number: 7 });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('fix command PR path', () => {
  it('creates a PR and prints its URL when --owner/--repo are given', async () => {
    const out = await captureOutput(() =>
      fixCommand().parseAsync(
        ['/repo', '--owner', 'acme', '--repo', 'site', '--base', 'develop', '--repo-root', '/repo'],
        { from: 'user' },
      ),
    );

    // Applied/flagged output formatting.
    expect(out).toContain('Applied: 1, Human review needed: 1');
    expect(out).toContain('✓ WCAG 1.4.3: Raised foreground contrast');
    expect(out).toContain('⚠ WCAG 1.1.1: Needs a human-authored alt description');

    // PR wiring: builder gets the CLI options, createPR gets fixes + before/after.
    expect(h.builderCtor).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'acme', repo: 'site', baseBranch: 'develop', repoRoot: '/repo' }),
    );
    expect(h.createPR).toHaveBeenCalledWith(
      [appliedFix, flaggedFix],
      [violation],
      [violation],
      ['/repo/Foo.tsx'],
    );
    expect(out).toContain('PR created: https://github.test/pr/7');
    // Re-scan happens for the delta table: once before, once after.
    expect(h.scanSource).toHaveBeenCalledTimes(2);
  });

  it('skips the PR when no files were changed', async () => {
    h.dedupeFixFiles.mockReturnValue([]);

    const out = await captureOutput(() =>
      fixCommand().parseAsync(['/repo', '--owner', 'acme', '--repo', 'site'], { from: 'user' }),
    );

    expect(out).toContain('No files were changed — skipping PR.');
    expect(h.createPR).not.toHaveBeenCalled();
  });

  it('does not attempt a PR when owner/repo are omitted', async () => {
    const out = await captureOutput(() => fixCommand().parseAsync(['/repo'], { from: 'user' }));

    expect(out).toContain('Applied: 1, Human review needed: 1');
    expect(out).not.toContain('Creating PR');
    expect(h.createPR).not.toHaveBeenCalled();
    // Only the initial scan — no re-scan without a PR.
    expect(h.scanSource).toHaveBeenCalledTimes(1);
  });

  it('reports no violations and skips fixing when the scan is clean', async () => {
    h.scanSource.mockResolvedValue([]);

    const out = await captureOutput(() =>
      fixCommand().parseAsync(['/repo', '--owner', 'acme', '--repo', 'site'], { from: 'user' }),
    );

    expect(out).toContain('No violations found.');
    expect(h.applyAll).not.toHaveBeenCalled();
    expect(h.createPR).not.toHaveBeenCalled();
  });
});
