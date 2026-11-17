import { readFile } from 'node:fs/promises';
import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { addAttributeToElement } from '../shared/apply-attribute.js';
import { canonicalizeLangTag } from '../shared/lang-tag.js';
import { detectLangFromSource } from '../shared/detect-lang.js';

/**
 * Fixes a document whose root `<html>` has no `lang` attribute (axe
 * `html-has-lang`, WCAG 3.1.1) by adding a `lang` attribute. This is a
 * deterministic, single-line edit — no AI needed — so it lives in the rule-based
 * bucket.
 *
 * The stamped language is resolved, in order: an explicit `--lang` tag (passed to
 * the constructor, canonicalized); else a language detected from in-source signals
 * ({@link detectLangFromSource}); else the violation is human-flagged rather than
 * guessing — asserting the wrong language is worse than the original omission.
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
  private readonly explicitLang: string | null;

  constructor(private readonly rootDir: string, lang?: string) {
    this.explicitLang = lang ? canonicalizeLangTag(lang) : null;
  }

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

    const lang = await this.resolveLang(node.sourceFile);
    if (lang === null) {
      return this.humanFlag(
        violation,
        'Could not determine page language — pass --lang <tag>',
      );
    }

    const after = await addAttributeToElement(
      node.sourceFile,
      node.sourceLine,
      /<html(\s|>)/g,
      'lang',
      lang,
    );

    if (after === null) {
      return this.humanFlag(violation, 'Could not apply lang attribute to source');
    }

    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied: true,
      description: `Added lang="${lang}" to <html>`,
      before: node.html,
      after,
      sourceLocation: { file: node.sourceFile, line: node.sourceLine, column: node.sourceColumn ?? 1 },
    };
  }

  /** Explicit `--lang` wins; otherwise detect from the source file. */
  private async resolveLang(sourceFile: string): Promise<string | null> {
    if (this.explicitLang) return this.explicitLang;
    try {
      const content = await readFile(sourceFile, 'utf8');
      return detectLangFromSource(content);
    } catch {
      return null;
    }
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
