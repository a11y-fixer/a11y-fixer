import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MarkdownTableHeaderFixer } from './markdown-table-header.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file: string, line: number): A11yViolation {
  return {
    id: 'md-table-header',
    wcagId: '1.3.1',
    impact: 'serious',
    description: 'empty header',
    helpUrl: '',
    nodes: [{ html: `${file}:${line}:1`, target: [file], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

async function withFile(content: string, fn: (file: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(tmpdir(), 'md-t-'));
  const file = path.join(dir, 'doc.md');
  await writeFile(file, content);
  try {
    await fn(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe('MarkdownTableHeaderFixer', () => {
  it('canFix only its own id', () => {
    const f = new MarkdownTableHeaderFixer('/repo');
    expect(f.canFix(violation('/x.md', 1))).toBe(true);
    expect(f.canFix({ ...violation('/x.md', 1), id: 'md-heading-order' })).toBe(false);
  });

  it('fills a single empty header cell with a generic label', async () => {
    await withFile('| | Status |\n| --- | --- |\n| a | ok |\n', async (file) => {
      const f = new MarkdownTableHeaderFixer(path.dirname(file));
      const result = await f.fix(violation(file, 1));
      expect(result.applied).toBe(true);
      const after = await readFile(file, 'utf8');
      expect(after.split('\n')[0]).toBe('| Column 1 | Status |');
    });
  });

  it('fills multiple empty cells by column position', async () => {
    await withFile('| Name | | Age | |\n| - | - | - | - |\n| a | b | c | d |\n', async (file) => {
      const f = new MarkdownTableHeaderFixer(path.dirname(file));
      await f.fix(violation(file, 1));
      const after = await readFile(file, 'utf8');
      expect(after.split('\n')[0]).toBe('| Name | Column 2 | Age | Column 4 |');
    });
  });

  it('preserves escaped pipes inside a cell', async () => {
    await withFile('| a \\| b | |\n| - | - |\n| x | y |\n', async (file) => {
      const f = new MarkdownTableHeaderFixer(path.dirname(file));
      await f.fix(violation(file, 1));
      const after = await readFile(file, 'utf8');
      expect(after.split('\n')[0]).toBe('| a \\| b | Column 2 |');
    });
  });

  it('human-flags a line with no pipes', async () => {
    await withFile('not a table\n', async (file) => {
      const f = new MarkdownTableHeaderFixer(path.dirname(file));
      const result = await f.fix(violation(file, 1));
      expect(result.applied).toBe(false);
    });
  });
});
