import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MetaRefreshFixer, isPureTimedRefresh } from './meta-refresh.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'meta-refresh'): A11yViolation {
  return {
    id,
    wcagId: '2.2.1',
    impact: 'minor',
    description: 'Timed refresh must not exist',
    helpUrl: '',
    nodes: [{
      html: '<meta http-equiv="refresh" content="30">',
      target: ['meta[http-equiv="refresh"]'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('isPureTimedRefresh', () => {
  it('accepts a plain positive delay', () => {
    expect(isPureTimedRefresh('30')).toBe(true);
  });

  it('accepts a zero delay', () => {
    expect(isPureTimedRefresh('0')).toBe(true);
  });

  it('rejects a delay carrying a url= redirect', () => {
    expect(isPureTimedRefresh('5; url=/foo')).toBe(false);
    expect(isPureTimedRefresh('0;url=http://x')).toBe(false);
    expect(isPureTimedRefresh('0; URL=/foo')).toBe(false);
  });

  it('rejects empty or non-numeric content', () => {
    expect(isPureTimedRefresh('')).toBe(false);
    expect(isPureTimedRefresh('   ')).toBe(false);
    expect(isPureTimedRefresh('soon')).toBe(false);
  });
});

describe('MetaRefreshFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'metarefresh-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches axe meta-refresh, not other ids', () => {
    const fixer = new MetaRefreshFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'meta-viewport'))).toBe(false);
  });

  it('removes a pure timed refresh from the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(
      file,
      '<head>\n<meta http-equiv="refresh" content="30">\n</head>',
    );
    const fixer = new MetaRefreshFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).not.toContain('http-equiv');
    expect(contents).toContain('<head>'); // other lines untouched
  });

  it('handles single-quoted attributes', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, "<meta http-equiv='refresh' content='0'>");
    const fixer = new MetaRefreshFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    const contents = await readFile(file, 'utf8');
    expect(contents).toBe('');
  });

  it('human-flags a refresh that carries a url= redirect, leaving the file intact', async () => {
    const file = path.join(dir, 'index.html');
    const source = '<meta http-equiv="refresh" content="0; url=/next">';
    await writeFile(file, source);
    const fixer = new MetaRefreshFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(false);
    expect(result.bucket).toBe('human-flagged');
    expect(await readFile(file, 'utf8')).toBe(source);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new MetaRefreshFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));

    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<meta http-equiv="refresh" content="30">');
    const fixer = new MetaRefreshFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no meta refresh', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<meta name="viewport" content="width=device-width">');
    const fixer = new MetaRefreshFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
