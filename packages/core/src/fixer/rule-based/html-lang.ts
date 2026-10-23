import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { addAttributeToElement } from '../ai-assisted/apply-attribute.js';

/** Language stamped on `<html>`. A future `--lang` flag threads through here. */
const DEFAULT_LANG = 'en';

/**
 * Fixes a document whose root `<html>` has no `lang` attribute (axe
 * `html-has-lang`, WCAG 3.1.1) by adding `lang="en"`. This is a deterministic,
 * single-line edit — no AI needed — so it lives in the rule-based bucket.
 *
 * Only the missing-lang case is handled. An *invalid* lang value (axe
 * `html-lang-valid`) would need attribute replacement rather than insertion and
 * is out of scope. The JSX path (`jsx-a11y/html-has-lang`) is left to
 * EslintFixer; this fixer claims only the axe id, which URL and static-HTML
 * scans emit.
 */
export class HtmlLangFixer implements Fixer {
  readonly wcagId = '3.1.1';
  readonly bucket = 'rule-based' as const;

  constructor(private readonly rootDir: string) {}

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'html-has-lang';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const node = violation.nodes[0];
    if (!node) return this.humanFlag(violation, 'No node data');

    if (!node.sourceFile || !node.sourceLine) {
      // URL→JSX scans often can't map <html> to a component; flag for a human.
      return this.humanFlag(violation, 'No source location to apply a lang attribute');
    }

    const after = await addAttributeToElement(
      node.sourceFile,
      node.sourceLine,
      /<html(\s|>)/g,
      'lang',
      DEFAULT_LANG,
    );

    if (after === null) {
      return this.humanFlag(violation, 'Could not apply lang attribute to source');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Added lang="${DEFAULT_LANG}" to <html>`,
      before: node.html,
      after,
      sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
    };
  }

  private humanFlag(violation: A11yViolation, note: string): FixResult {
    return {
      wcagId: this.wcagId,
      bucket: 'human-flagged',
      applied: false,
      description: note,
      before: violation.nodes[0]?.html ?? '',
      humanNote: note,
    };
  }
}
