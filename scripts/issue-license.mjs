#!/usr/bin/env node
// Mint an a11y-fixer license key.
//
// Usage:
//   node scripts/issue-license.mjs --sub "customer@example.com" --days 365 \
//     --key /path/to/a11y-fixer-LICENSE-SIGNING-KEY.pem
//
// Each issued key is also appended to a local ledger (default .licenses/ledger.jsonl)
// so you can answer "how many people have a license?". List it with:
//   node scripts/issue-license.mjs --list
//
// The private signing key is NEVER committed. Pass it with --key, or set
// LICENSE_SIGNING_KEY to its PEM contents (e.g. in a secrets manager).
//
// The emitted token is `<payload>.<signature>` (base64url), verified at runtime
// by packages/github-action/src/license.ts against the embedded public key.
//
// The signing algorithm now lives in @a11y-fixer/licensing (packages/licensing)
// so every issuer — this CLI, the GitHub App backend, and the trial-key site —
// shares one implementation that cannot drift. We import it by RELATIVE path
// (not the package name) on purpose: scripts/test-action-bundle.sh runs this
// file in an isolated checkout with no `pnpm install`, so there is no
// node_modules to resolve `@a11y-fixer/licensing` through. The relative path
// resolves straight off disk, and the module is dependency- and build-free.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { argv as processArgv } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { signLicense } from '../packages/licensing/src/sign.mjs';

// Re-exported so existing importers (packages/github-action's cross-tests) keep
// working through this path while the real implementation lives in the package.
export { signLicense };

function arg(name, fallback) {
  const i = processArgv.indexOf(`--${name}`);
  return i !== -1 && processArgv[i + 1] ? processArgv[i + 1] : fallback;
}

function flag(name) {
  return processArgv.includes(`--${name}`);
}

// --ledger <path> → LICENSE_LEDGER env → default. Contains customer identifiers
// (see .gitignore: .licenses/ is never committed).
function ledgerPath() {
  return arg('ledger') ?? process.env.LICENSE_LEDGER ?? '.licenses/ledger.jsonl';
}

function listLicenses() {
  const path = ledgerPath();
  if (!existsSync(path)) {
    console.log('0 licenses issued.');
    return;
  }

  const records = readFileSync(path, 'utf8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const nowSec = Math.floor(Date.now() / 1000);
  const subjects = new Set(records.map(r => r.sub));
  const active = records.filter(r => typeof r.exp === 'number' && r.exp > nowSec).length;
  const expired = records.length - active;

  console.log(`${records.length} license(s) issued to ${subjects.size} subject(s).`);
  console.log(`  active:  ${active}`);
  console.log(`  expired: ${expired}`);
  console.log(`  ledger:  ${path}`);
}

function main() {
  // --list: read the ledger and print issuance counts instead of minting.
  if (flag('list')) {
    listLicenses();
    return;
  }

  const sub = arg('sub');
  const days = Number(arg('days', '365'));
  const keyPath = arg('key');

  if (!sub) {
    console.error('Error: --sub <customer id/email> is required.');
    process.exit(1);
  }
  if (!Number.isFinite(days) || days <= 0) {
    console.error('Error: --days must be a positive number.');
    process.exit(1);
  }

  const pem = process.env.LICENSE_SIGNING_KEY ?? (keyPath && readFileSync(keyPath, 'utf8'));
  if (!pem) {
    console.error('Error: provide the signing key via --key <path> or LICENSE_SIGNING_KEY.');
    process.exit(1);
  }

  const { token, iat, exp } = signLicense({ sub, days, pem });

  // Append to the local issuance ledger unless suppressed with --no-ledger.
  if (!flag('no-ledger')) {
    const path = ledgerPath();
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${JSON.stringify({ sub, iat, exp, days })}\n`, 'utf8');
    console.error(`Recorded in ledger: ${path}`);
  }

  console.error(`Issued license for ${sub}, expires ${new Date(exp * 1000).toISOString().slice(0, 10)}:`);
  console.log(token);
}

// Run the CLI only when invoked directly (`node scripts/issue-license.mjs ...`),
// not when imported by a test. Compares the resolved entry path to this module.
if (processArgv[1] && pathToFileURL(fileURLToPath(import.meta.url)).href === pathToFileURL(processArgv[1]).href) {
  main();
}
