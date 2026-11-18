import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { HtmlFileRunner } from './html-runner.js';
import type { Detector, DetectorOptions, A11yViolation } from '../detector/index.js';

const BROKEN = `<!DOCTYPE html>
<html>
<body>
  <img src="logo.png">
  <a href="/about">click here</a>
</body>
</html>`;

/** Returns canned violations whose node.html matches elements in BROKEN. */
function stubDetector(): Detector {
  return {
    async scan(_opts: DetectorOptions): Promise<A11yViolation[]> {
      return [
        {
          id: 'image-alt',
          wcagId: '1.1.1',
          impact: 'critical',
          description: 'Images must have alternate text',
          helpUrl: 'https://example.com/image-alt',
          nodes: [{ html: '<img src="logo.png">', target: ['img'], failureSummary: '' }],
        },
        {
          id: 'link-name',
          wcagId: '2.4.4',
          impact: 'serious',
          description: 'Links must have discernible text',
          helpUrl: 'https://example.com/link-name',
          nodes: [{ html: '<a href="/about">click here</a>', target: ['a'], failureSummary: '' }],
        },
      ];
    },
  };
}

describe('HtmlFileRunner', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'html-runner-'));
    await writeFile(path.join(dir, 'page.html'), BROKEN, 'utf8');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('stamps each violation node with its source file and line', async () => {
    const runner = new HtmlFileRunner(dir, stubDetector());
    const violations = await runner.scan();

    expect(violations.map(v => v.wcagId).sort()).toEqual(['1.1.1', '2.4.4']);

    const img = violations.find(v => v.id === 'image-alt')!.nodes[0];
    expect(img.sourceFile).toBe(path.join(dir, 'page.html'));
    expect(img.sourceLine).toBe(4);

    const link = violations.find(v => v.id === 'link-name')!.nodes[0];
    expect(link.sourceLine).toBe(5);
  });

  it('returns an empty array when no .html files exist', async () => {
    const empty = await mkdtemp(path.join(tmpdir(), 'html-runner-empty-'));
    try {
      const runner = new HtmlFileRunner(empty, stubDetector());
      expect(await runner.scan()).toEqual([]);
    } finally {
      await rm(empty, { recursive: true, force: true });
    }
  });
});
