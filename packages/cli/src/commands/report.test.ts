import { describe, it, expect, afterEach, vi } from 'vitest';
import type { A11yViolation } from '@a11y-fixer/core';
import { printViolations } from './report.js';

function capture(stream: 'log' | 'error', fn: () => void): string {
  const lines: string[] = [];
  const spy = vi.spyOn(console, stream).mockImplementation((...a: unknown[]) => {
    lines.push(a.map(String).join(' '));
  });
  try { fn(); } finally { spy.mockRestore(); }
  return lines.join('\n');
}

function violation(over: Partial<A11yViolation> = {}): A11yViolation {
  return {
    id: 'image-alt',
    wcagId: '1.1.1',
    impact: 'critical',
    description: 'images must have alt text',
    helpUrl: 'https://example.com/alt',
    nodes: [],
    ...over,
  };
}

describe('printViolations', () => {
  it('prints a WCAG summary line per violation to stdout by default', () => {
    const out = capture('log', () => printViolations([violation()]));
    expect(out).toBe('  WCAG 1.1.1 [critical] images must have alt text');
  });

  it('prints one → file:line per located node', () => {
    const v = violation({
      nodes: [
        { html: '', target: [], failureSummary: '', sourceFile: 'a.tsx', sourceLine: 3 },
        { html: '', target: [], failureSummary: '', sourceFile: 'b.tsx', sourceLine: 9 },
      ],
    });
    const out = capture('log', () => printViolations([v]));
    expect(out).toContain('    → a.tsx:3');
    expect(out).toContain('    → b.tsx:9');
  });

  it('falls back to ? when a located node has no line', () => {
    const v = violation({ nodes: [{ html: '', target: [], failureSummary: '', sourceFile: 'a.tsx' }] });
    const out = capture('log', () => printViolations([v]));
    expect(out).toContain('    → a.tsx:?');
  });

  it('shows the help URL only when showHelpUrl is set and no node is located', () => {
    const v = violation();
    expect(capture('log', () => printViolations([v]))).not.toContain('Help:');
    expect(capture('log', () => printViolations([v], { showHelpUrl: true }))).toContain(
      '    Help: https://example.com/alt',
    );
  });

  it('does not show the help URL when a node is located', () => {
    const v = violation({ nodes: [{ html: '', target: [], failureSummary: '', sourceFile: 'a.tsx', sourceLine: 1 }] });
    const out = capture('log', () => printViolations([v], { showHelpUrl: true }));
    expect(out).not.toContain('Help:');
  });

  it('caps printed nodes at maxNodes', () => {
    const v = violation({
      nodes: [
        { html: '', target: [], failureSummary: '', sourceFile: 'a.tsx', sourceLine: 1 },
        { html: '', target: [], failureSummary: '', sourceFile: 'b.tsx', sourceLine: 2 },
        { html: '', target: [], failureSummary: '', sourceFile: 'c.tsx', sourceLine: 3 },
      ],
    });
    const out = capture('log', () => printViolations([v], { maxNodes: 2 }));
    expect(out).toContain('a.tsx:1');
    expect(out).toContain('b.tsx:2');
    expect(out).not.toContain('c.tsx:3');
  });

  it('writes to stderr when stream is err', () => {
    const errOut = capture('error', () => printViolations([violation()], { stream: 'err' }));
    expect(errOut).toContain('WCAG 1.1.1');
    const stdOut = capture('log', () => printViolations([violation()], { stream: 'err' }));
    expect(stdOut).toBe('');
  });
});
