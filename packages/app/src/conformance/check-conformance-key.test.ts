// Integration test for scripts/check-conformance-key.mjs — the sign->verify
// round-trip gate operators run before trusting that published audits will read
// "warranted". Spawns the real script so the exact exit codes CI/ops gate on are
// covered.
import { describe, it, expect } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '../../scripts/check-conformance-key.mjs');

function keypair() {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  return {
    priv: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
    pub: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  };
}

/** Runs the script with a clean, controlled env. Returns exit code + output. */
function run(env: Record<string, string>): { code: number; out: string } {
  // Start from a minimal env so an ambient CONFORMANCE_* can't leak in.
  const base: NodeJS.ProcessEnv = { PATH: process.env.PATH };
  try {
    const out = execFileSync('node', [SCRIPT], {
      env: { ...base, ...env },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, out };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, out: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

describe('check-conformance-key.mjs', () => {
  it('passes for a matched key pair (single-key form)', () => {
    const { priv, pub } = keypair();
    const r = run({
      CONFORMANCE_SIGNING_KEY: priv,
      CONFORMANCE_PUBLIC_KEY: pub,
      CONFORMANCE_KEY_ID: 'conformance-2026',
    });
    expect(r.code).toBe(0);
    expect(r.out).toContain('✅');
    expect(r.out).toContain('conformance-2026');
  });

  it('passes for a matched key pair via the CONFORMANCE_KEYRING form', () => {
    const { priv, pub } = keypair();
    const r = run({
      CONFORMANCE_SIGNING_KEY: priv,
      CONFORMANCE_KEY_ID: 'conformance-2026',
      CONFORMANCE_KEYRING: JSON.stringify({ 'conformance-2026': pub }),
    });
    expect(r.code).toBe(0);
    expect(r.out).toContain('✅');
  });

  it('fails when the pinned public key does not match the signing key', () => {
    const { priv } = keypair();
    const { pub: wrongPub } = keypair();
    const r = run({
      CONFORMANCE_SIGNING_KEY: priv,
      CONFORMANCE_PUBLIC_KEY: wrongPub,
      CONFORMANCE_KEY_ID: 'conformance-2026',
    });
    expect(r.code).toBe(1);
    expect(r.out).toContain('does NOT match');
  });

  it('fails when the keyring has no entry for the key id', () => {
    const { priv, pub } = keypair();
    const r = run({
      CONFORMANCE_SIGNING_KEY: priv,
      CONFORMANCE_KEY_ID: 'conformance-2026',
      CONFORMANCE_KEYRING: JSON.stringify({ 'conformance-2025': pub }),
    });
    expect(r.code).toBe(1);
    expect(r.out).toContain('no entry');
  });

  it('fails when CONFORMANCE_SIGNING_KEY is unset', () => {
    const r = run({ CONFORMANCE_KEY_ID: 'conformance-2026' });
    expect(r.code).toBe(1);
    expect(r.out).toContain('CONFORMANCE_SIGNING_KEY is not set');
  });

  it('fails when CONFORMANCE_KEY_ID is unset', () => {
    const { priv } = keypair();
    const r = run({ CONFORMANCE_SIGNING_KEY: priv });
    expect(r.code).toBe(1);
    expect(r.out).toContain('CONFORMANCE_KEY_ID is not set');
  });

  it('fails when the private key PEM is malformed', () => {
    const { pub } = keypair();
    const r = run({
      CONFORMANCE_SIGNING_KEY: 'not-a-pem',
      CONFORMANCE_PUBLIC_KEY: pub,
      CONFORMANCE_KEY_ID: 'conformance-2026',
    });
    expect(r.code).toBe(1);
    expect(r.out).toContain('not a valid Ed25519 private key');
  });
});
