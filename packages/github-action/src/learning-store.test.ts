import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { FixResult } from '@a11y-fixer/core';
import type { Generation } from '@a11y-fixer/ai';
import {
  readStore,
  writeStore,
  recordProposals,
  reconcile,
  loadExamples,
  makeFileReader,
  type LearningRecord,
  type FileReader,
} from './learning-store.js';

function aiFix(partial: Partial<FixResult> & { after: string; file: string; line?: number }): FixResult {
  return {
    wcagId: partial.wcagId ?? '1.1.1',
    bucket: 'ai-assisted',
    applied: true,
    description: partial.description ?? '',
    before: partial.before ?? '',
    after: partial.after,
    sourceLocation: { file: partial.file, line: partial.line ?? 1, column: 1 },
  };
}

function gen(value: string, bucket: Generation['bucket'] = 'alt'): Generation {
  const method = bucket === 'alt' ? 'suggestAltText' : bucket === 'link' ? 'rewriteLinkText' : 'suggestAccessibleName';
  return { method, bucket, value };
}

/** Builds an in-memory file reader from a {relPath: content} map. */
function reader(files: Record<string, string>): FileReader {
  return async (rel) => (rel in files ? files[rel]! : null);
}

describe('recordProposals', () => {
  it('correlates each AI fix with the generation whose value it carries', () => {
    const fixes = [
      aiFix({ file: 'a.tsx', before: '<img src="dog.png">', after: '<img src="dog.png" alt="A happy dog">' }),
    ];
    const gens = [gen('A happy dog', 'alt'), gen('unused', 'link')];

    const added = recordProposals([], fixes, gens, () => '2026-01-01T00:00:00Z');
    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({
      bucket: 'alt',
      proposed: 'A happy dog',
      anchor: 'dog.png',
      status: 'proposed',
      sourceFile: 'a.tsx',
    });
  });

  it('skips non-AI fixes and already-known ids', () => {
    const ruleBased: FixResult = { ...aiFix({ file: 'a.tsx', after: 'x' }), bucket: 'rule-based' };
    const fixes = [
      ruleBased,
      aiFix({ file: 'b.tsx', before: '<img src="c.png">', after: '<img src="c.png" alt="Cat">' }),
    ];
    const first = recordProposals([], fixes, [gen('Cat')], () => 't');
    expect(first).toHaveLength(1);
    // Re-running with the same fix already recorded yields no duplicate.
    const second = recordProposals(first, fixes, [gen('Cat')], () => 't');
    expect(second).toHaveLength(0);
  });

  it('does not attribute two fixes to the same generation', () => {
    const fixes = [
      aiFix({ file: 'a.tsx', before: '<img src="1.png">', after: '<img src="1.png" alt="Shared">' }),
      aiFix({ file: 'b.tsx', before: '<img src="2.png">', after: '<img src="2.png" alt="Shared">' }),
    ];
    // Only one generation with that value → only one record.
    const added = recordProposals([], fixes, [gen('Shared')], () => 't');
    expect(added).toHaveLength(1);
  });
});

function proposed(over: Partial<LearningRecord>): LearningRecord {
  return {
    id: over.id ?? 'id1',
    bucket: over.bucket ?? 'alt',
    wcagId: '1.1.1',
    sourceFile: over.sourceFile ?? 'a.tsx',
    anchor: over.anchor ?? null,
    before: over.before ?? '',
    proposed: over.proposed ?? 'A happy dog',
    status: 'proposed',
    accepted: null,
    firstSeen: 't0',
    resolvedAt: null,
    ...over,
  };
}

