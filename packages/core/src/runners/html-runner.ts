import { readFile } from 'node:fs/promises';
import type { A11yViolation } from '../detector/index.js';
import { AxeDetector } from '../detector/axe.js';
import { collectFiles } from '../mapper/walk-files.js';
import { locateElementInHtml } from '../mapper/html-locate.js';

/**
 * Scans static `.html`/`.htm` files under `rootDir` with axe-core — no server
 * required, each file's contents are rendered via `AxeDetector.scan({ html })`.
 * Every violation node is stamped with its source location in the file it came
 * from, so the existing fixers can apply edits and the PR builder can list the
 * changed files. Mirrors `EslintRunner.scan()`'s shape.
 */
export class HtmlFileRunner {
  constructor(
    private readonly rootDir: string,
    private readonly detector = new AxeDetector(),
  ) {}

  async scan(): Promise<A11yViolation[]> {
    const files = await collectFiles(this.rootDir, /\.html?$/i);
    const all: A11yViolation[] = [];

    for (const file of files) {
      const content = await readFile(file, 'utf8').catch(() => null);
      if (content === null) continue;

      const violations = await this.detector.scan({ html: content });
      for (const v of violations) {
        for (const node of v.nodes) {
          const pos = locateElementInHtml(content, node);
          node.sourceFile = file;
          if (pos) {
            node.sourceLine = pos.line;
            node.sourceColumn = pos.column;
          }
        }
      }
      all.push(...violations);
    }

    return all;
  }
}
