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

  it('routes --html to the static HTML runner (no browser for an empty dir)', async () => {
    // An empty dir has no .html files, so the HtmlFileRunner never launches a
    // browser — this exercises the flag wiring hermetically.
    const dir = await makeTmpDir();
    const out = await captureOutput(() =>
      scanCommand().parseAsync([dir, '--html'], { from: 'user' }),
    );
    expect(out).toContain('(static HTML)');
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

  it('applies the deterministic alt-text fix, human-flags the rest, and opens no PR', async () => {
    const dir = await makeTmpDir();
    const target = path.join(dir, 'BrokenComponent.tsx');
    await cp(brokenFixture, target);

    const out = await captureOutput(() => fixCommand().parseAsync([dir], { from: 'user' }));

    // The free CLI ships deterministic fixers only. Of the four detected types,
    // the missing <img> alt (WCAG 1.1.1) is deterministically fixable; the three
    // a11y-custom rules (label/link text) are detection-only — you can't invent a
    // label — so they fall through to the human-review path.
    expect(out).toMatch(/Applied: 1, Human review needed: 3/);
    expect(out).toMatch(/✓ WCAG 1\.1\.1/);
    expect(out).toMatch(/⚠ WCAG 4\.1\.2/);
    expect(out).toMatch(/⚠ WCAG 1\.3\.1/);
    expect(out).toMatch(/⚠ WCAG 2\.4\.4/);
    // Without --owner/--repo no PR is attempted.
    expect(out).not.toContain('Creating PR');
    // The alt fix was written to the source file.
    expect(await readFile(target, 'utf8')).toContain('alt="logo"');
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
