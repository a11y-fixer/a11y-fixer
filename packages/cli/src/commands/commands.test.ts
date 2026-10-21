import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { scanCommand } from './scan.js';
import { fixCommand } from './fix.js';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
// commands -> src -> cli -> packages -> repo root
const fixturesDir = path.resolve(here, '../../../../tests/fixtures');
const brokenFixture = path.join(fixturesDir, 'BrokenComponent.tsx');
const cliBin = path.resolve(here, '../../dist/index.js');

/** Captures console.log/error written while `fn` runs. */
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

const tmpDirs: string[] = [];
async function makeTmpDir(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'a11y-cli-'));
  tmpDirs.push(dir);
  return dir;
}

let savedKey: string | undefined;

beforeEach(() => {
  // These tests assert hermetic, offline behavior: the AI fixers must degrade
  // to human-flags, never call the network.
  savedKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
});

afterEach(async () => {
  if (savedKey !== undefined) process.env.ANTHROPIC_API_KEY = savedKey;
  await Promise.all(tmpDirs.splice(0).map(d => rm(d, { recursive: true, force: true })));
});

describe('scan command', () => {
  it('reports the static jsx-a11y violation in the broken fixture', async () => {
    const out = await captureOutput(() =>
      scanCommand().parseAsync([fixturesDir], { from: 'user' }),
    );
    expect(out).toMatch(/WCAG 1\.1\.1/);
    expect(out).toContain('BrokenComponent.tsx');
  });

  it('reports no violations for a directory with only clean source', async () => {
    const dir = await makeTmpDir();
    await cp(path.join(fixturesDir, 'CleanComponent.tsx'), path.join(dir, 'CleanComponent.tsx'));
    const out = await captureOutput(() => scanCommand().parseAsync([dir], { from: 'user' }));
    expect(out).toContain('No accessibility violations found.');
  });

  it('does not crash on an empty directory (no NoFilesFoundError)', async () => {
    const dir = await makeTmpDir();
    const out = await captureOutput(() => scanCommand().parseAsync([dir], { from: 'user' }));
    expect(out).toContain('No accessibility violations found.');
  });
});

describe('fix command', () => {
  it('lists fixes without mutating source in --dry-run', async () => {
    const dir = await makeTmpDir();
    await cp(brokenFixture, path.join(dir, 'BrokenComponent.tsx'));
    const original = await readFile(brokenFixture, 'utf8');

    const out = await captureOutput(() =>
      fixCommand().parseAsync([dir, '--dry-run'], { from: 'user' }),
    );

    expect(out).toContain('[DRY RUN]');
    expect(out).toMatch(/WCAG 1\.1\.1/);
    // Dry run must leave the file untouched.
    expect(await readFile(path.join(dir, 'BrokenComponent.tsx'), 'utf8')).toBe(original);
  });

  it('human-flags the AI-assisted fix when no API key is set and opens no PR', async () => {
    const dir = await makeTmpDir();
    await cp(brokenFixture, path.join(dir, 'BrokenComponent.tsx'));
    const original = await readFile(brokenFixture, 'utf8');

    const out = await captureOutput(() => fixCommand().parseAsync([dir], { from: 'user' }));

    expect(out).toContain('Applied: 0, Human review needed: 1');
    expect(out).toContain('ANTHROPIC_API_KEY not set');
    // Without --owner/--repo no PR is attempted, and nothing was applied.
    expect(out).not.toContain('Creating PR');
    expect(await readFile(path.join(dir, 'BrokenComponent.tsx'), 'utf8')).toBe(original);
  });
});

// `check` calls process.exit(), so its exit-code contract is validated against
// the built binary in a subprocess rather than in-process. Skipped when the
// package has not been built yet.
describe.skipIf(!existsSync(cliBin))('check command (built binary)', () => {
  it('exits 1 when violations are found', async () => {
    await expect(
      execFileAsync('node', [cliBin, 'check', fixturesDir], {
        env: { ...process.env, ANTHROPIC_API_KEY: '' },
      }),
    ).rejects.toMatchObject({ code: 1 });
  });

  it('exits 0 for a clean (empty) directory', async () => {
    const dir = await makeTmpDir();
    const { stdout } = await execFileAsync('node', [cliBin, 'check', dir]);
    expect(stdout).toContain('No accessibility violations found.');
  });
});
