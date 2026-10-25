import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AriaHiddenFocusFixer, hideFocusableDescendants } from './aria-hidden-focus.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'aria-hidden-focus'): A11yViolation {
  return {
    id,
    wcagId: '4.1.2',
    impact: 'serious',
    description: 'aria-hidden elements must not contain focusable elements',
    helpUrl: '',
    nodes: [{
      html: '<div aria-hidden="true"><a href="/x">Link</a></div>',
      target: ['div'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

describe('hideFocusableDescendants', () => {
  it('adds tabindex="-1" to an anchor with href', () => {
    expect(hideFocusableDescendants('<div aria-hidden="true"><a href="/x">Go</a></div>'))
      .toBe('<div aria-hidden="true"><a href="/x" tabindex="-1">Go</a></div>');
  });

  it('adds tabindex="-1" to a button', () => {
    expect(hideFocusableDescendants('<button>Click</button>'))
      .toBe('<button tabindex="-1">Click</button>');
  });

  it('preserves a self-closing slash on an input', () => {
    expect(hideFocusableDescendants('<input type="text" />'))
      .toBe('<input type="text" tabindex="-1" />');
  });

  it('rewrites an existing non-negative tabindex to -1', () => {
    expect(hideFocusableDescendants('<div tabindex="0">x</div>'))
      .toBe('<div tabindex="-1">x</div>');
  });

  it('handles multiple focusable elements on one line', () => {
    expect(hideFocusableDescendants('<a href="/a">A</a><button>B</button>'))
      .toBe('<a href="/a" tabindex="-1">A</a><button tabindex="-1">B</button>');
  });

  it('returns null for an anchor without href (not focusable)', () => {
    expect(hideFocusableDescendants('<a>name</a>')).toBeNull();
  });

  it('returns null when the only focusable element already has a negative tabindex', () => {
    expect(hideFocusableDescendants('<button tabindex="-1">x</button>')).toBeNull();
  });

  it('returns null when there is no focusable element', () => {
    expect(hideFocusableDescendants('<div><span>text</span></div>')).toBeNull();
  });
});

describe('AriaHiddenFocusFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'aria-hidden-focus-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not a sibling id', () => {
    const fixer = new AriaHiddenFocusFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'aria-hidden-body'))).toBe(false);
  });

  it('hides focusable descendants on the recorded line, leaving other lines untouched', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<div aria-hidden="true"><a href="/x">Link</a></div>\n</main>');
    const fixer = new AriaHiddenFocusFixer(dir);

    const result = await fixer.fix(violation(file, 2));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<a href="/x" tabindex="-1">Link</a>');
    expect(contents).toContain('<main>'); // other lines untouched
  });

  it('human-flags when there is no node data', async () => {
    const fixer = new AriaHiddenFocusFixer(dir);
    const bare = violation(undefined, undefined);
    bare.nodes = [];
    const result = await fixer.fix(bare);
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new AriaHiddenFocusFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the source file cannot be read', async () => {
    const fixer = new AriaHiddenFocusFixer(dir);
    const result = await fixer.fix(violation(path.join(dir, 'missing.html'), 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line is out of range', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<div aria-hidden="true"><a href="/x">L</a></div>');
    const fixer = new AriaHiddenFocusFixer(dir);

    const result = await fixer.fix(violation(file, 99));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the recorded line has no focusable descendant (multi-line subtree)', async () => {
    const file = path.join(dir, 'index.html');
    // The focusable <a> lives on another line, not the recorded one.
    await writeFile(file, '<div aria-hidden="true">\n<a href="/x">L</a>\n</div>');
    const fixer = new AriaHiddenFocusFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
