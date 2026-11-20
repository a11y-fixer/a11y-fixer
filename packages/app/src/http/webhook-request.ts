// The real, framework-free logic behind the Next.js webhook route.
//
// `app/api/webhooks/github/route.ts` is a one-line shell that builds the
// production Store and calls `handleWebhookRequest(req, store, secret)`. Keeping
// everything here means the whole HTTP edge is unit-testable with a plain Web
// `Request` and the in-memory Store — no Next.js runtime, no network.
import { processWebhook, type WebhookResult } from '../webhooks/process.js';
import type { Store } from '../db/store.js';

/**
 * Map the pipeline's coarse result to the HTTP status GitHub sees. GitHub retries
 * on 5xx and on non-2xx for a while; we answer 2xx for anything we handled
 * (including a duplicate replay) so it stops, 401 for a bad signature, 400 for a
 * malformed delivery.
 */
export function resultToStatus(result: WebhookResult): number {
  switch (result) {
    case 'ok':
      return 202;
    case 'duplicate':
      return 200;
    case 'invalid_signature':
      return 401;
    case 'bad_request':
      return 400;
  }
}

/**
 * Read a GitHub webhook `Request`, run the full pipeline once, and return the
 * `Response` to send back. The raw body is read with `req.text()` BEFORE any
 * parsing so the HMAC is checked against the exact bytes GitHub signed.
 */
export async function handleWebhookRequest(req: Request, store: Store, secret: string): Promise<Response> {
  const rawBody = await req.text();
  const result = await processWebhook({
    secret,
    rawBody,
    eventName: req.headers.get('x-github-event'),
    deliveryId: req.headers.get('x-github-delivery'),
    signature: req.headers.get('x-hub-signature-256'),
    store,
  });
  return new Response(result, { status: resultToStatus(result) });
}
