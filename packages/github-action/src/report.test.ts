import { describe, it, expect, vi } from 'vitest';
import type { A11yViolation } from '@a11y-fixer/core';
import {
  impactToLevel,
  toAnnotations,
  toRepoRelative,
  summaryMarkdown,
  postCheckRun,
  upsertStickyComment,
  STICKY_MARKER,
  type OctokitLike,
} from './report.js';

function violation(overrides: Partial<A11yViolation> = {}): A11yViolation {
  return {
    id: 'image-alt',
    wcagId: '1.1.1',
    impact: 'serious',
    description: 'Images must have alternate text',
    helpUrl: 'https://example.com/image-alt',
    nodes: [
      { html: '<img>', target: ['img'], failureSummary: 'add alt', sourceFile: 'src/App.tsx', sourceLine: 12 },
    ],
    ...overrides,
  };
}

describe('impactToLevel', () => {
  it('maps critical and serious to failure', () => {
    expect(impactToLevel('critical')).toBe('failure');
    expect(impactToLevel('serious')).toBe('failure');
  });
  it('maps moderate to warning and minor to notice', () => {
    expect(impactToLevel('moderate')).toBe('warning');
    expect(impactToLevel('minor')).toBe('notice');
  });
});

describe('toAnnotations', () => {
  it('builds one annotation per source-located node', () => {
    const anns = toAnnotations([violation()]);
    expect(anns).toEqual([
      {
        path: 'src/App.tsx',
        start_line: 12,
        end_line: 12,
        annotation_level: 'failure',
        title: 'image-alt (WCAG 1.1.1)',
        message: 'Images must have alternate text\nhttps://example.com/image-alt',
        raw_details: 'add alt',
      },
    ]);
  });

  it('skips nodes with no source location (e.g. URL-only scans)', () => {
    const v = violation({ nodes: [{ html: '<img>', target: ['img'], failureSummary: '' }] });
    expect(toAnnotations([v])).toEqual([]);
  });

  it('tolerates a violation with no nodes array', () => {
    const v = { ...violation(), nodes: undefined } as unknown as A11yViolation;
    expect(toAnnotations([v])).toEqual([]);
  });

  it('omits raw_details when the failure summary is empty', () => {
    const v = violation({ nodes: [{ html: '<img>', target: ['img'], failureSummary: '', sourceFile: 'a.tsx', sourceLine: 1 }] });
    expect(toAnnotations([v])[0].raw_details).toBeUndefined();
  });

  it('relativizes an absolute scanner path so the annotation pins to the diff', () => {
    const prev = process.env['GITHUB_WORKSPACE'];
    process.env['GITHUB_WORKSPACE'] = '/home/runner/work/repo/repo';
    try {
      const v = violation({
        nodes: [{ html: '<img>', target: ['img'], failureSummary: '', sourceFile: '/home/runner/work/repo/repo/src/App.tsx', sourceLine: 3 }],
      });
      // Absolute paths never pin on GitHub; the annotation path must be repo-relative.
      expect(toAnnotations([v])[0].path).toBe('src/App.tsx');
    } finally {
      if (prev === undefined) delete process.env['GITHUB_WORKSPACE'];
      else process.env['GITHUB_WORKSPACE'] = prev;
    }
  });
});

describe('toRepoRelative', () => {
  it('leaves an already-relative path unchanged', () => {
    expect(toRepoRelative('src/App.tsx')).toBe('src/App.tsx');
  });
  it('strips the workspace root from an absolute path', () => {
    const prev = process.env['GITHUB_WORKSPACE'];
    process.env['GITHUB_WORKSPACE'] = '/ws';
    try {
      expect(toRepoRelative('/ws/packages/a/b.ts')).toBe('packages/a/b.ts');
    } finally {
      if (prev === undefined) delete process.env['GITHUB_WORKSPACE'];
      else process.env['GITHUB_WORKSPACE'] = prev;
    }
  });
  it('falls back to the basename for a path outside the root (no ../ escape)', () => {
    const prev = process.env['GITHUB_WORKSPACE'];
    process.env['GITHUB_WORKSPACE'] = '/ws';
    try {
      expect(toRepoRelative('/other/x.ts')).toBe('x.ts');
    } finally {
      if (prev === undefined) delete process.env['GITHUB_WORKSPACE'];
      else process.env['GITHUB_WORKSPACE'] = prev;
    }
  });
});

describe('summaryMarkdown', () => {
  it('summarizes current violations with impact counts in check mode', () => {
    const md = summaryMarkdown([violation(), violation({ impact: 'minor' })]);
    expect(md).toContain(STICKY_MARKER);
    expect(md).toContain('Found **2**');
    expect(md).toContain('1 serious');
    expect(md).toContain('1 minor');
    expect(md).toContain('`image-alt`');
  });

  it('reports a clean check', () => {
    expect(summaryMarkdown([])).toContain('No accessibility violations found');
  });

  it('renders a before → after delta in fix mode', () => {
    const md = summaryMarkdown([violation(), violation()], [violation()]);
    expect(md).toContain('**2 → 1**');
    expect(md).toContain('1 fixed');
    expect(md).toContain('Remaining:');
  });

  it('celebrates when fix mode cleared everything', () => {
    const md = summaryMarkdown([violation()], []);
    expect(md).toContain('All detected violations were fixed');
  });

  it('caps the list at 10 and notes the remainder', () => {
    const many = Array.from({ length: 13 }, () => violation());
    const md = summaryMarkdown(many);
    expect(md).toContain('and 3 more');
  });
});

