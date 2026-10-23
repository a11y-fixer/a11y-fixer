import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';
import type { A11yViolation } from '@a11y-fixer/core';

const cwdResolved = path.resolve('.');

// The --url path delegates to core's scanSource (which drives a real browser);
// mock it so the CLI's dispatch + output can be tested offline. The rest of the
// core barrel stays real via importActual.
const scanSourceMock = vi.hoisted(() => vi.fn());
vi.mock('@a11y-fixer/core', async (importActual) => {
  const actual = await importActual<typeof import('@a11y-fixer/core')>();
  return { ...actual, scanSource: scanSourceMock };
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
  beforeEach(() => { scanSourceMock.mockReset(); });
  afterEach(() => { vi.clearAllMocks(); });

  it('scans the URL via scanSource and reports violations with help links', async () => {
    scanSourceMock.mockResolvedValue([axeViolation('1.4.3')]);

    const out = await captureOutput(() =>
      scanCommand().parseAsync(['.', '--url', 'http://localhost:3000'], { from: 'user' }),
    );

    expect(scanSourceMock).toHaveBeenCalledWith(cwdResolved, expect.objectContaining({ url: 'http://localhost:3000' }));
    expect(out).toContain('with axe-core');
    expect(out).toMatch(/WCAG 1\.4\.3/);
    // No source location on the node → the help URL is shown as a fallback.
    expect(out).toContain('https://dequeuniversity.com/rules/axe/color-contrast');
  });

  it('reports no violations when the URL scan is clean', async () => {
    scanSourceMock.mockResolvedValue([]);

    const out = await captureOutput(() =>
      scanCommand().parseAsync(['.', '--url', 'http://localhost:3000'], { from: 'user' }),
    );

    expect(out).toContain('No accessibility violations found.');
  });

  it('forces the static path (url undefined) when --static is passed with --url', async () => {
    scanSourceMock.mockResolvedValue([]);

    await captureOutput(() =>
      scanCommand().parseAsync(['.', '--static', '--url', 'http://localhost:3000'], { from: 'user' }),
    );

    // --static suppresses the URL, so scanSource is invoked without one.
    expect(scanSourceMock).toHaveBeenCalledWith(cwdResolved, expect.objectContaining({ url: undefined }));
  });
});
