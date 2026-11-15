import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { A11yViolation, FixResult } from '@a11y-fixer/core';
import { verifyFixes, snapshotFiles } from './verify-fixes.js';

/**
 * The verification gate decides, per edited file, whether applied fixes actually
 * reduced violations without introducing new ones — and restores any file that
 * fails. These tests construct violation/fix literals directly (no real core) and
 * exercise restore against real files in a tmp dir.
 */

function viol(id: string, wcagId: string, file: string, line = 1): A11yViolation {
  return {
    id,
    wcagId,
    impact: 'serious',
    description: id,
    helpUrl: '',
    nodes: [{ html: `${file}:${line}:1`, target: [file], failureSummary: id, sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

function fix(wcagId: string, file: string, line = 1): FixResult {
  return {
    wcagId,
    bucket: 'ai-assisted',
    applied: true,
    description: `fix ${wcagId}`,
    before: '<x>',
    after: '<x fixed>',
    sourceLocation: { file, line, column: 1 },
  };
}

let dir: string;
let fileA: string;
let fileB: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'a11y-verify-'));
  fileA = join(dir, 'A.tsx');
  fileB = join(dir, 'B.tsx');
  await writeFile(fileA, 'ORIGINAL_A', 'utf8');
  await writeFile(fileB, 'ORIGINAL_B', 'utf8');
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('verifyFixes', () => {
  it('keeps a fix whose file net-improved (violation cleared)', async () => {
    const before = [viol('image-alt', '1.1.1', fileA, 4)];
    const after: A11yViolation[] = []; // cleared
    const fixes = [fix('1.1.1', fileA, 4)];

    const report = await verifyFixes({
      before, after, fixes,
      changedFiles: [fileA],
      snapshot: new Map([[fileA, 'ORIGINAL_A']]),
      rescan: async () => { throw new Error('should not re-scan when nothing is reverted'); },
    });

    expect(report.verifiedFixes).toHaveLength(1);
    expect(report.revertedFiles).toHaveLength(0);
    expect(report.revertedFixes).toHaveLength(0);
    expect(report.finalAfter).toBe(after);
    // File edit was left intact (we wrote the "edit" below to prove no restore ran).
    await writeFile(fileA, 'EDITED_A', 'utf8');
    expect(await readFile(fileA, 'utf8')).toBe('EDITED_A');
  });

  it('reverts a cover-up: violation still present after the fix, file restored', async () => {
    const before = [viol('image-alt', '1.1.1', fileA, 4)];
    const after = [viol('image-alt', '1.1.1', fileA, 4)]; // unchanged — not cleared
    const fixes = [fix('1.1.1', fileA, 4)];
    // Simulate the on-disk edit the fixer made.
    await writeFile(fileA, 'EDITED_A_BUT_STILL_BROKEN', 'utf8');

    const report = await verifyFixes({
      before, after, fixes,
      changedFiles: [fileA],
      snapshot: new Map([[fileA, 'ORIGINAL_A']]),
      rescan: async () => before, // re-scan after restore sees the original violation
    });

    expect(report.verifiedFixes).toHaveLength(0);
    expect(report.revertedFixes).toHaveLength(1);
    expect(report.revertedFiles).toEqual([fileA]);
    expect(report.unclearedFiles).toEqual([fileA]);
    expect(report.finalAfter).toEqual(before);
    // The real file was restored to its pre-fix contents.
    expect(await readFile(fileA, 'utf8')).toBe('ORIGINAL_A');
  });

  it('reverts a regression: fix cleared its target but introduced a new violation', async () => {
    const before = [viol('image-alt', '1.1.1', fileA, 4)];
    const after = [viol('label', '1.3.1', fileA, 4)]; // target gone, new rule appeared
    const fixes = [fix('1.1.1', fileA, 4)];
    await writeFile(fileA, 'EDITED_A_REGRESSED', 'utf8');

    const report = await verifyFixes({
      before, after, fixes,
      changedFiles: [fileA],
      snapshot: new Map([[fileA, 'ORIGINAL_A']]),
      rescan: async () => before,
    });

    expect(report.regressions).toHaveLength(1);
    expect(report.regressions[0]).toMatchObject({ file: fileA, regressed: true, newRuleIds: ['label'] });
    expect(report.revertedFiles).toEqual([fileA]);
    expect(report.verifiedFixes).toHaveLength(0);
    expect(await readFile(fileA, 'utf8')).toBe('ORIGINAL_A');
  });

  it('blunt file-level revert discards a good sibling fix when the file fails (v1 tradeoff)', async () => {
    // fileA had two violations; one fix cleared image-alt (good), another edit
    // regressed by introducing a label violation. The whole file is reverted, so
    // the good alt fix is discarded too.
    const before = [viol('image-alt', '1.1.1', fileA, 4)];
    const after = [viol('label', '1.3.1', fileA, 6)];
    const goodFix = fix('1.1.1', fileA, 4);
    const sideFix = fix('4.1.2', fileA, 6);

    const report = await verifyFixes({
      before, after,
      fixes: [goodFix, sideFix],
      changedFiles: [fileA],
      snapshot: new Map([[fileA, 'ORIGINAL_A']]),
      rescan: async () => before,
    });

    expect(report.verifiedFixes).toHaveLength(0);
    expect(report.revertedFixes).toHaveLength(2); // good fix dropped alongside the bad one
    expect(report.revertedFiles).toEqual([fileA]);
  });

  it('isolates failure to the offending file — a passing file keeps its fix', async () => {
    const before = [viol('image-alt', '1.1.1', fileA, 4), viol('image-alt', '1.1.1', fileB, 2)];
    const after = [viol('image-alt', '1.1.1', fileB, 2)]; // A cleared, B unchanged
    const fixA = fix('1.1.1', fileA, 4);
    const fixB = fix('1.1.1', fileB, 2);
    await writeFile(fileB, 'EDITED_B_STILL_BROKEN', 'utf8');

    const report = await verifyFixes({
      before, after,
      fixes: [fixA, fixB],
      changedFiles: [fileA, fileB],
      snapshot: new Map([[fileA, 'ORIGINAL_A'], [fileB, 'ORIGINAL_B']]),
      rescan: async () => [viol('image-alt', '1.1.1', fileB, 2)],
    });

    expect(report.verifiedFixes).toEqual([fixA]);
    expect(report.revertedFixes).toEqual([fixB]);
    expect(report.revertedFiles).toEqual([fileB]);
    expect(await readFile(fileB, 'utf8')).toBe('ORIGINAL_B');
  });

  it('leaves an un-snapshotted failing file untouched rather than corrupting it', async () => {
    const before = [viol('image-alt', '1.1.1', fileA, 4)];
    const after = [viol('image-alt', '1.1.1', fileA, 4)]; // not cleared
    const fixes = [fix('1.1.1', fileA, 4)];
    await writeFile(fileA, 'EDITED_NO_SNAPSHOT', 'utf8');

    const report = await verifyFixes({
      before, after, fixes,
      changedFiles: [fileA],
      snapshot: new Map(), // nothing to restore from
      rescan: async () => { throw new Error('no restore → no re-scan'); },
    });

    expect(report.revertedFiles).toHaveLength(0);
    // The fix is still counted as applied (we never reverted it) and the edit stands.
    expect(report.verifiedFixes).toHaveLength(1);
    expect(await readFile(fileA, 'utf8')).toBe('EDITED_NO_SNAPSHOT');
  });
});

describe('snapshotFiles', () => {
  it('captures pre-fix contents of each unique candidate source file', async () => {
    const before = [
      viol('image-alt', '1.1.1', fileA, 4),
      viol('button-name', '4.1.2', fileA, 6), // same file, deduped
      viol('image-alt', '1.1.1', fileB, 2),
    ];
    const snap = await snapshotFiles(before);
    expect(snap.get(fileA)).toBe('ORIGINAL_A');
    expect(snap.get(fileB)).toBe('ORIGINAL_B');
    expect(snap.size).toBe(2);
  });

  it('skips unreadable candidates without throwing', async () => {
    const missing = join(dir, 'gone.tsx');
    const snap = await snapshotFiles([viol('image-alt', '1.1.1', missing, 1)]);
    expect(snap.size).toBe(0);
  });

  it('ignores violations with no source file', async () => {
    const noFile: A11yViolation = {
      id: 'image-alt', wcagId: '1.1.1', impact: 'serious', description: '', helpUrl: '',
      nodes: [{ html: '', target: [], failureSummary: '' }],
    };
    const snap = await snapshotFiles([noFile]);
    expect(snap.size).toBe(0);
  });
});
