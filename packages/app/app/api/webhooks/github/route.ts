// GitHub webhook endpoint. A one-call shell over the framework-free pipeline:
// all verify/idempotency/route logic + status mapping lives in
// `src/http/webhook-request.ts` and is unit-tested there with a plain Request.
import { handleWebhookRequest } from '../../../../src/http/webhook-request.js';
import { conformanceSigningConfigFromEnv } from '../../../../src/conformance/keyring.js';
import { serviceRoleStore } from '../../../lib/supabase.js';

// The raw body must be read verbatim for HMAC verification; never cache.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function webhookSecret(): string {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing required env var: GITHUB_WEBHOOK_SECRET');
  return secret;
}

export async function POST(req: Request): Promise<Response> {
  // Optional: when CONFORMANCE_SIGNING_KEY + CONFORMANCE_KEY_ID are set, check_run
  // ingestion also appends signed conformance-ledger claims. Unset → ledger off.
  return handleWebhookRequest(req, serviceRoleStore(), webhookSecret(), conformanceSigningConfigFromEnv());
}
