import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { A11yViolation } from '@a11y-fixer/core';

// Mock only AxeDetector (the --url path); keep the real EslintRunner for the
// static-path tests below.
const axeScan = vi.hoisted(() => vi.fn());
vi.mock('@a11y-fixer/core', async (importActual) => {
  const actual = await importActual<typeof import('@a11y-fixer/core')>();
  return { ...actual, AxeDetector: class { scan = axeScan; } };
});

import { checkCommand } from './check.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(here, '../../../../tests/fixtures');

// `check` calls process.exit(); in-process we spy it so it does not kill the
// test runner and we can assert the exit code. Output is silenced + captured.
async function runCheck(args: string[]): Promise<{ code: number | undefined; output: string }> {
  const lines: string[] = [];
  const push = (...a: unknown[]) => void lines.push(a.map(String).join(' '));
  const logSpy = vi.spyOn(console, 'log').mockImplementation(push);
  const errSpy = vi.spyOn(console, 'error').mockImplementation(push);
  let code: number | undefined;
  // Real process.exit halts execution; the mock must too, or the clean-path
  // code falls through into the violations branch. Throw a sentinel and swallow.
  const sentinel = Symbol('exit');
  const exitSpy = vi
    .spyOn(process, 'exit')
    .mockImplementation(((c?: number) => { code = c; throw sentinel; }) as never);
  try {
    await checkCommand().parseAsync(args, { from: 'user' });
  } catch (err) {
    if (err !== sentinel) throw err;
  } finally {
    logSpy.mockRestore();
    errSpy.mockRestore();
    exitSpy.mockRestore();
  }
  return { code, output: lines.join('\n') };
}

const tmpDirs: string[] = [];
let savedKey: string | undefined;

beforeEach(() => {
  savedKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  axeScan.mockReset();
});

function axeViolation(wcagId: string): A11yViolation {
  return {
    id: 'color-contrast',
    wcagId,
    impact: 'serious',
    description: 'elements must have sufficient color contrast',
    helpUrl: 'https://dequeuniversity.com/rules/axe/color-contrast',
    nodes: [{ html: '<span>x</span>', target: ['span'], failureSummary: '' }],
  };
}

afterEach(async () => {
  if (savedKey !== undefined) process.env.ANTHROPIC_API_KEY = savedKey;
  await Promise.all(tmpDirs.splice(0).map(d => rm(d, { recursive: true, force: true })));
});

describe('check command', () => {
  it('exits 1 and lists violations for a directory with broken source', async () => {
    const { code, output } = await runCheck([fixturesDir]);
    expect(code).toBe(1);
    expect(output).toMatch(/Found \d+ accessibility violation/);
    expect(output).toMatch(/WCAG 1\.1\.1/);
  });

  it('exits 0 for a directory with only clean source', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'a11y-check-'));
    tmpDirs.push(dir);
    await cp(path.join(fixturesDir, 'CleanComponent.tsx'), path.join(dir, 'CleanComponent.tsx'));

    const { code, output } = await runCheck([dir]);
    expect(code).toBe(0);
    expect(output).toContain('No accessibility violations found.');
  });

  it('exits 0 for an empty directory', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'a11y-check-'));
    tmpDirs.push(dir);

    const { code, output } = await runCheck([dir]);
    expect(code).toBe(0);
    expect(output).toContain('No accessibility violations found.');
  });

  describe('--url (axe path)', () => {
    it('scans the URL with AxeDetector and exits 1 on violations', async () => {
      axeScan.mockResolvedValue([axeViolation('1.4.3')]);

      const { code, output } = await runCheck(['.', '--url', 'http://localhost:3000']);

      expect(axeScan).toHaveBeenCalledWith({ url: 'http://localhost:3000' });
      expect(code).toBe(1);
      expect(output).toMatch(/WCAG 1\.4\.3/);
    });

    it('exits 0 when the URL scan finds nothing', async () => {
      axeScan.mockResolvedValue([]);

      const { code, output } = await runCheck(['.', '--url', 'http://localhost:3000']);

      expect(axeScan).toHaveBeenCalledWith({ url: 'http://localhost:3000' });
      expect(code).toBe(0);
      expect(output).toContain('No accessibility violations found.');
    });
  });
});
