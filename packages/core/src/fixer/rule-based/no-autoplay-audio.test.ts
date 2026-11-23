import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { AutoplayAudioFixer, removeAutoplay } from './no-autoplay-audio.js';
import type { A11yViolation } from '../../detector/index.js';

function violation(file?: string, line?: number, id = 'no-autoplay-audio'): A11yViolation {
  return {
    id,
    wcagId: '1.4.2',
    impact: 'moderate',
    description: 'audio/video must not autoplay',
    helpUrl: '',
    nodes: [{ html: '<video autoplay src="a.mp4">', target: ['video'], failureSummary: '', sourceFile: file, sourceLine: line, sourceColumn: 1 }],
  };
}

describe('removeAutoplay', () => {
  it('removes a valueless autoplay from <video>', () => {
    expect(removeAutoplay('<video autoplay src="a.mp4">')).toBe('<video src="a.mp4">');
  });

  it('removes autoplay="autoplay" from <audio>', () => {
    expect(removeAutoplay('<audio autoplay="autoplay" controls>')).toBe('<audio controls>');
  });

  it('returns null when there is no media tag', () => {
    expect(removeAutoplay('<div autoplay>x</div>')).toBeNull();
  });

  it('returns null when the media has no autoplay', () => {
    expect(removeAutoplay('<video controls src="a.mp4">')).toBeNull();
  });
});

describe('AutoplayAudioFixer', () => {
  let dir: string;
  beforeEach(async () => { dir = await mkdtemp(path.join(tmpdir(), 'no-autoplay-')); });
  afterEach(async () => { await rm(dir, { recursive: true, force: true }); });

  it('canFix matches the axe id only', () => {
    const fixer = new AutoplayAudioFixer(dir);
    expect(fixer.canFix(violation('x.html', 1))).toBe(true);
    expect(fixer.canFix(violation('x.html', 1, 'blink'))).toBe(false);
  });

  it('removes autoplay on the recorded line', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<main>\n<video autoplay src="a.mp4">\n</main>');
    const result = await new AutoplayAudioFixer(dir).fix(violation(file, 2));
    expect(result.applied).toBe(true);
    expect(await readFile(file, 'utf8')).toContain('<video src="a.mp4">');
  });

  it('human-flags when there is no autoplay to remove', async () => {
    const file = path.join(dir, 'index.html');
    await writeFile(file, '<video controls src="a.mp4">');
    const result = await new AutoplayAudioFixer(dir).fix(violation(file, 1));
    expect(result.bucket).toBe('human-flagged');
  });
});
