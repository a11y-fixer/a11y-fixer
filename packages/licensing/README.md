# @a11y-fixer/licensing

The **single source of truth** for a11y-fixer license minting. Every issuer goes
through `signLicense` here so no re-implementation can silently drift from what
the Action accepts.

> **Private, MIT.** Not published to npm — an internal workspace package.

## The one true minting path

Verification lives separately in
[`packages/github-action/src/license.ts`](../github-action/src/license.ts), kept
self-contained so it bundles into the Action with **no network call**. This
package owns only the **minting** side; the two agree by cross-test (the Action's
`license-signing.test.ts`). **Do not add a second mint implementation anywhere.**

Every issuer imports `signLicense` from here:

- `scripts/issue-license.mjs` — the manual/offline maintainer CLI.
- [`packages/app`](../app) — the GitHub App backend, which lazily mints a free-tier
  key for every installation on first dashboard load (and gates paid tiers here later).
- the external a11y-fixer.com trial-key site.

## API

```js
import { signLicense } from '@a11y-fixer/licensing';
// or: import { signLicense } from '@a11y-fixer/licensing/sign';

const { token, payload, iat, exp } = signLicense({
  sub: 'customer@example.com',     // license subject (customer id/email)
  days: 365,                        // validity window from `now`
  pem: process.env.LICENSE_SIGNING_KEY, // PKCS#8 Ed25519 private key (PEM)
  // now,                           // optional; defaults to new Date() (injectable for tests)
});
```

`token` is the compact `<payloadB64url>.<sigB64url>` string the Action verifies
offline against its embedded Ed25519 public key. `payload` is `{ v: 1, sub, exp }`
(`exp` in seconds since epoch).

## Authored dependency-free on purpose

`src/sign.mjs` is build-free ESM using only `node:` builtins, so it runs straight
off disk via a relative import — `scripts/test-action-bundle.sh` mints a key in
an isolated checkout that runs **no** `pnpm install` and **no** build. Keep it
that way: do not add imports that need installing or compiling.

## The signing key

`LICENSE_SIGNING_KEY` (PKCS#8 Ed25519 PEM) is the private signer. It is **never**
committed and is deliberately kept out of both the Action and
[`packages/app`](../app) — only the minting entry points above hold it.

## License

MIT
