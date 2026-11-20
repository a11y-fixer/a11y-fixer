import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { MarkdownHeadingOrderFixer } from './markdown-heading-order.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file: string, line: number): A11yViolation {
  return {
    id: 'md-heading-order',
    wcagId: '2.4.6',
    impact: 'serious',
    description: 'skip',
    helpUrl: '',
    nodes: [{ html: `${file}:${line}:1`, target: [file], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

async function withFile(content: string, fn: (file: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(tmpdir(), 'md-h-'));
  const file = path.join(dir, 'doc.md');
  await writeFile(file, content);
  try {
    await fn(file);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe('MarkdownHeadingOrderFixer', () => {
  it('canFix only its own id', () => {
    const f = new MarkdownHeadingOrderFixer('/repo');
    expect(f.canFix(violation('/x.md', 3))).toBe(true);
    expect(f.canFix({ ...violation('/x.md', 3), id: 'md-table-header' })).toBe(false);
  });

  it('demotes a skipped heading to predecessor + 1', async () => {
    await withFile('# Title\n\n### Skipped\n', async (file) => {
      const f = new MarkdownHeadingOrderFixer(path.dirname(file));
      const result = await f.fix(violation(file, 3));
      expect(result.applied).toBe(true);
      expect(await readFile(file, 'utf8')).toBe('# Title\n\n## Skipped\n');
    });
  });

  it('preserves the heading text and trailing content', async () => {
    await withFile('# A\n\n#### Deep heading here\n', async (file) => {
      const f = new MarkdownHeadingOrderFixer(path.dirname(file));
      await f.fix(violation(file, 3));
      expect(await readFile(file, 'utf8')).toBe('# A\n\n## Deep heading here\n');
    });
  });

  it('human-flags when the recorded line is the first heading (nothing to anchor to)', async () => {
    await withFile('### First\n\ntext\n', async (file) => {
      const f = new MarkdownHeadingOrderFixer(path.dirname(file));
      const result = await f.fix(violation(file, 1));
      expect(result.applied).toBe(false);
    });
  });

  it('human-flags when the source file cannot be read', async () => {
    const f = new MarkdownHeadingOrderFixer('/repo');
    const result = await f.fix(violation('/nonexistent/doc.md', 3));
    expect(result.applied).toBe(false);
  });
});
