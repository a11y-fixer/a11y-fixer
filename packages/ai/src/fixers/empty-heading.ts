import type { Fixer, FixResult, A11yViolation } from '@a11y-fixer/core';

/**
 * Handles empty headings (axe `empty-heading`, WCAG 1.3.1 / 2.4.6): a heading
 * element (`<h1>`–`<h6>` or `role="heading"`) with no accessible text.
 *
 * Unlike the accessible-name fixers, this one **never auto-fixes**. A heading's
 * text is the author's summary of the section that follows it — inventing it
 * from surrounding markup is far higher-stakes than generating alt text or an
 * `aria-label`, and a plausible-but-wrong heading actively misleads both sighted
 * and assistive-tech users. So the deliberate behaviour is to always human-flag
 * with a rule-specific note, rather than let the generic "no fixer registered"
 * path (or a broad AI fixer) guess.
 *
 * It exists as a real fixer purely to replace that generic human-flag with
 * actionable guidance; it claims only the axe `empty-heading` id (the HTML
 * path). The JSX `jsx-a11y/heading-has-content` equivalent still routes to the
 * deterministic EslintFixer, which likewise cannot invent content and flags it.
 */
export class EmptyHeadingFixer implements Fixer {
  readonly wcagId = '1.3.1';
  readonly bucket = 'human-flagged' as const;

  canFix(violation: A11yViolation): boolean {
    return violation.id === 'empty-heading';
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const before = violation.nodes[0]?.html ?? '';
    const note =
      'Empty heading — a person must author the heading text to summarise the ' +
      'section it introduces. This is intentionally not auto-generated: a guessed ' +
      'heading would mislead readers. Add descriptive text, or remove the heading ' +
      'element if it is decorative.';
    return {
      wcagId: this.wcagId,
      bucket: 'human-flagged',
      applied: false,
      description: note,
      before,
      humanNote: note,
    };
  }
}
