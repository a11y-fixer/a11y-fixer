import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ImageAltFixer, addImageAlt } from './image-alt.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'image-alt'): A11yViolation {
  return {
    id,
    wcagId: '1.1.1',
    impact: 'critical',
    description: 'Images must have alternative text',
    helpUrl: '',
    nodes: [{
      html: '<img src="/images/team_photo.png">',
      target: ['img'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('addImageAlt', () => {
  it('derives alt from the image src filename', () => {
    expect(addImageAlt('<img src="/images/team_photo.png">'))
      .toBe('<img src="/images/team_photo.png" alt="team photo">');
  });

  it('works on a self-closing img', () => {
    expect(addImageAlt('<img src="/a/hero-banner.jpg" />'))
      .toBe('<img src="/a/hero-banner.jpg" alt="hero banner" />');
  });

  it('is case-insensitive on the tag name', () => {
    expect(addImageAlt('<IMG src="/next.png">'))
      .toBe('<IMG src="/next.png" alt="next">');
  });

  it('returns null when there is no img on the line', () => {
    expect(addImageAlt('<input type="image" src="/x.png">')).toBeNull();
  });

  it('leaves an intentional empty alt="" (decorative) untouched', () => {
    expect(addImageAlt('<img alt="" src="/spacer.gif">')).toBeNull();
  });

  it('returns null when alt is already non-empty', () => {
    expect(addImageAlt('<img alt="A photo" src="/x.png">')).toBeNull();
  });

  it('returns null when aria-label is already set', () => {
    expect(addImageAlt('<img aria-label="A photo" src="/x.png">')).toBeNull();
  });

  it('returns null when aria-labelledby is already set', () => {
    expect(addImageAlt('<img aria-labelledby="cap1" src="/x.png">')).toBeNull();
  });

  it('returns null when title is already set', () => {
    expect(addImageAlt('<img title="A photo" src="/x.png">')).toBeNull();
  });

  it('returns null for an explicitly decorative image (role=presentation)', () => {
    expect(addImageAlt('<img role="presentation" src="/x.png">')).toBeNull();
  });

  it('returns null for role="none"', () => {
    expect(addImageAlt('<img role="none" src="/x.png">')).toBeNull();
  });

  it('returns null when there is no src to derive from', () => {
    expect(addImageAlt('<img width="10">')).toBeNull();
  });

  it('returns null when the src yields no sensible word', () => {
    expect(addImageAlt('<img src="/">')).toBeNull();
  });

  it('escapes special characters in the derived alt', () => {
    expect(addImageAlt('<img src="/a&b.png">'))
      .toBe('<img src="/a&b.png" alt="a&amp;b">');
  });
});

describe('ImageAltFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'image-alt-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not another id', () => {
    const fixer = new ImageAltFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'input-image-alt'))).toBe(false);
  });

  it('adds alt on the recorded line, leaving other lines untouched', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<img src="/images/team_photo.png">\n</main>');
    const fixer = new ImageAltFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('alt="team photo"');
    expect(contents).toContain('<main>'); // other lines untouched
  });

  it('human-flags when there is no node data', async () => {
    const fixer = new ImageAltFixer(dir);
    const bare = violation(undefined, undefined);
    bare.nodes = [];
    const result = await fixer.fix(bare);
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new ImageAltFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the source file cannot be read', async () => {
    const fixer = new ImageAltFixer(dir);
    const result = await fixer.fix(violation(path.join(dir, 'missing.html'), 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<img src="/x.png">');
    const fixer = new ImageAltFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when no alt can be derived from the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<img src="/">');
    const fixer = new ImageAltFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
