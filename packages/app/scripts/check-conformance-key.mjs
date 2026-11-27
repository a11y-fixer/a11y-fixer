// Proves the CONFORMANCE signing key is internally consistent and will produce
// claims that verify against the pinned public keyring.
//
// Unlike the license key (whose public half is embedded in the Action, see
// scripts/check-signing-key.mjs), the conformance public key is NOT committed
// anywhere — it lives only in the CONFORMANCE_PUBLIC_KEY / CONFORMANCE_KEYRING
// env vars. So this script can't match against a file; instead it:
//   1. derives the public key from CONFORMANCE_SIGNING_KEY,
//   2. if a public key is pinned in the env, asserts it matches the derived one
//      (otherwise every signed claim would fail closed with 'unknown-key'),
//   3. does a sign -> verify round-trip and a tamper-detection check.
//
// Run before trusting that published audits will read "warranted":
//   CONFORMANCE_SIGNING_KEY="$(cat conformance-key.pem)" \
//   CONFORMANCE_PUBLIC_KEY="$(cat conformance-pub.pem)" \
//   CONFORMANCE_KEY_ID=conformance-2026 \
//   node packages/app/scripts/check-conformance-key.mjs
//   # or, after `vercel env pull`, source the pulled values first.
//
// Dependency-free: node builtins + the canonical signer by relative path. Exits
// non-zero on any mismatch so CI/operators can gate on it.
import { createPrivateKey, createPublicKey } from 'node:crypto';
import { signPayload, verifyPayload } from '../../licensing/src/index.mjs';

function fail(msg) {
  console.error(`❌  ${msg}`);
  process.exit(1);
}

function normalize(pemStr) {
  return pemStr.replace(/\s+/g, '');
}

const privPem = process.env.CONFORMANCE_SIGNING_KEY;
if (!privPem) fail('CONFORMANCE_SIGNING_KEY is not set in the environment.');

const keyId = process.env.CONFORMANCE_KEY_ID;
if (!keyId) fail('CONFORMANCE_KEY_ID is not set (e.g. conformance-2026).');

// 1. Derive the public key from the private signing key.
let derivedPub;
try {
  derivedPub = createPublicKey(createPrivateKey(privPem))
    .export({ type: 'spki', format: 'pem' })
    .toString();
} catch (err) {
  fail(`CONFORMANCE_SIGNING_KEY is not a valid Ed25519 private key PEM: ${err.message}`);
}

// 2. If a public key is pinned in the env (single-key or keyring form), it must
//    match the derived one — otherwise claims verify against no pinned key.
const keyringRaw = process.env.CONFORMANCE_KEYRING;
let pinnedPub = process.env.CONFORMANCE_PUBLIC_KEY;
if (keyringRaw) {
  let ring;
  try {
    ring = JSON.parse(keyringRaw);
  } catch (err) {
    fail(`CONFORMANCE_KEYRING is not valid JSON: ${err.message}`);
  }
  const fromRing = ring?.[keyId];
  if (!fromRing) {
    fail(`CONFORMANCE_KEYRING has no entry for CONFORMANCE_KEY_ID "${keyId}". New claims would fail closed with 'unknown-key'.`);
  }
  if (pinnedPub && normalize(pinnedPub) !== normalize(fromRing)) {
    fail(`CONFORMANCE_PUBLIC_KEY and the CONFORMANCE_KEYRING entry for "${keyId}" disagree.`);
  }
  pinnedPub = fromRing;
}

if (pinnedPub) {
  if (normalize(pinnedPub) !== normalize(derivedPub)) {
    fail(`The pinned public key for "${keyId}" does NOT match CONFORMANCE_SIGNING_KEY. Signed claims would fail verification (unknown/invalid key).`);
  }
} else {
  console.warn(
    '⚠️   No CONFORMANCE_PUBLIC_KEY or CONFORMANCE_KEYRING set — cannot confirm the signed claims will verify. Set the public half before go-live.',
  );
}

// 3. Sign -> verify round-trip against the key the ledger will actually verify
//    with (the pinned public key if present, else the derived one), plus a
//    tamper-detection check.
const verifyWith = pinnedPub ?? derivedPub;
const message = Buffer.from(`conformance-key-check:${keyId}:${Date.now()}`, 'utf8');
const sig = signPayload(message, privPem);
if (!verifyPayload(message, sig, verifyWith)) {
  fail('A freshly signed payload did not verify against the public key. The pair is broken.');
}
const tampered = Buffer.from(message);
tampered[0] ^= 0xff;
if (verifyPayload(tampered, sig, verifyWith)) {
  fail('A tampered payload verified — signature check is not actually running.');
}

console.log(`✅  CONFORMANCE_SIGNING_KEY is valid and consistent with key id "${keyId}". Signed claims will verify.`);
