// Anonymous, opt-in Action usage telemetry sink. A one-call shell over the
// framework-free pipeline: validation + clamping + the single write live in
// `src/http/telemetry-request.ts` and are unit-tested there with a plain Request.
// Public and unauthenticated by design — the GitHub Action posts here with no
// browser Origin and no shared secret, so the handler treats the body as
// untrusted and never records identity.
import { handleTelemetryRequest } from '../../../src/http/telemetry-request.js';
import { serviceRoleStore } from '../../lib/supabase.js';

// Never cache; each run is a distinct event.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  return handleTelemetryRequest(req, serviceRoleStore());
}
