import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { FrameTitleFixer, addFrameTitle } from './frame-title.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'frame-title'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'Frames must have an accessible name',
    helpUrl: '',
    nodes: [{
      html: '<iframe src="/videos/intro.html"></iframe>',
      target: ['iframe'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('addFrameTitle', () => {
  it('derives a title from the src path segment', () => {
    expect(addFrameTitle('<iframe src="/videos/getting-started.html"></iframe>'))
      .toBe('<iframe src="/videos/getting-started.html" title="getting started"></iframe>');
  });

  it('prefers aria-label over src', () => {
    expect(addFrameTitle('<iframe aria-label="Promo video" src="/a/b.html"></iframe>'))
      .toBe('<iframe aria-label="Promo video" src="/a/b.html" title="Promo video"></iframe>');
  });

  it('prefers name over src when there is no aria-label', () => {
    expect(addFrameTitle('<iframe name="checkout" src="/a/b.html"></iframe>'))
      .toBe('<iframe name="checkout" src="/a/b.html" title="checkout"></iframe>');
  });

  it('fills an existing empty title in place', () => {
    expect(addFrameTitle('<iframe title="" src="/a/report.pdf"></iframe>'))
      .toBe('<iframe title="report" src="/a/report.pdf"></iframe>');
  });

  it('drops query strings and file extensions when deriving from src', () => {
    expect(addFrameTitle('<iframe src="https://x.com/path/my_page.php?id=3#top"></iframe>'))
      .toBe('<iframe src="https://x.com/path/my_page.php?id=3#top" title="my page"></iframe>');
  });

  it('escapes quotes in a derived title', () => {
    expect(addFrameTitle('<iframe aria-label=\'Say "hi"\' src="/a.html"></iframe>'))
      .toBe('<iframe aria-label=\'Say "hi"\' src="/a.html" title="Say &quot;hi&quot;"></iframe>');
  });

  it('returns null when the frame already has a non-empty title', () => {
    expect(addFrameTitle('<iframe title="Existing" src="/a.html"></iframe>')).toBeNull();
  });

  it('returns null when there is no frame on the line', () => {
    expect(addFrameTitle('<div>no frame</div>')).toBeNull();
  });

  it('returns null when no source yields a sensible title', () => {
    expect(addFrameTitle('<iframe src="/"></iframe>')).toBeNull();
  });
});

describe('FrameTitleFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'frame-title-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not another id', () => {
    const fixer = new FrameTitleFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'image-alt'))).toBe(false);
  });

  it('adds a title on the recorded line, leaving other lines untouched', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<iframe src="/videos/intro.html"></iframe>\n</main>');
    const fixer = new FrameTitleFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('title="intro"');
    expect(contents).toContain('<main>'); // other lines untouched
  });

  it('human-flags when there is no node data', async () => {
    const fixer = new FrameTitleFixer(dir);
    const bare = violation(undefined, undefined);
    bare.nodes = [];
    const result = await fixer.fix(bare);
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new FrameTitleFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the source file cannot be read', async () => {
    const fixer = new FrameTitleFixer(dir);
    const result = await fixer.fix(violation(path.join(dir, 'missing.html'), 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<iframe src="/a.html"></iframe>');
    const fixer = new FrameTitleFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when no title can be derived from the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<iframe src="/"></iframe>');
    const fixer = new FrameTitleFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
