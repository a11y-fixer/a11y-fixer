import { describe, it, expect } from 'vitest';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { editRecordedLine } from './line-edit.js';

async function tmpFile(content: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'line-edit-'));
  const file = join(dir, 'src.html');
  await writeFile(file, content, 'utf8');
  return file;
}

describe('editRecordedLine', () => {
  it('applies the transform and writes the file', async () => {
    const file = await tmpFile('a\n<b>x</b>\nc');
    const res = await editRecordedLine({ sourceFile: file, sourceLine: 2 }, l => l.toUpperCase(), 'nope');
    expect(res).toEqual({ status: 'applied', updated: '<B>X</B>' });
    expect(await readFile(file, 'utf8')).toBe('a\n<B>X</B>\nc');
  });

  it('flags with the no-change note when the transform returns null, leaving the file untouched', async () => {
    const file = await tmpFile('a\nb\nc');
    const res = await editRecordedLine({ sourceFile: file, sourceLine: 2 }, () => null, 'nothing to do');
    expect(res).toEqual({ status: 'flag', note: 'nothing to do' });
    expect(await readFile(file, 'utf8')).toBe('a\nb\nc');
  });

  it('flags when there is no source location', async () => {
    const res = await editRecordedLine({}, l => l, 'x');
    expect(res).toEqual({ status: 'flag', note: 'No source location to apply the fix' });
  });

  it('flags when the file cannot be read', async () => {
    const res = await editRecordedLine({ sourceFile: '/no/such/file.html', sourceLine: 1 }, l => l, 'x');
    expect(res).toEqual({ status: 'flag', note: 'Could not read source file' });
  });

  it('flags when the recorded line is out of range', async () => {
    const file = await tmpFile('only one line');
    const res = await editRecordedLine({ sourceFile: file, sourceLine: 5 }, l => l, 'x');
    expect(res).toEqual({ status: 'flag', note: 'Recorded line is out of range' });
  });
});
