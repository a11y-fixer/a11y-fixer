import { readFile } from 'node:fs/promises';
import type { A11yViolation } from '../detector/index.js';
import { AxeDetector } from '../detector/axe.js';
import { collectFiles } from '../mapper/walk-files.js';
import { scanHtmlContent } from './render-locate.js';

/**
 * Scans static `.html`/`.htm` files under `rootDir` with axe-core — no server
 * required, each file's contents are rendered via `AxeDetector.scan({ html })`.
 * Every violation node is stamped with its source location in the file it came
 * from, so the existing fixers can apply edits and the PR builder can list the
 * changed files. Mirrors `EslintRunner.scan()`'s shape.
 *
 * Angular external templates (`*.component.html`) are *excluded* here: they are
 * HTML fragments, not whole documents, so scanning them as a page would emit
 * false document-level findings (`document-title`, `html-has-lang`, `region`, …).
 * They are handled by the component scanner (`scanComponents`) as fragments instead.
 */
export class HtmlFileRunner {
  constructor(
    private readonly rootDir: string,
    private readonly detector = new AxeDetector(),
  ) {}

  async scan(): Promise<A11yViolation[]> {
    const files = (await collectFiles(this.rootDir, /\.html?$/i))
      .filter((f) => !/\.component\.html$/i.test(f));
    const all: A11yViolation[] = [];

    for (const file of files) {
      const content = await readFile(file, 'utf8').catch(() => null);
      if (content === null) continue;

      all.push(...await scanHtmlContent(this.detector, content, file));
    }

    return all;
  }
}
