import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { A11yViolation } from '@a11y-fixer/core';

// The --url path uses AxeDetector (a real browser); mock it so the CLI logic
// can be tested offline. EslintRunner (static path) stays real via importActual.
const axeScan = vi.hoisted(() => vi.fn());
vi.mock('@a11y-fixer/core', async (importActual) => {
  const actual = await importActual<typeof import('@a11y-fixer/core')>();
  return { ...actual, AxeDetector: class { scan = axeScan; } };
});

import { scanCommand } from './scan.js';

async function captureOutput(fn: () => Promise<unknown>): Promise<string> {
  const lines: string[] = [];
  const push = (...args: unknown[]) => void lines.push(args.map(String).join(' '));
  const logSpy = vi.spyOn(console, 'log').mockImplementation(push);
  const errSpy = vi.spyOn(console, 'error').mockImplementation(push);
  try {
    await fn();
  } finally {
    logSpy.mockRestore();
    errSpy.mockRestore();
  }
  return lines.join('\n');
}

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

describe('scan command --url (axe path)', () => {
  beforeEach(() => { axeScan.mockReset(); });
  afterEach(() => { vi.clearAllMocks(); });

  it('scans the URL with AxeDetector and reports violations with help links', async () => {
    axeScan.mockResolvedValue([axeViolation('1.4.3')]);

    const out = await captureOutput(() =>
      scanCommand().parseAsync(['.', '--url', 'http://localhost:3000'], { from: 'user' }),
    );

    expect(axeScan).toHaveBeenCalledWith({ url: 'http://localhost:3000' });
    expect(out).toContain('with axe-core');
    expect(out).toMatch(/WCAG 1\.4\.3/);
    expect(out).toContain('https://dequeuniversity.com/rules/axe/color-contrast');
  });

  it('reports no violations when the URL scan is clean', async () => {
    axeScan.mockResolvedValue([]);

    const out = await captureOutput(() =>
      scanCommand().parseAsync(['.', '--url', 'http://localhost:3000'], { from: 'user' }),
    );

    expect(out).toContain('No accessibility violations found.');
  });

  it('uses the static path (not AxeDetector) when --static is passed with --url', async () => {
    const dir = process.cwd();
    await captureOutput(() =>
      scanCommand().parseAsync([dir, '--static', '--url', 'http://localhost:3000'], { from: 'user' }),
    );
    // --static forces the EslintRunner branch, so the URL detector is untouched.
    expect(axeScan).not.toHaveBeenCalled();
  });
});
