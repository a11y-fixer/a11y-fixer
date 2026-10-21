import type { Fixer, FixResult } from '../index.js';
import type { A11yViolation } from '../../detector/index.js';
import { EslintRunner } from '../../runners/eslint-runner.js';
import path from 'node:path';

/**
 * Delegates to eslint-plugin-jsx-a11y --fix for rules it can auto-fix.
 * One instance handles all ESLint-fixable WCAG rules.
 */
export class EslintFixer implements Fixer {
  readonly bucket = 'rule-based' as const;

  constructor(
    readonly wcagId: string,
    private readonly rootDir: string,
  ) {}

  canFix(violation: A11yViolation): boolean {
    return violation.wcagId === this.wcagId;
  }

  async fix(violation: A11yViolation): Promise<FixResult> {
    const sourceFiles = violation.nodes
      .map(n => n.sourceFile)
      .filter((f): f is string => !!f);

    if (sourceFiles.length === 0) {
      return {
        wcagId: this.wcagId,
        bucket: 'human-flagged',
        applied: false,
        description: 'No source file found for this violation',
        before: violation.nodes[0]?.html ?? '',
        humanNote: `Manual fix required: ${violation.description}`,
      };
    }

    const uniqueFiles = [...new Set(sourceFiles)];
    const runner = new EslintRunner(this.rootDir);
    const { fixedFiles } = await runner.fix(uniqueFiles);

    const applied = fixedFiles.length > 0;
    return {
      wcagId: this.wcagId,
      bucket: 'rule-based',
      applied,
      description: applied
        ? `ESLint auto-fixed ${fixedFiles.map(f => path.relative(this.rootDir, f)).join(', ')}`
        : `ESLint reported no auto-fix available for WCAG ${this.wcagId}`,
      before: violation.nodes[0]?.html ?? '',
      sourceLocation: violation.nodes[0]?.sourceFile
        ? {
            file: violation.nodes[0].sourceFile,
            line: violation.nodes[0].sourceLine ?? 1,
            column: violation.nodes[0].sourceColumn ?? 1,
          }
        : undefined,
    };
  }
}
