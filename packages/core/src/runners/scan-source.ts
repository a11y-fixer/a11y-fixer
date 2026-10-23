import type { A11yViolation } from '../detector/index.js';
import { AxeDetector } from '../detector/axe.js';
import { ReactJSXMapper } from '../mapper/react-jsx.js';
import { EslintRunner } from './eslint-runner.js';
import { HtmlFileRunner } from './html-runner.js';

export interface ScanSourceOptions {
  /** Live URL to scan with axe-core; axe nodes are mapped back to JSX source. */
  url?: string;
  /** Scan static .html/.htm files with axe-core instead of static JSX. */
  html?: boolean;
}

/**
 * Single source of truth for picking a scanner and normalizing its output,
 * shared by the CLI (`scan`/`fix`/`check`) and the GitHub Action.
 *
 * - `url`  → axe-core via a real browser, then each node is mapped back to the
 *   JSX source file/line so fixers and PRs have a location to edit.
 * - `html` → static `.html`/`.htm` files (the HTML runner stamps source itself).
 * - else   → static JSX via ESLint.
 */
export async function scanSource(
  rootDir: string,
  opts: ScanSourceOptions = {},
): Promise<A11yViolation[]> {
  if (!opts.url) {
    return opts.html
      ? new HtmlFileRunner(rootDir).scan()
      : new EslintRunner(rootDir).scan();
  }

  const violations = await new AxeDetector().scan({ url: opts.url });
  const mapper = new ReactJSXMapper(rootDir);
  for (const v of violations) {
    for (const node of v.nodes) {
      if (node.sourceFile) continue;
      const loc = await mapper.locate(node);
      if (loc) {
        node.sourceFile = loc.file;
        node.sourceLine = loc.line;
        node.sourceColumn = loc.column;
      }
    }
  }
  return violations;
}
