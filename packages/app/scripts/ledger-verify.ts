// `ledger:verify` — walk the Conformance Ledger and re-check every signed chain.
//
// This is the runnable form of the Phase 1 guarantee: tamper a claim (flip a
// state, swap a signature, drop evidence) and the chain's signature + link +
// evidence-hash checks catch it. Exits NON-ZERO on any failure so CI or an
// operator can gate on it.
//
//   # verify the whole ledger against the configured keyring
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   CONFORMANCE_KEY_ID=conformance-2026 CONFORMANCE_PUBLIC_KEY="$(cat pub.pem)" \
//   pnpm --filter @a11y-fixer/app ledger:verify
//
//   # one subject only
//   pnpm --filter @a11y-fixer/app ledger:verify -- --subject "page:42:src/index.html"
//
// Verification needs only the PUBLIC keyring (CONFORMANCE_PUBLIC_KEY / _KEYRING),
// never the private signing key.
import { createClient } from '@supabase/supabase-js';
import { SupabaseStore, type SupabaseLike } from '../src/db/supabase-store.js';
import { conformanceKeyringFromEnv } from '../src/conformance/keyring.js';
import { buildLedgerReadModel, formatLedgerReport } from '../src/conformance/ledger-verify.js';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`❌  ${name} is not set.`);
    process.exit(2);
  }
  return v;
}

function subjectArg(argv: string[]): string | undefined {
  const i = argv.indexOf('--subject');
  return i >= 0 ? argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const url = requiredEnv('SUPABASE_URL');
  const serviceRole = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const keyring = conformanceKeyringFromEnv();
  if (Object.keys(keyring).length === 0) {
    console.error(
      '❌  No conformance public keys configured (set CONFORMANCE_PUBLIC_KEY + CONFORMANCE_KEY_ID, or CONFORMANCE_KEYRING). Every chain would fail closed.',
    );
    process.exit(2);
  }

  const client = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const store = new SupabaseStore(client as unknown as SupabaseLike);

  const subject = subjectArg(process.argv.slice(2));
  const model = await buildLedgerReadModel(store, keyring, subject ? [subject] : undefined);
  const report = formatLedgerReport(model);

  console.log(report.text);
  process.exit(report.ok ? 0 : 1);
}

main().catch(err => {
  console.error(`❌  ledger:verify crashed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(2);
});
