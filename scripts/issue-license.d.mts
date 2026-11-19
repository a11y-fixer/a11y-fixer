// Type declarations for the license-signing CLI's re-exported signing path,
// consumed by packages/github-action/src/license-signing.test.ts. The real
// implementation and its types live in @a11y-fixer/licensing; this file just
// re-exports them so importers of the script keep their types.

export type {
  LicensePayload,
  SignLicenseOptions,
  SignLicenseResult,
} from '../packages/licensing/src/sign.d.mts';

export { signLicense } from '../packages/licensing/src/sign.d.mts';
