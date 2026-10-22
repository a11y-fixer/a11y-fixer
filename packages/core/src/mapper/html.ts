import type { SourceMapper, SourceLocation } from './index.js';
import type { A11yNode } from '../detector/index.js';
import { readFile } from 'node:fs/promises';
import { collectFiles } from './walk-files.js';
import { locateElementInHtml } from './html-locate.js';

/**
 * Maps axe violations found on a live HTML page back to the `.html`/`.htm` source
 * under `rootDir`. Because static HTML source mirrors the rendered DOM, matching
 * is far more precise than the JSX case: parse5 gives the exact opening-tag line.
 */
export class HtmlMapper implements SourceMapper {
  constructor(private readonly rootDir: string) {}

  async locate(node: A11yNode): Promise<SourceLocation | null> {
    const files = await collectFiles(this.rootDir, /\.html?$/i);
    for (const file of files) {
      const content = await readFile(file, 'utf8').catch(() => null);
      if (!content) continue;
      const pos = locateElementInHtml(content, node);
      if (pos) return { file, line: pos.line, column: pos.column };
    }
    return null;
  }
}
