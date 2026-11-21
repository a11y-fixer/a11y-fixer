// Proves LICENSE_SIGNING_KEY is the key pair of the public key the Action embeds.
//
// If it isn't, every free-tier key the control plane hands out will FAIL on
// private repos. Run this once before trusting the dashboard's "Get started"
// panel:
//
//   LICENSE_SIGNING_KEY="$(cat signing-key.pem)" node packages/app/scripts/check-signing-key.mjs
//   # or, pulling from Vercel:
//   LICENSE_SIGNING_KEY="$(vercel env pull ... )" node packages/app/scripts/check-signing-key.mjs
//
// Dependency-free: node builtins + the canonical signer by relative path. Exits
// non-zero on any mismatch so CI/operators can gate on it.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createPrivateKey, createPublicKey, verify as cryptoVerify } from 'node:crypto';
import { signLicense } from '../../licensing/src/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));

function fail(msg) {
  console.error(`❌  ${msg}`);
  process.exit(1);
}

const pem = process.env.LICENSE_SIGNING_KEY;
if (!pem) fail('LICENSE_SIGNING_KEY is not set in the environment.');

// 1. Extract the public key the Action verifies against.
const licenseTs = readFileSync(join(here, '../../github-action/src/license.ts'), 'utf8');
const embedded = licenseTs.match(/-----BEGIN PUBLIC KEY-----[\s\S]*?-----END PUBLIC KEY-----/);
if (!embedded) fail('Could not find LICENSE_PUBLIC_KEY_PEM in github-action/src/license.ts.');
const embeddedPub = normalize(embedded[0]);

// 2. Derive the public key from the signing key and compare.
let derivedPub;
try {
  derivedPub = normalize(createPublicKey(createPrivateKey(pem)).export({ type: 'spki', format: 'pem' }).toString());
} catch (err) {
  fail(`LICENSE_SIGNING_KEY is not a valid private key PEM: ${err.message}`);
}
if (derivedPub !== embeddedPub) {
  fail('LICENSE_SIGNING_KEY does NOT match the public key embedded in the Action. Issued keys would fail verification.');
}

// 3. Belt-and-suspenders: mint a token and verify its signature against the embedded key.
const { token } = signLicense({ sub: 'check-signing-key', days: 1, pem });
const [payloadB64, sigB64] = token.split('.');
const sigOk = cryptoVerify(
  null,
  Buffer.from(payloadB64, 'ascii'),
  createPublicKey(embedded[0]),
  Buffer.from(sigB64, 'base64url'),
);
if (!sigOk) fail('A freshly minted token did not verify against the embedded public key.');

console.log('✅  LICENSE_SIGNING_KEY matches the Action’s embedded public key. Minted keys will verify.');

function normalize(pemStr) {
  return pemStr.replace(/\s+/g, '');
}
