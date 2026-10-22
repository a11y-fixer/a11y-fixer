import type { Fixer, FixResult } from './index.js';
import type { A11yViolation } from '../detector/index.js';

export class FixerRegistry {
  // Ordered list: the first fixer whose canFix() matches a violation wins.
  // A list (not a wcagId map) lets several fixers serve one WCAG id — e.g.
  // axe button-name and aria-props both map to 4.1.2 but need different fixers.
  private readonly fixers: Fixer[] = [];

  register(fixer: Fixer): void {
    this.fixers.push(fixer);
  }

  getFixer(violation: A11yViolation): Fixer | undefined {
    return this.fixers.find(f => f.canFix(violation));
  }

  async applyAll(violations: A11yViolation[]): Promise<FixResult[]> {
    const results: FixResult[] = [];

    for (const violation of violations) {
      const fixer = this.getFixer(violation);
      if (!fixer) {
        results.push({
          wcagId: violation.wcagId,
          bucket: 'human-flagged',
          applied: false,
          description: `No fixer registered for WCAG ${violation.wcagId}`,
          before: violation.nodes[0]?.html ?? '',
          humanNote: `Manual fix required: ${violation.description}`,
        });
        continue;
      }

      try {
        const result = await fixer.fix(violation);
        results.push(result);
      } catch (err) {
        results.push({
          wcagId: violation.wcagId,
          bucket: fixer.bucket,
          applied: false,
          description: `Fixer failed: ${err instanceof Error ? err.message : String(err)}`,
          before: violation.nodes[0]?.html ?? '',
        });
      }
    }

    return results;
  }
}
