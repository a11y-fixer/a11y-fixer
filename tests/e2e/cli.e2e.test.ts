import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

const ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const CLI_BIN = path.join(ROOT, 'packages/cli/dist/index.js');
const FIXTURES = path.join(ROOT, 'tests/fixtures');

function runCli(args: string[], cwd = ROOT) {
  return spawnSync('node', [CLI_BIN, ...args], { cwd, encoding: 'utf8' });
}

beforeAll(() => {
  const result = spawnSync('pnpm', ['build'], { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) {
    throw new Error(`Build failed:\n${result.stdout}\n${result.stderr}`);
  }
}, 120_000);

describe('a11y-fixer CLI e2e', () => {
  describe('scan', () => {
    it('reports violations in broken fixtures', () => {
      const r = runCli(['scan', FIXTURES]);
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/Found \d+ violation/);
      expect(r.stdout).toMatch(/WCAG/);
      expect(r.stdout).toMatch(/BrokenComponent\.tsx/);
    });

    it('reports clean when no violations exist', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-scan-clean-'));
      try {
        fs.copyFileSync(path.join(FIXTURES, 'CleanComponent.tsx'), path.join(tmpDir, 'CleanComponent.tsx'));
        const r = runCli(['scan', tmpDir]);
        expect(r.status).toBe(0);
        expect(r.stdout).toContain('No accessibility violations found');
      } finally {
        fs.rmSync(tmpDir, { recursive: true });
      }
    });
  });

  describe('check', () => {
    it('exits 1 and prints violations when broken files exist', () => {
      const r = runCli(['check', FIXTURES]);
      expect(r.status).toBe(1);
      expect(r.stderr).toMatch(/Found \d+ accessibility violation/);
    });

    it('exits 0 and prints success when directory is clean', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-check-clean-'));
      try {
        fs.copyFileSync(path.join(FIXTURES, 'CleanComponent.tsx'), path.join(tmpDir, 'CleanComponent.tsx'));
        const r = runCli(['check', tmpDir]);
        expect(r.status).toBe(0);
        expect(r.stdout).toContain('No accessibility violations found');
      } finally {
        fs.rmSync(tmpDir, { recursive: true });
      }
    });

    it('exits 0 for an empty directory', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-check-empty-'));
      try {
        const r = runCli(['check', tmpDir]);
        expect(r.status).toBe(0);
      } finally {
        fs.rmSync(tmpDir, { recursive: true });
      }
    });
  });

  describe('fix', () => {
    it('--dry-run prints proposed changes without modifying files', () => {
      const brokenTsxBefore = fs.readFileSync(path.join(FIXTURES, 'BrokenComponent.tsx'), 'utf8');
      const r = runCli(['fix', '--dry-run', FIXTURES]);
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/\[DRY RUN\]/);
      // Files must be unchanged
      const brokenTsxAfter = fs.readFileSync(path.join(FIXTURES, 'BrokenComponent.tsx'), 'utf8');
      expect(brokenTsxAfter).toBe(brokenTsxBefore);
    });

    it('runs the full fix pipeline on a copy of the fixtures', () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-fix-'));
      try {
        fs.cpSync(FIXTURES, tmpDir, { recursive: true });
        const r = runCli(['fix', tmpDir]);
        expect(r.status).toBe(0);
        // Scan + apply pipeline ran and produced the summary line
        expect(r.stdout).toMatch(/Found \d+ violation type\(s\)/);
        expect(r.stdout).toMatch(/Applied: \d+, Human review needed: \d+/);
      } finally {
        fs.rmSync(tmpDir, { recursive: true });
      }
    });
  });
});
