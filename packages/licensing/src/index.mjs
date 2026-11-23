// @a11y-fixer/licensing — the single source of truth for license minting.
//
// Verification lives in packages/github-action/src/license.ts, kept
// self-contained so it bundles into the Action with no network call. This
// package owns the minting side; the two agree by cross-test (see the Action's
// license-signing.test.ts). Do NOT add a second mint implementation anywhere.

export { signLicense, signPayload, verifyPayload } from './sign.mjs';
