import { ESLint } from 'eslint';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { A11yViolation, A11yNode } from '../detector/index.js';
import { ESLINT_TO_WCAG } from './wcag-eslint-map.js';

// eslint-plugin-jsx-a11y and @typescript-eslint/parser are CJS modules;
// load them via createRequire from this ESM file.
const require = createRequire(import.meta.url);

export class EslintRunner {
  constructor(private readonly rootDir: string) {}

  async scan(files?: string[]): Promise<A11yViolation[]> {
    const eslint = this.createEslint(false);
    const pattern = files ?? [path.join(this.rootDir, '**/*.{tsx,jsx,ts,js}')];
    const results = await eslint.lintFiles(pattern);
    return this.toViolations(results);
  }

  async fix(files?: string[]): Promise<{ violations: A11yViolation[]; fixedFiles: string[] }> {
    const eslint = this.createEslint(true);
    const pattern = files ?? [path.join(this.rootDir, '**/*.{tsx,jsx,ts,js}')];
    const results = await eslint.lintFiles(pattern);
    await ESLint.outputFixes(results);

    const fixedFiles = results
      .filter(r => r.output !== undefined)
      .map(r => r.filePath);

    return { violations: this.toViolations(results), fixedFiles };
  }

  private createEslint(fix: boolean): ESLint {
    const jsxA11y = require('eslint-plugin-jsx-a11y') as Record<string, unknown>;
    const tsParser = require('@typescript-eslint/parser') as Record<string, unknown>;

    return new ESLint({
      fix,
      cwd: this.rootDir,
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ['**/*.{tsx,jsx,ts,js}'],
          plugins: { 'jsx-a11y': jsxA11y },
          languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaFeatures: { jsx: true } },
          },
          rules: {
            'jsx-a11y/html-has-lang': 'error',
            'jsx-a11y/alt-text': 'error',
            'jsx-a11y/label-has-associated-control': 'error',
            'jsx-a11y/anchor-has-content': 'error',
            'jsx-a11y/heading-has-content': 'error',
          },
        },
      ],
      ignore: false,
      // An empty dir or a path that matches no source files should yield no
      // violations, not crash the caller with a NoFilesFoundError.
      errorOnUnmatchedPattern: false,
    } as ConstructorParameters<typeof ESLint>[0]);
  }

  private toViolations(results: ESLint.LintResult[]): A11yViolation[] {
    const violations: A11yViolation[] = [];

    for (const result of results) {
      for (const msg of result.messages) {
        if (!msg.ruleId) continue;
        const wcagId = ESLINT_TO_WCAG[msg.ruleId];
        if (!wcagId) continue;

        const node: A11yNode = {
          html: `${result.filePath}:${msg.line}:${msg.column}`,
          target: [result.filePath],
          failureSummary: msg.message,
          sourceFile: result.filePath,
          sourceLine: msg.line,
          sourceColumn: msg.column,
        };

        const existing = violations.find(v => v.wcagId === wcagId && v.id === msg.ruleId);
        if (existing) {
          existing.nodes.push(node);
        } else {
          violations.push({
            id: msg.ruleId,
            wcagId,
            impact: msg.severity === 2 ? 'serious' : 'moderate',
            description: msg.message,
            helpUrl: `https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/${msg.ruleId.replace('jsx-a11y/', '')}.md`,
            nodes: [node],
          });
        }
      }
    }

    return violations;
  }
}
