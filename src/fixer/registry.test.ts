import { describe, it, expect, vi } from 'vitest';
import { FixerRegistry } from './registry.js';
import type { Fixer, FixResult } from './index.js';
import type { A11yViolation } from '../detector/index.js';

const makeViolation = (wcagId: string): A11yViolation => ({
  id: 'test-rule',
  wcagId,
  impact: 'serious',
  description: 'Test violation',
  helpUrl: 'https://example.com',
  nodes: [{ html: '<img src="x.png">', target: ['img'], failureSummary: 'Missing alt' }],
});

describe('FixerRegistry', () => {
  it('routes violation to the matching fixer', async () => {
    const registry = new FixerRegistry();
    const fixer: Fixer = {
      wcagId: '1.1.1',
      bucket: 'ai-assisted',
      canFix: () => true,
      fix: async (v) => ({
        wcagId: v.wcagId,
        bucket: 'ai-assisted',
        applied: true,
        description: 'Added alt text',
        before: v.nodes[0].html,
        after: '<img src="x.png" alt="Logo">',
      }),
    };

    registry.register(fixer);
    const results = await registry.applyAll([makeViolation('1.1.1')]);

    expect(results).toHaveLength(1);
    expect(results[0].applied).toBe(true);
    expect(results[0].bucket).toBe('ai-assisted');
  });

  it('human-flags violations with no registered fixer', async () => {
    const registry = new FixerRegistry();
    const results = await registry.applyAll([makeViolation('99.9.9')]);

    expect(results[0].bucket).toBe('human-flagged');
    expect(results[0].applied).toBe(false);
  });

  it('handles fixer errors without corrupting other results', async () => {
    const registry = new FixerRegistry();

    const badFixer: Fixer = {
      wcagId: '1.1.1',
      bucket: 'ai-assisted',
      canFix: () => true,
      fix: async () => { throw new Error('Vision API unavailable'); },
    };
    const goodFixer: Fixer = {
      wcagId: '3.1.1',
      bucket: 'rule-based',
      canFix: () => true,
      fix: async (v) => ({ wcagId: v.wcagId, bucket: 'rule-based', applied: true, description: 'Added lang', before: v.nodes[0].html }),
    };

    registry.register(badFixer);
    registry.register(goodFixer);

    const results = await registry.applyAll([
      makeViolation('1.1.1'),
      makeViolation('3.1.1'),
    ]);

    expect(results[0].applied).toBe(false);
    expect(results[0].description).toContain('Vision API unavailable');
    expect(results[1].applied).toBe(true);
  });
});
