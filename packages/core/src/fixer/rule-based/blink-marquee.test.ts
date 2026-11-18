import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { BlinkMarqueeFixer, unwrapBlinkMarquee } from './blink-marquee.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'marquee'): A11yViolation {
  return {
    id,
    wcagId: '2.2.2',
    impact: 'serious',
    description: '<marquee> elements are deprecated and must not be used',
    helpUrl: '',
    nodes: [{
      html: '<marquee>Sale!</marquee>',
      target: ['marquee'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('unwrapBlinkMarquee', () => {
  it('unwraps <marquee> to its inner content', () => {
    expect(unwrapBlinkMarquee('<marquee>Big sale!</marquee>')).toBe('Big sale!');
  });

  it('unwraps <blink> to its inner content', () => {
    expect(unwrapBlinkMarquee('<blink>Hi</blink>')).toBe('Hi');
  });

  it('unwraps a marquee with attributes, preserving surrounding text', () => {
    expect(unwrapBlinkMarquee('<p><marquee behavior="scroll">Go</marquee></p>'))
      .toBe('<p>Go</p>');
  });

  it('preserves nested child elements inside the wrapper', () => {
    expect(unwrapBlinkMarquee('<marquee><span>X</span></marquee>'))
      .toBe('<span>X</span>');
  });

  it('returns null when there is no blink/marquee element', () => {
    expect(unwrapBlinkMarquee('<div>plain</div>')).toBeNull();
  });

  it('returns null when only an opening tag is on the line', () => {
    expect(unwrapBlinkMarquee('<marquee behavior="scroll">')).toBeNull();
  });
});

describe('BlinkMarqueeFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'blink-marquee-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches blink and marquee, not other ids', () => {
    const fixer = new BlinkMarqueeFixer(dir);
    expect(fixer.canFix(violation('x.html', 1, 'marquee'))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'blink'))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-hidden-body'))).toBe(false);
  });

  it('unwraps on the recorded line, leaving other lines untouched', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<html>\n<p><marquee>Sale!</marquee></p>\n</html>');
    const fixer = new BlinkMarqueeFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<p>Sale!</p>');
    expect(contents).not.toContain('marquee');
    expect(contents).toContain('<html>'); // other lines untouched
  });

  it('human-flags when there is no node data', async () => {
    const fixer = new BlinkMarqueeFixer(dir);
    const bare = violation(undefined, undefined);
    bare.nodes = [];
    const result = await fixer.fix(bare);
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new BlinkMarqueeFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the source file cannot be read', async () => {
    const fixer = new BlinkMarqueeFixer(dir);
    const result = await fixer.fix(violation(path.join(dir, 'missing.html'), 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<marquee>Sale!</marquee>');
    const fixer = new BlinkMarqueeFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no blink/marquee to unwrap', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div>plain</div>');
    const fixer = new BlinkMarqueeFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