describe('reconcile', () => {
  it('marks merged when the proposed value persists in source', async () => {
    const rec = proposed({ proposed: 'A happy dog', anchor: 'dog.png', sourceFile: 'a.tsx' });
    const out = await reconcile([rec], reader({ 'a.tsx': '<img src="dog.png" alt="A happy dog">' }), () => 't1');
    expect(out[0]!.status).toBe('merged');
    expect(out[0]!.accepted).toBe('A happy dog');
  });

  it('marks corrected and captures the human value when the element changed', async () => {
    const rec = proposed({ proposed: 'A happy dog', anchor: 'dog.png', bucket: 'alt' });
    const out = await reconcile(
      [rec],
      reader({ 'a.tsx': '<img src="dog.png" alt="Golden retriever catching a frisbee">' }),
      () => 't1',
    );
    expect(out[0]!.status).toBe('corrected');
    expect(out[0]!.accepted).toBe('Golden retriever catching a frisbee');
  });

  it('marks rejected when the value was removed entirely', async () => {
    const rec = proposed({ proposed: 'A happy dog', anchor: 'dog.png', bucket: 'alt' });
    const out = await reconcile([rec], reader({ 'a.tsx': '<img src="dog.png">' }), () => 't1');
    expect(out[0]!.status).toBe('rejected');
    expect(out[0]!.accepted).toBeNull();
  });

  it('stays pending when the element cannot be located (PR may still be open)', async () => {
    const rec = proposed({ proposed: 'A happy dog', anchor: 'dog.png' });
    const out = await reconcile([rec], reader({ 'a.tsx': '<div>unrelated</div>' }), () => 't1');
    expect(out[0]!.status).toBe('proposed');
  });

  it('relocates an anchorless element by its pre-fix markup', async () => {
    const rec = proposed({
      bucket: 'name',
      anchor: null,
      before: '<button class="icon-close" aria-label="Close dialog"><svg/></button>',
      proposed: 'Close dialog',
    });
    const out = await reconcile(
      [rec],
      reader({ 'a.tsx': '<button class="icon-close" aria-label="Dismiss"><svg/></button>' }),
      () => 't1',
    );
    expect(out[0]!.status).toBe('corrected');
    expect(out[0]!.accepted).toBe('Dismiss');
  });

  it('leaves already-resolved records untouched', async () => {
    const rec = proposed({ status: 'merged', accepted: 'x', resolvedAt: 't0' });
    const out = await reconcile([rec], reader({}), () => 't1');
    expect(out[0]!.resolvedAt).toBe('t0');
  });
});

describe('loadExamples', () => {
  it('collects accepted values per bucket, most-recent first, deduped', () => {
    const records: LearningRecord[] = [
      proposed({ id: '1', bucket: 'alt', status: 'merged', accepted: 'Old alt' }),
      proposed({ id: '2', bucket: 'alt', status: 'corrected', accepted: 'New alt' }),
      proposed({ id: '3', bucket: 'alt', status: 'corrected', accepted: 'New alt' }),
      proposed({ id: '4', bucket: 'link', status: 'merged', accepted: 'Read the docs' }),
      proposed({ id: '5', bucket: 'name', status: 'rejected', accepted: null }),
    ];
    const ex = loadExamples(records);
    expect(ex.alt).toEqual(['New alt', 'Old alt']);
    expect(ex.link).toEqual(['Read the docs']);
    expect(ex.name).toBeUndefined();
  });
});

describe('store round-trip', () => {
  let tmp: string;
  beforeEach(async () => {
    tmp = await mkdtemp(path.join(tmpdir(), 'a11y-learn-'));
  });
  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it('reads an empty/missing store as []', async () => {
    expect(await readStore(path.join(tmp, 'missing.jsonl'))).toEqual([]);
  });

  it('writes and reads back records, skipping corrupt lines', async () => {
    const file = path.join(tmp, 'sub', 'learning.jsonl');
    const records = [proposed({ id: 'a' }), proposed({ id: 'b', status: 'merged', accepted: 'v' })];
    await writeStore(file, records);
    const back = await readStore(file);
    expect(back.map((r) => r.id)).toEqual(['a', 'b']);

    // A corrupt line is skipped, not fatal.
    await writeFile(file, JSON.stringify(records[0]) + '\n{bad json\n', 'utf8');
    expect(await readStore(file)).toHaveLength(1);
  });

  it('makeFileReader reads repo-relative files', async () => {
    await mkdir(path.join(tmp, 'src'), { recursive: true });
    await writeFile(path.join(tmp, 'src', 'App.tsx'), 'hello', 'utf8');
    const read = makeFileReader(tmp);
    expect(await read('src/App.tsx')).toBe('hello');
    expect(await read('nope.tsx')).toBeNull();
  });
});
