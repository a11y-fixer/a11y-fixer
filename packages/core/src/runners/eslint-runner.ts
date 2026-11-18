import { ESLint } from 'eslint';
import type { Rule } from 'eslint';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { A11yViolation, A11yNode } from '../detector/index.js';
import { ESLINT_TO_WCAG } from './wcag-eslint-map.js';

// eslint-plugin-jsx-a11y and @typescript-eslint/parser are CJS modules;
// load them via createRequire from this ESM file.
const require = createRequire(import.meta.url);

const NON_LABELABLE_INPUT_TYPES = new Set([
  'button', 'submit', 'reset', 'hidden', 'image',
]);

const GENERIC_LINK_TEXTS = new Set([
  'click here', 'here', 'read more', 'more', 'link', 'this link',
  'learn more', 'go', 'click', 'details', 'info', 'information',
  'download', 'view', 'see', 'check',
]);

// Custom rules that fill gaps where no jsx-a11y rule exists.
// WCAG 4.1.2: jsx-a11y/control-has-associated-label fires false positives on
//   buttons with aria-label. This rule checks buttons have an accessible name.
// WCAG 1.3.1: label-has-associated-control fires on orphan <label> elements,
//   not on inputs that simply lack a label. This rule catches the latter.
// WCAG 2.4.4: anchor-has-content fires only on empty <a>; this catches links
//   whose text content is a known non-descriptive phrase.
const customPlugin: { rules: Record<string, Rule.RuleModule> } = {
  rules: {
    'button-must-have-label': {
      meta: { type: 'problem', schema: [] },
      create(context): Rule.RuleListener {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          JSXElement(node: any) {
            const openEl = node.openingElement;
            if (openEl?.name?.name !== 'button') return;

            const attrs: any[] = openEl.attributes ?? [];

            // Pass if there's a direct label attribute with a value
            const hasLabelAttr = attrs.some((a: any) => {
              if (a.type !== 'JSXAttribute') return false;
              const n = a.name?.name;
              return ['aria-label', 'aria-labelledby', 'title'].includes(n) && a.value != null;
            });
            if (hasLabelAttr) return;

            // Pass if any child provides visible text (not aria-hidden)
            const hasVisibleText = (node.children ?? []).some((child: any) => {
              if (child.type === 'JSXText') {
                return child.value.trim().length > 0;
              }
              if (child.type === 'JSXElement') {
                const childAttrs: any[] = child.openingElement?.attributes ?? [];
                const isHidden = childAttrs.some(
                  (a: any) =>
                    a.type === 'JSXAttribute' &&
                    a.name?.name === 'aria-hidden' &&
                    (a.value?.value === true || a.value?.value === 'true'),
                );
                return !isHidden;
              }
              return false;
            });
            if (hasVisibleText) return;

            context.report({
              node: openEl,
              message: 'Button element must have an accessible label (text content, aria-label, aria-labelledby, or title).',
            });
          },
        };
      },
    },

    'input-must-have-label': {
      meta: { type: 'problem', schema: [] },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create(context): Rule.RuleListener {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          JSXOpeningElement(node: any) {
            const elName = node.name?.name;
            if (elName !== 'input') return;

            const attrs: any[] = node.attributes ?? [];

            const typeAttr = attrs.find(
              (a: any) => a.type === 'JSXAttribute' && a.name?.name === 'type',
            );
            const inputType: string = typeAttr?.value?.value ?? 'text';
            if (NON_LABELABLE_INPUT_TYPES.has(inputType)) return;

            const hasAccessibleLabel = attrs.some((a: any) => {
              if (a.type !== 'JSXAttribute') return false;
              const n = a.name?.name;
              return (
                ['aria-label', 'aria-labelledby', 'title', 'id'].includes(n) &&
                a.value != null
              );
            });

            if (!hasAccessibleLabel) {
              context.report({
                node,
                message:
                  'Input element must have an accessible label (aria-label, aria-labelledby, title, or an associated <label> via id).',
              });
            }
          },
        };
      },
    },

    'no-generic-link-text': {
      meta: { type: 'problem', schema: [] },
      create(context): Rule.RuleListener {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          JSXElement(node: any) {
            const openEl = node.openingElement;
            if (openEl?.name?.name !== 'a') return;

            const attrs: any[] = openEl.attributes ?? [];
            const hasHref = attrs.some(
              (a: any) =>
                a.type === 'JSXAttribute' &&
                a.name?.name === 'href' &&
                a.value != null,
            );
            if (!hasHref) return;

            const text: string = (node.children ?? [])
              .filter((c: any) => c.type === 'JSXText')
              .map((c: any) => (c.value as string).trim())
              .join('')
              .trim()
              .toLowerCase();

            if (text && GENERIC_LINK_TEXTS.has(text)) {
              context.report({
                node: openEl,
                message: `Link text "${text}" is not descriptive. Use text that describes the link destination.`,
              });
            }
          },
        };
      },
    },
  },
};

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
          plugins: {
            'jsx-a11y': jsxA11y,
            'a11y-custom': customPlugin as unknown as Record<string, unknown>,
          },
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
            'jsx-a11y/aria-props': 'error',
            'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
            'jsx-a11y/interactive-supports-focus': 'error',
            'a11y-custom/button-must-have-label': 'error',
            'a11y-custom/input-must-have-label': 'error',
            'a11y-custom/no-generic-link-text': 'error',
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
            helpUrl: msg.ruleId.startsWith('jsx-a11y/')
              ? `https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/${msg.ruleId.replace('jsx-a11y/', '')}.md`
              : `https://www.w3.org/WAI/WCAG21/Understanding/${wcagId.replace(/\./g, '')}.html`,
            nodes: [node],
          });
        }
      }
    }

    return violations;
  }
}