/** Minimal octokit double capturing calls, with spies for assertions. */
function fakeOctokit() {
  const checksCreate = vi.fn(async (..._a: unknown[]) => ({ data: { id: 101 } }));
  const checksUpdate = vi.fn(async (..._a: unknown[]) => ({}));
  const listComments = vi.fn(async (..._a: unknown[]) => ({ data: [] as Array<{ id: number; body?: string; user?: { type?: string } | null }> }));
  const createComment = vi.fn(async (..._a: unknown[]) => ({}));
  const updateComment = vi.fn(async (..._a: unknown[]) => ({}));
  const octokit: OctokitLike = {
    rest: {
      checks: { create: checksCreate, update: checksUpdate },
      issues: { listComments, createComment, updateComment },
    },
  };
  return { octokit, checksCreate, checksUpdate, listComments, createComment, updateComment };
}

describe('postCheckRun', () => {
  it('creates a single successful check run for zero violations', async () => {
    const f = fakeOctokit();
    await postCheckRun(f.octokit, { owner: 'o', repo: 'r', sha: 'abc' }, []);
    expect(f.checksCreate).toHaveBeenCalledTimes(1);
    expect(f.checksCreate.mock.calls[0][0]).toMatchObject({ conclusion: 'success', head_sha: 'abc' });
    expect(f.checksUpdate).not.toHaveBeenCalled();
  });

  it('batches annotations in groups of 50 across create + update', async () => {
    const f = fakeOctokit();
    const many = Array.from({ length: 60 }, (_, i) => violation({
      nodes: [{ html: '<img>', target: ['img'], failureSummary: '', sourceFile: `f${i}.tsx`, sourceLine: 1 }],
    }));
    await postCheckRun(f.octokit, { owner: 'o', repo: 'r', sha: 'abc' }, many);
    expect((f.checksCreate.mock.calls[0][0] as { output: { annotations: unknown[] } }).output.annotations).toHaveLength(50);
    expect(f.checksUpdate).toHaveBeenCalledTimes(1);
    expect((f.checksUpdate.mock.calls[0][0] as { output: { annotations: unknown[] } }).output.annotations).toHaveLength(10);
    expect((f.checksUpdate.mock.calls[0][0] as { check_run_id: number }).check_run_id).toBe(101);
  });

  it('concludes neutral (not failure) when asked, so fix-mode never gates merges', async () => {
    const f = fakeOctokit();
    await postCheckRun(f.octokit, { owner: 'o', repo: 'r', sha: 'abc' }, [violation()], { neutral: true });
    expect(f.checksCreate.mock.calls[0][0]).toMatchObject({ conclusion: 'neutral' });
  });

  it('does not throw when a later update batch fails (the Check Run already exists)', async () => {
    const f = fakeOctokit();
    f.checksUpdate.mockRejectedValueOnce(new Error('rate limited'));
    const many = Array.from({ length: 60 }, (_, i) => violation({
      nodes: [{ html: '<img>', target: ['img'], failureSummary: '', sourceFile: `f${i}.tsx`, sourceLine: 1 }],
    }));
    // The first 50 annotations shipped with create(); a transient update failure
    // must not propagate (that would trigger the caller's duplicate fallback).
    await expect(postCheckRun(f.octokit, { owner: 'o', repo: 'r', sha: 'abc' }, many)).resolves.toBeUndefined();
  });
});

describe('upsertStickyComment', () => {
  it('creates a comment when none exists', async () => {
    const f = fakeOctokit();
    await upsertStickyComment(f.octokit, { owner: 'o', repo: 'r', issueNumber: 3 }, 'body');
    expect(f.createComment).toHaveBeenCalledWith(expect.objectContaining({ issue_number: 3, body: 'body' }));
    expect(f.updateComment).not.toHaveBeenCalled();
  });

  it('updates the existing marked comment in place', async () => {
    const f = fakeOctokit();
    f.listComments.mockResolvedValue({ data: [{ id: 9, body: `x ${STICKY_MARKER}` }] });
    await upsertStickyComment(f.octokit, { owner: 'o', repo: 'r', issueNumber: 3 }, 'new body');
    expect(f.updateComment).toHaveBeenCalledWith(expect.objectContaining({ comment_id: 9, body: 'new body' }));
    expect(f.createComment).not.toHaveBeenCalled();
  });

  it('finds the sticky comment on a later page instead of spamming a new one', async () => {
    const f = fakeOctokit();
    // Page 1: a full page (100) of unrelated comments; page 2: our sticky.
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, body: 'chatter' }));
    f.listComments
      .mockResolvedValueOnce({ data: fullPage })
      .mockResolvedValueOnce({ data: [{ id: 999, body: `old ${STICKY_MARKER}`, user: { type: 'Bot' } }] });
    await upsertStickyComment(f.octokit, { owner: 'o', repo: 'r', issueNumber: 3 }, 'new body');
    expect(f.listComments).toHaveBeenCalledTimes(2);
    expect(f.updateComment).toHaveBeenCalledWith(expect.objectContaining({ comment_id: 999 }));
    expect(f.createComment).not.toHaveBeenCalled();
  });

  it('prefers the bot-authored marker comment over a human quoting the marker', async () => {
    const f = fakeOctokit();
    f.listComments.mockResolvedValue({
      data: [
        { id: 1, body: `human quoting ${STICKY_MARKER}`, user: { type: 'User' } },
        { id: 2, body: `our report ${STICKY_MARKER}`, user: { type: 'Bot' } },
      ],
    });
    await upsertStickyComment(f.octokit, { owner: 'o', repo: 'r', issueNumber: 3 }, 'new body');
    expect(f.updateComment).toHaveBeenCalledWith(expect.objectContaining({ comment_id: 2 }));
  });
});
