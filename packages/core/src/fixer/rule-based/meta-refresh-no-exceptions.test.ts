import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MetaRefreshNoExceptionsFixer } from './meta-refresh-no-exceptions.js';
import { removeTimedMetaRefresh } from './meta-refresh.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'meta-refresh-no-exceptions'): A11yViolation {
  return {
    id,
    wcagId: '2.2.4',
    impact: 'serious',
    description: 'timed refresh must not be used',
    helpUrl: '',
    nodes: [{ html: '<meta http-equiv="refresh" content="30">', target: ['meta'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeTimedMetaRefresh', () => {
  it('removes a pure timed refresh', () => {
    expect(removeTimedMetaRefresh('<meta http-equiv="refresh" content="30">')).toBe('');
  });
  it('returns null for a url= redirect', () => {
    expect(removeTimedMetaRefresh('<meta http-equiv="refresh" content="0; url=/next">')).toBeNull();
  });
  it('returns null for a non-refresh meta', () => {
    expect(removeTimedMetaRefresh('<meta charset="utf-8">')).toBeNull();
  });
});

describe('MetaRefreshNoExceptionsFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'meta-refresh-nx-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new MetaRefreshNoExceptionsFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'meta-refresh'))).toBe(false);
  });

  it('removes a pure timed refresh on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<head>\n<meta http-equiv="refresh" content="30">\n</head>');
    const result = await new MetaRefreshNoExceptionsFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).not.toContain('refresh');
  });

  it('human-flags a url= redirect', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<meta http-equiv="refresh" content="0; url=/next">');
    const result = await new MetaRefreshNoExceptionsFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
