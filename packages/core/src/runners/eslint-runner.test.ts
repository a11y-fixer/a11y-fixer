import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EslintRunner } from './eslint-runner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../../../../tests/fixtures');

describe('EslintRunner', () => {
  it('finds accessibility violations in BrokenComponent.tsx', async () => {
    const runner = new EslintRunner(FIXTURES);
    const violations = await runner.scan([path.join(FIXTURES, 'BrokenComponent.tsx')]);

    expect(violations.length).toBeGreaterThan(0);

    const wcagIds = violations.map(v => v.wcagId);
    // Should find label (1.3.1) and alt-text (1.1.1) issues
    expect(wcagIds.some(id => ['1.3.1', '1.1.1', '2.4.4'].includes(id))).toBe(true);
  });

  it('finds no violations in CleanComponent.tsx', async () => {
    const runner = new EslintRunner(FIXTURES);
    const violations = await runner.scan([path.join(FIXTURES, 'CleanComponent.tsx')]);
    expect(violations.length).toBe(0);
  });

  it('violations include source file and line info', async () => {
    const runner = new EslintRunner(FIXTURES);
    const violations = await runner.scan([path.join(FIXTURES, 'BrokenComponent.tsx')]);

    if (violations.length > 0) {
      const node = violations[0].nodes[0];
      expect(node.sourceFile).toContain('BrokenComponent');
      expect(node.sourceLine).toBeGreaterThan(0);
    }
  });
});
