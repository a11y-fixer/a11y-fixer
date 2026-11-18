import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DocumentTitleFixer, fillDocumentTitle } from './document-title.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'document-title'): A11yViolation {
  return {
    id,
    wcagId: '2.4.2',
    impact: 'serious',
    description: 'Documents must have a non-empty <title>',
    helpUrl: '',
    nodes: [{
      html: '<html>',
      target: ['html'],
      failureSummary: '',
      sourceFile: file,
      sourceLine: line,
      sourceColumn: 1,
    }],
  };
}

const EMPTY_TITLE_PAGE =
  '<html>\n<head><title></title></head>\n<body><h1>Welcome home</h1></body>\n</html>';

describe('fillDocumentTitle', () => {
  it('fills an empty <title> with the first <h1> text', () => {
    expect(fillDocumentTitle(EMPTY_TITLE_PAGE))
      .toContain('<title>Welcome home</title>');
  });

  it('strips inner markup and collapses whitespace from the <h1>', () => {
    const page = '<title></title><h1>  Hello   <span>there</span>  </h1>';
    expect(fillDocumentTitle(page)).toBe('<title>Hello there</title><h1>  Hello   <span>there</span>  </h1>');
  });

  it('treats a whitespace-only <title> as empty', () => {
    expect(fillDocumentTitle('<title>   </title><h1>Real</h1>'))
      .toBe('<title>Real</title><h1>Real</h1>');
  });

  it('escapes special characters in the derived title', () => {
    expect(fillDocumentTitle('<title></title><h1>Fish & Chips < Pizza</h1>'))
      .toBe('<title>Fish &amp; Chips &lt; Pizza</title><h1>Fish & Chips < Pizza</h1>');
  });

  it('returns null when there is no <title> element', () => {
    expect(fillDocumentTitle('<head></head><h1>Hi</h1>')).toBeNull();
  });

  it('returns null when the <title> already has text', () => {
    expect(fillDocumentTitle('<title>Existing</title><h1>Other</h1>')).toBeNull();
  });

  it('returns null when there is no <h1> to borrow', () => {
    expect(fillDocumentTitle('<title></title><p>no heading</p>')).toBeNull();
  });

  it('returns null when the <h1> has no text', () => {
    expect(fillDocumentTitle('<title></title><h1><span></span></h1>')).toBeNull();
  });
});

describe('DocumentTitleFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'document-title-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id, not another id', () => {
    const fixer = new DocumentTitleFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'html-has-lang'))).toBe(false);
  });

  it('fills the empty title from the first h1', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, EMPTY_TITLE_PAGE);
    const fixer = new DocumentTitleFixer(dir);

    const result = await fixer.fix(violation(file, 1));

    expect(result.applied).toBe(true);
    expect(result.bucket).toBe('rule-based');
    expect(result.after).toBe('<title>Welcome home</title>');
    const contents = await readFile(file, 'utf8');
    expect(contents).toContain('<title>Welcome home</title>');
  });

  it('human-flags when there is no node data', async () => {
    const fixer = new DocumentTitleFixer(dir);
    const bare = violation(undefined, undefined);
    bare.nodes = [];
    const result = await fixer.fix(bare);
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no source location', async () => {
    const fixer = new DocumentTitleFixer(dir);
    const result = await fixer.fix(violation(undefined, undefined));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when the source file cannot be read', async () => {
    const fixer = new DocumentTitleFixer(dir);
    const result = await fixer.fix(violation(path.join(dir, 'missing.html'), 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });

  it('human-flags when there is no empty title / no h1 to derive from', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<html><head></head><body><p>no title, no h1</p></body></html>');
    const fixer = new DocumentTitleFixer(dir);

    const result = await fixer.fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
    expect(result.applied).toBe(false);
  });
});
