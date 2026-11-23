import type { A11yViolation, Detector } from '../detector/index.js';
import { locateElementInHtml } from '../mapper/html-locate.js';

/**
 * Renders one HTML document with `detector` and stamps every violation node with
 * its source location within `content`.
 *
 * Shared by {@link HtmlFileRunner} (which passes a real `.html` file) and the
 * component scanner (which passes position-preserving *masked* SFC markup — every
 * non-template byte blanked to spaces but newlines kept — so a located line/column
 * maps 1:1 back to the original `.vue`/`.svelte`/`.astro` file). `sourceFile` is
 * always stamped; line/column only when the element is located.
 */
export async function scanHtmlContent(
  detector: Detector,
  content: string,
  sourceFile: string,
): Promise<A11yViolation[]> {
  const violations = await detector.scan({ html: content });
  for (const v of violations) {
    for (const node of v.nodes) {
      const pos = locateElementInHtml(content, node);
      node.sourceFile = sourceFile;
      if (pos) {
        node.sourceLine = pos.line;
        node.sourceColumn = pos.column;
      }
    }
  }
  return violations;
}
