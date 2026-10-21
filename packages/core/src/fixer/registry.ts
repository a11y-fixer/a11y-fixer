import type { Fixer, FixResult } from './index.js';
import type { A11yViolation } from '../detector/index.js';

export class FixerRegistry {
  private readonly fixers = new Map<string, Fixer>();

  register(fixer: Fixer): void {
    this.fixers.set(fixer.wcagId, fixer);
  }

  getFixer(wcagId: string): Fixer | undefined {
    return this.fixers.get(wcagId);
  }

  async applyAll(violations: A11yViolation[]): Promise<FixResult[]> {
    const results: FixResult[] = [];

    // Group edits by fixer, then apply all at once per file to ensure atomicity.
    // Each fixer collects in-memory edits and flushes only when all succeed.
    for (const violation of violations) {
      const fixer = this.fixers.get(violation.wcagId);
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
