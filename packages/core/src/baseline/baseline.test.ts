import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { A11yViolation, A11yNode } from '../detector/index.js';
import {
  loadBaseline,
  buildBaseline,
  saveBaseline,
  diffAgainstBaseline,
  type Baseline,
} from './baseline.js';

const ROOT = '/repo';

function node(sourceFile: string): A11yNode {
  return {
    html: '<x>',
    target: [],
    failureSummary: 'bad',
    sourceFile: path.join(ROOT, sourceFile),
    sourceLine: 1,
  };
}

function violation(id: string, files: string[]): A11yViolation {
  return {
    id,
    wcagId: '1.1.1',
    impact: 'serious',
    description: id,
    helpUrl: '',
    nodes: files.map(node),
  };
}

describe('buildBaseline', () => {
  it('records fingerprint counts with version and timestamp', () => {
    const b = buildBaseline([violation('r1', ['a.tsx', 'a.tsx', 'b.tsx'])], ROOT);
    expect(b.version).toBe(1);
    expect(typeof b.createdAt).toBe('string');
    expect(b.entries).toEqual({ 'r1::a.tsx': 2, 'r1::b.tsx': 1 });
  });
});

describe('save/load round trip', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-baseline-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('writes and reads back an identical baseline', () => {
    const file = path.join(dir, 'base.json');
    const b = buildBaseline([violation('r1', ['a.tsx'])], ROOT);
    saveBaseline(file, b);
    expect(fs.readFileSync(file, 'utf8').endsWith('\n')).toBe(true);
    expect(loadBaseline(file)).toEqual(b);
  });

  it('loadBaseline returns null when the file is missing', () => {
    expect(loadBaseline(path.join(dir, 'nope.json'))).toBeNull();
  });
});

describe('diffAgainstBaseline', () => {
  it('reports nothing new when the scan matches the baseline', () => {
    const scan = [violation('r1', ['a.tsx', 'b.tsx'])];
    const baseline = buildBaseline(scan, ROOT);
    const diff = diffAgainstBaseline(scan, baseline, ROOT);
    expect(diff.newViolations).toEqual([]);
    expect(diff.baselinedCount).toBe(2);
    expect(diff.resolvedCount).toBe(0);
  });

  it('surfaces only occurrences beyond the baselined count', () => {
    const baseline = buildBaseline([violation('r1', ['a.tsx'])], ROOT);
    const scan = [violation('r1', ['a.tsx', 'a.tsx'])]; // one more in same file
    const diff = diffAgainstBaseline(scan, baseline, ROOT);
    expect(diff.newViolations).toHaveLength(1);
    expect(diff.newViolations[0].nodes).toHaveLength(1);
    expect(diff.baselinedCount).toBe(1);
  });

  it('treats a violation in a new file as new', () => {
    const baseline = buildBaseline([violation('r1', ['a.tsx'])], ROOT);
    const scan = [violation('r1', ['a.tsx', 'b.tsx'])];
    const diff = diffAgainstBaseline(scan, baseline, ROOT);
    expect(diff.newViolations).toHaveLength(1);
    expect(diff.newViolations[0].nodes.map(n => n.sourceFile)).toEqual([
      path.join(ROOT, 'b.tsx'),
    ]);
  });

  it('treats an entirely new rule as new', () => {
    const baseline = buildBaseline([violation('r1', ['a.tsx'])], ROOT);
    const scan = [violation('r1', ['a.tsx']), violation('r2', ['a.tsx'])];
    const diff = diffAgainstBaseline(scan, baseline, ROOT);
    expect(diff.newViolations.map(v => v.id)).toEqual(['r2']);
  });

  it('counts resolved occurrences no longer present', () => {
    const baseline = buildBaseline([violation('r1', ['a.tsx', 'a.tsx', 'b.tsx'])], ROOT);
    const scan = [violation('r1', ['a.tsx'])]; // a.tsx dropped from 2→1, b.tsx gone
    const diff = diffAgainstBaseline(scan, baseline, ROOT);
    expect(diff.newViolations).toEqual([]);
    expect(diff.resolvedCount).toBe(2);
  });

  it('treats an empty baseline as all-new', () => {
    const empty: Baseline = { version: 1, createdAt: '', entries: {} };
    const scan = [violation('r1', ['a.tsx'])];
    const diff = diffAgainstBaseline(scan, empty, ROOT);
    expect(diff.newViolations).toHaveLength(1);
  });
});
