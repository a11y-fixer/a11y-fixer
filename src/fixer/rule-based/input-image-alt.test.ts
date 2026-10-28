import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { InputImageAltFixer, addImageInputAlt } from './input-image-alt.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'input-image-alt'): A11yViolation {
  return {
    id,
    wcagId: '1.1.1',
    impact: 'critical',
    description: 'Image buttons must have alternative text',
    helpUrl: '',
    nodes: [{
      html: '<input type="image" src="/icons/search.png">',
      target: ['input'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('addImageInputAlt', () => {
  it('derives alt from the image-input src filename', () => {
    expect(addImageInputAlt('<input type="image" src="/icons/search.png">'))
      .toBe('<input type="image" src="/icons/search.png" alt="search">');
  });

  it('works on a self-closing input', () => {
    expect(addImageInputAlt('<input type="image" src="/a/submit_form.gif" />'))
      .toBe('<input type="image" src="/a/submit_form.gif" alt="submit form" />');
  });

  it('fills an existing empty alt in place', () => {
    expect(addImageInputAlt('<input type="image" alt="" src="/go.png">'))
      .toBe('<input type="image" alt="go" src="/go.png">');
  });

  it('is case-insensitive on the type value', () => {
    expect(addImageInputAlt('<input type="IMAGE" src="/next.png">'))
      .toBe('<input type="IMAGE" src="/next.png" alt="next">');
  });

  it('returns null when there is no input on the line', () => {
    expect(addImageInputAlt('<button></button>')).toBeNull();
  });

  it('returns null for a non-image input', () => {
    expect(addImageInputAlt('<input type="text" src="/x.png">')).toBeNull();
  });

  it('returns null when alt is already non-empty', () => {
    expect(addImageInputAlt('<input type="image" alt="Search" src="/x.png">')).toBeNull();
  });

  it('returns null when aria-label is already set', () => {
    expect(addImageInputAlt('<input type="image" aria-label="Search" src="/x.png">')).toBeNull();
  });

  it('returns null when there is no src to derive from', () => {
    expect(addImageInputAlt('<input type="image">')).toBeNull();
  });

  it('returns null when the src yields no sensible word', () => {
    expect(addImageInputAlt('<input type="image" src="/">')).toBeNull();
  });
});

describe('InputImageAltFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'input-image-alt-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not another id', () => {
    const fixer = new InputImageAltFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'button-name'))).toBe(false);
  });

  it('adds alt on the recorded line, leaving other lines untouched', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<form>\n<input type="image" src="/icons/search.png">\n</form>');
    const fixer = new InputImageAltFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('alt="search"');
    expect(contents).toContain('<form>'); // other lines untouched
  });

  it('human-flags when there is no node data', async () => {
    const fixer = new InputImageAltFixer(dir);
    const bare = violation(undefined, undefined);
    bare.nodes = [];
    const result = await fixer.fix(bare);
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new InputImageAltFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the source file cannot be read', async () => {
    const fixer = new InputImageAltFixer(dir);
    const result = await fixer.fix(violation(path.join(dir, 'missing.html'), 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<input type="image" src="/x.png">');
    const fixer = new InputImageAltFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when no alt can be derived from the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<input type="image" src="/">');
    const fixer = new InputImageAltFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
