import { describe, it, expect, vi, afterEach } from 'vitest';
import zlib from 'node:zlib';
import type { A11yViolation } from '@a11y-fixer/core';
import {
  impactToSarifLevel,
  toSarif,
  encodeSarif,
  uploadSarif,
  type SarifLog,
  type SarifOctokitLike,
} from './sarif.js';

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

afterEach(() => {
  delete process.env['GITHUB_WORKSPACE'];
});

describe('impactToSarifLevel', () => {
  it('maps critical and serious to error', () => {
    expect(impactToSarifLevel('critical')).toBe('error');
    expect(impactToSarifLevel('serious')).toBe('error');
  });
  it('maps moderate to warning and minor to note', () => {
    expect(impactToSarifLevel('moderate')).toBe('warning');
    expect(impactToSarifLevel('minor')).toBe('note');
  });
});

describe('toSarif', () => {
  it('emits a valid 2.1.0 log skeleton', () => {
    const log = toSarif([]);
    expect(log.version).toBe('2.1.0');
    expect(log.runs).toHaveLength(1);
    expect(log.runs[0].tool.driver.name).toBe('a11y-fixer');
  });

  it('builds one rule per unique violation id and one result per located node', () => {
    const log = toSarif([violation(), violation()]);
    // Same id twice → a single deduped rule, but two results.
    expect(log.runs[0].tool.driver.rules).toHaveLength(1);
    expect(log.runs[0].results).toHaveLength(2);
    const rule = log.runs[0].tool.driver.rules[0];
    expect(rule.id).toBe('image-alt');
    expect(rule.helpUri).toBe('https://example.com/image-alt');
    expect(rule.defaultConfiguration.level).toBe('error');
    expect(rule.properties?.tags).toContain('WCAG-1.1.1');
  });

  it('keeps distinct rules for distinct violation ids', () => {
    const log = toSarif([violation(), violation({ id: 'link-name', wcagId: '2.4.4' })]);
    expect(log.runs[0].tool.driver.rules.map(r => r.id).sort()).toEqual(['image-alt', 'link-name']);
  });

  it('maps a result to a repo-relative location with line and column', () => {
    const v = violation({
      nodes: [{ html: '<img>', target: ['img'], failureSummary: '', sourceFile: 'src/App.tsx', sourceLine: 12, sourceColumn: 5 }],
    });
    const loc = toSarif([v]).runs[0].results[0].locations[0].physicalLocation;
    expect(loc.artifactLocation.uri).toBe('src/App.tsx');
    expect(loc.region).toEqual({ startLine: 12, startColumn: 5 });
  });

  it('relativizes an absolute scanner path against GITHUB_WORKSPACE', () => {
    process.env['GITHUB_WORKSPACE'] = '/home/runner/work/repo/repo';
    const v = violation({
      nodes: [{ html: '<img>', target: ['img'], failureSummary: '', sourceFile: '/home/runner/work/repo/repo/src/App.tsx', sourceLine: 3 }],
    });
    expect(toSarif([v]).runs[0].results[0].locations[0].physicalLocation.artifactLocation.uri).toBe('src/App.tsx');
  });

  it('skips nodes with no source location but still emits the rule', () => {
    const v = violation({ nodes: [{ html: '<img>', target: ['img'], failureSummary: '' }] });
    const log = toSarif([v]);
    expect(log.runs[0].results).toHaveLength(0);
    expect(log.runs[0].tool.driver.rules).toHaveLength(1);
  });

  it('tolerates a violation with no nodes array', () => {
    const v = { ...violation(), nodes: undefined } as unknown as A11yViolation;
    expect(toSarif([v]).runs[0].results).toHaveLength(0);
  });

  it('produces a stable fingerprint for the same id/path/line', () => {
    const a = toSarif([violation()]).runs[0].results[0].partialFingerprints.primaryLocationLineHash;
    const b = toSarif([violation()]).runs[0].results[0].partialFingerprints.primaryLocationLineHash;
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe('encodeSarif', () => {
  it('gzip+base64 encodes to a payload that decodes back to the log', () => {
    const log = toSarif([violation()]);
    const encoded = encodeSarif(log);
    const decoded = JSON.parse(zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8')) as SarifLog;
    expect(decoded).toEqual(log);
  });
});

describe('uploadSarif', () => {
  function octokitSpy() {
    const uploadSarifFn = vi.fn().mockResolvedValue({ data: { id: 'x' } });
    const octokit: SarifOctokitLike = { rest: { codeScanning: { uploadSarif: uploadSarifFn } } };
    return { octokit, uploadSarifFn };
  }

  it('uploads a gzip+base64 SARIF with the ref and commit sha', async () => {
    const { octokit, uploadSarifFn } = octokitSpy();
    await uploadSarif(octokit, { owner: 'o', repo: 'r', ref: 'refs/pull/1/merge', commitSha: 'abc123' }, [violation()]);
    expect(uploadSarifFn).toHaveBeenCalledTimes(1);
    const params = uploadSarifFn.mock.calls[0][0];
    expect(params).toMatchObject({ owner: 'o', repo: 'r', ref: 'refs/pull/1/merge', commit_sha: 'abc123' });
    const decoded = JSON.parse(zlib.gunzipSync(Buffer.from(params.sarif, 'base64')).toString('utf8')) as SarifLog;
    expect(decoded.runs[0].results).toHaveLength(1);
  });

  it('uploads an empty run when there are no violations (clears stale alerts)', async () => {
    const { octokit, uploadSarifFn } = octokitSpy();
    await uploadSarif(octokit, { owner: 'o', repo: 'r', ref: 'refs/heads/main', commitSha: 'sha' }, []);
    const decoded = JSON.parse(zlib.gunzipSync(Buffer.from(uploadSarifFn.mock.calls[0][0].sarif, 'base64')).toString('utf8')) as SarifLog;
    expect(decoded.runs[0].results).toHaveLength(0);
  });

  it('propagates an API error so the caller can warn and continue', async () => {
    const uploadSarifFn = vi.fn().mockRejectedValue(new Error('403 security-events'));
    const octokit: SarifOctokitLike = { rest: { codeScanning: { uploadSarif: uploadSarifFn } } };
    await expect(
      uploadSarif(octokit, { owner: 'o', repo: 'r', ref: 'refs/heads/main', commitSha: 'sha' }, [violation()]),
    ).rejects.toThrow('403');
  });
});
