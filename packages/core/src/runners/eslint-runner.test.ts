import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
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

  describe('button-must-have-label: dynamic children', () => {
    let dir: string;
    beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'eslint-btn-')); });
    afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

    async function scan(src: string) {
      const file = path.join(dir, 'C.tsx');
      await writeFile(file, src, 'utf8');
      const violations = await new EslintRunner(dir).scan([file]);
      return violations.filter(v => v.wcagId === '4.1.2' && v.id.includes('button'));
    }

    it('does NOT flag a pass-through button rendering {children}', async () => {
      // Flagging this and stamping a static aria-label would override every
      // caller's real label — the primitive is labelled by its children.
      const src = 'export const B = (props: any) => <button {...props}>{props.children}</button>;';
      expect(await scan(src)).toHaveLength(0);
    });

    it('does NOT flag a button whose child is a dynamic label expression', async () => {
      const src = 'export const B = ({ label }: any) => <button>{label}</button>;';
      expect(await scan(src)).toHaveLength(0);
    });

    it('still flags an icon-only button with no accessible name', async () => {
      const src = 'export const B = () => <button><svg aria-hidden="true" /></button>;';
      expect((await scan(src)).length).toBeGreaterThan(0);
    });
  });
});
