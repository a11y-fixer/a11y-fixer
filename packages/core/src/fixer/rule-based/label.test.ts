import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { LabelFixer, associateAdjacentLabel } from './label.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'label'): A11yViolation {
  return {
    id,
    wcagId: '1.3.1',
    impact: 'serious',
    description: 'Form elements must have labels',
    helpUrl: '',
    nodes: [{
      html: '<input type="text" id="y">',
      target: ['input'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('associateAdjacentLabel', () => {
  it('adds for to an adjacent label when the control already has an id (same line)', () => {
    expect(associateAdjacentLabel('<label>Name</label><input type="text" id="y">', 1))
      .toBe('<label for="y">Name</label><input type="text" id="y">');
  });

  it('works when the label and control are on separate lines', () => {
    const src = '<label>Email</label>\n<input type="text" id="email">';
    expect(associateAdjacentLabel(src, 2))
      .toBe('<label for="email">Email</label>\n<input type="text" id="email">');
  });

  it('synthesizes an id from the label text when the control has none', () => {
    expect(associateAdjacentLabel('<label>Full Name</label><input type="text">', 1))
      .toBe('<label for="full-name">Full Name</label><input id="full-name" type="text">');
  });

  it('makes a synthesized id unique against existing ids', () => {
    const src = '<input id="full-name">\n<label>Full Name</label><input type="text">';
    expect(associateAdjacentLabel(src, 2))
      .toBe('<input id="full-name">\n<label for="full-name-2">Full Name</label><input id="full-name-2" type="text">');
  });

  it('strips inner markup from the label text when slugifying', () => {
    expect(associateAdjacentLabel('<label><b>Phone</b> number</label><input>', 1))
      .toBe('<label for="phone-number"><b>Phone</b> number</label><input id="phone-number">');
  });

  it('returns null when there is no control on the line', () => {
    expect(associateAdjacentLabel('<div>no field</div>', 1)).toBeNull();
  });

  it('returns null when the control is not preceded by a label', () => {
    expect(associateAdjacentLabel('<span>x</span><input type="text" id="y">', 1)).toBeNull();
  });

  it('returns null when something sits between the label and the control', () => {
    expect(associateAdjacentLabel('<label>Name</label><br><input id="y">', 1)).toBeNull();
  });

  it('returns null when the label already has a for', () => {
    expect(associateAdjacentLabel('<label for="z">Name</label><input id="y">', 1)).toBeNull();
  });

  it('returns null when the label has no text', () => {
    expect(associateAdjacentLabel('<label></label><input id="y">', 1)).toBeNull();
  });

  it('returns null when the line is out of range', () => {
    expect(associateAdjacentLabel('<label>Name</label><input id="y">', 9)).toBeNull();
  });
});

describe('LabelFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'label-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not another id', () => {
    const fixer = new LabelFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'input-image-alt'))).toBe(false);
  });

  it('associates the control with its adjacent label on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<form>\n<label>Name</label><input type="text" id="y">\n</form>');
    const fixer = new LabelFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<label for="y">Name</label>');
    expect(contents).toContain('<form>'); // other lines untouched
  });

  it('human-flags when there is no node data', async () => {
    const fixer = new LabelFixer(dir);
    const bare = violation(undefined, undefined);
    bare.nodes = [];
    const result = await fixer.fix(bare);
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new LabelFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the source file cannot be read', async () => {
    const fixer = new LabelFixer(dir);
    const result = await fixer.fix(violation(path.join(dir, 'missing.html'), 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no adjacent label to associate', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<input type="text" id="y">');
    const fixer = new LabelFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
