import { describe, it, expect } from 'vitest';
import path from 'node:path';
import type { A11yViolation, A11yNode } from '../detector/index.js';
import { nodeKey, fingerprintKey, fingerprintViolations } from './fingerprint.js';

const ROOT = '/repo';

function node(partial: Partial<A11yNode>): A11yNode {
  return {
    html: '<x>',
    target: [],
    failureSummary: 'bad',
    ...partial,
  };
}

function violation(id: string, nodes: A11yNode[]): A11yViolation {
  return { id, wcagId: '1.1.1', impact: 'serious', description: id, helpUrl: '', nodes };
}

describe('nodeKey', () => {
  it('uses the source file made relative to rootDir', () => {
    const n = node({ sourceFile: path.join(ROOT, 'src/App.tsx'), sourceLine: 9 });
    expect(nodeKey(n, ROOT)).toBe('src/App.tsx');
  });

  it('is independent of line/column', () => {
    const a = node({ sourceFile: path.join(ROOT, 'src/App.tsx'), sourceLine: 1, sourceColumn: 1 });
    const b = node({ sourceFile: path.join(ROOT, 'src/App.tsx'), sourceLine: 99, sourceColumn: 4 });
    expect(nodeKey(a, ROOT)).toBe(nodeKey(b, ROOT));
  });

  it('falls back to the axe target when there is no source file', () => {
    const n = node({ target: ['html', 'body', 'img'] });
    expect(nodeKey(n, ROOT)).toBe('html>body>img');
  });

  it('falls back to html when there is neither source file nor target', () => {
    const n = node({ html: '<img>', target: [] });
    expect(nodeKey(n, ROOT)).toBe('<img>');
  });
});

describe('fingerprintKey', () => {
  it('combines rule id with the node key', () => {
    const n = node({ sourceFile: path.join(ROOT, 'a.tsx') });
    expect(fingerprintKey('jsx-a11y/alt-text', n, ROOT)).toBe('jsx-a11y/alt-text::a.tsx');
  });
});

describe('fingerprintViolations', () => {
  it('counts occurrences per fingerprint', () => {
    const v = [
      violation('r1', [
        node({ sourceFile: path.join(ROOT, 'a.tsx') }),
        node({ sourceFile: path.join(ROOT, 'a.tsx') }),
        node({ sourceFile: path.join(ROOT, 'b.tsx') }),
      ]),
      violation('r2', [node({ sourceFile: path.join(ROOT, 'a.tsx') })]),
    ];
    const counts = fingerprintViolations(v, ROOT);
    expect(counts.get('r1::a.tsx')).toBe(2);
    expect(counts.get('r1::b.tsx')).toBe(1);
    expect(counts.get('r2::a.tsx')).toBe(1);
    expect(counts.size).toBe(3);
  });

  it('returns an empty map for no violations', () => {
    expect(fingerprintViolations([], ROOT).size).toBe(0);
  });
});
