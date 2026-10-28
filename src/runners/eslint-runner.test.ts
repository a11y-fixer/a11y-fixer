import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EslintRunner } from './eslint-runner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../../../../tests/fixtures');

describe('EslintRunner', () => {
  it('finds all four violation types in BrokenComponent.tsx', async () => {
    const runner = new EslintRunner(FIXTURES);
    const violations = await runner.scan([path.join(FIXTURES, 'BrokenComponent.tsx')]);

    const wcagIds = new Set(violations.map(v => v.wcagId));
    // img missing alt
    expect(wcagIds.has('1.1.1')).toBe(true);
    // button with no accessible name
    expect(wcagIds.has('4.1.2')).toBe(true);
    // input with no label
    expect(wcagIds.has('1.3.1')).toBe(true);
    // generic link text
    expect(wcagIds.has('2.4.4')).toBe(true);
  });

  it('finds no violations in CleanComponent.tsx', async () => {
    const runner = new EslintRunner(FIXTURES);
    const violations = await runner.scan([path.join(FIXTURES, 'CleanComponent.tsx')]);
    expect(violations.length).toBe(0);
  });

  it('violations include source file and line info', async () => {
    const runner = new EslintRunner(FIXTURES);
    const violations = await runner.scan([path.join(FIXTURES, 'BrokenComponent.tsx')]);

    expect(violations.length).toBeGreaterThan(0);
    const node = violations[0].nodes[0];
    expect(node.sourceFile).toContain('BrokenComponent');
    expect(node.sourceLine).toBeGreaterThan(0);
  });
});
