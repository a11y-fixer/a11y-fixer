import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { A11yViolation } from '../detector/index.js';

const h = vi.hoisted(() => ({
  axeScan: vi.fn(),
  eslintScan: vi.fn(),
  htmlScan: vi.fn(),
  locate: vi.fn(),
}));

vi.mock('../detector/axe.js', () => ({
  AxeDetector: class { scan = h.axeScan; },
}));
vi.mock('./eslint-runner.js', () => ({
  EslintRunner: class { scan = h.eslintScan; },
}));
vi.mock('./html-runner.js', () => ({
  HtmlFileRunner: class { scan = h.htmlScan; },
}));
vi.mock('../mapper/react-jsx.js', () => ({
  ReactJSXMapper: class { locate = h.locate; },
}));

import { scanSource } from './scan-source.js';

function urlViolation(): A11yViolation {
  return {
    id: 'color-contrast',
    wcagId: '1.4.3',
    impact: 'serious',
    description: 'contrast',
    helpUrl: 'https://example.com',
    nodes: [{ html: '<span>x</span>', target: ['span'], failureSummary: '' }],
  };
}

describe('scanSource', () => {
  beforeEach(() => {
    h.axeScan.mockReset();
    h.eslintScan.mockReset();
    h.htmlScan.mockReset();
    h.locate.mockReset();
  });

  it('uses the ESLint runner for static JSX (no url, no html)', async () => {
    h.eslintScan.mockResolvedValue(['jsx']);
    const result = await scanSource('/root', {});
    expect(result).toEqual(['jsx']);
    expect(h.eslintScan).toHaveBeenCalledOnce();
    expect(h.htmlScan).not.toHaveBeenCalled();
    expect(h.axeScan).not.toHaveBeenCalled();
  });

  it('uses the HTML runner when html is set', async () => {
    h.htmlScan.mockResolvedValue(['html']);
    const result = await scanSource('/root', { html: true });
    expect(result).toEqual(['html']);
    expect(h.htmlScan).toHaveBeenCalledOnce();
    expect(h.eslintScan).not.toHaveBeenCalled();
  });

  it('scans a url with axe and takes precedence over html', async () => {
    h.axeScan.mockResolvedValue([]);
    await scanSource('/root', { url: 'http://x', html: true });
    expect(h.axeScan).toHaveBeenCalledWith({ url: 'http://x' });
    expect(h.htmlScan).not.toHaveBeenCalled();
  });

  it('maps url violation nodes back to JSX source locations', async () => {
    h.axeScan.mockResolvedValue([urlViolation()]);
    h.locate.mockResolvedValue({ file: '/root/App.tsx', line: 7, column: 3 });

    const [v] = await scanSource('/root', { url: 'http://x' });

    expect(h.locate).toHaveBeenCalledOnce();
    expect(v.nodes[0]).toMatchObject({ sourceFile: '/root/App.tsx', sourceLine: 7, sourceColumn: 3 });
  });

  it('leaves nodes unmapped when the mapper finds nothing', async () => {
    h.axeScan.mockResolvedValue([urlViolation()]);
    h.locate.mockResolvedValue(null);

    const [v] = await scanSource('/root', { url: 'http://x' });

    expect(v.nodes[0].sourceFile).toBeUndefined();
  });

  it('does not re-map a node that already has a source file', async () => {
    const violation = urlViolation();
    violation.nodes[0].sourceFile = '/already/known.tsx';
    h.axeScan.mockResolvedValue([violation]);

    await scanSource('/root', { url: 'http://x' });

    expect(h.locate).not.toHaveBeenCalled();
  });
});
