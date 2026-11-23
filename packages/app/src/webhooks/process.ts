// The framework-agnostic entry point for an inbound GitHub webhook delivery.
//
// A thin Next.js route (`app/api/webhooks/github/route.ts`, added when the app
// is provisioned on Vercel) reads the raw body + headers and calls this once.
// Keeping the logic here makes the whole pipeline — verify, idempotency, route —
// unit-testable without a running HTTP server.
import { verifyWebhookSignature } from './verify.js';
import { routeEvent } from './router.js';
import type { ConformanceConfig } from './handlers/check-run.js';
import type { Store } from '../db/store.js';

export type WebhookResult =
  | 'ok' // verified, routed (or acknowledged no-op)
  | 'duplicate' // replayed delivery id, skipped
  | 'invalid_signature' // HMAC check failed; caller should return 401
  | 'bad_request'; // missing delivery id / event name / unparseable body

export interface ProcessWebhookOptions {
  secret: string;
  /** Raw, unparsed request body exactly as received. */
  rawBody: string | Buffer;
  /** `X-GitHub-Event`. */
  eventName: string | null | undefined;
  /** `X-GitHub-Delivery` (idempotency key). */
  deliveryId: string | null | undefined;
  /** `X-Hub-Signature-256`. */
  signature: string | null | undefined;
  store: Store;
  /** When set, check_run ingestion also appends signed conformance claims. */
  conformance?: ConformanceConfig;
}

/**
 * Runs the full inbound pipeline and returns a coarse result the HTTP edge maps
 * to a status code. Signature is checked before the body is ever parsed.
 */
export async function processWebhook(opts: ProcessWebhookOptions): Promise<WebhookResult> {
  const { secret, rawBody, eventName, deliveryId, signature, store, conformance } = opts;

  if (!verifyWebhookSignature({ secret, payload: rawBody, signatureHeader: signature })) {
    return 'invalid_signature';
  }

  if (!eventName || !deliveryId) {
    return 'bad_request';
  }

  let payload: unknown;
  try {
    payload = JSON.parse(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'));
  } catch {
    return 'bad_request';
  }

  // Idempotency: record the delivery before handling. A replay returns false.
  const isNew = await store.recordEventOnce(deliveryId);
  if (!isNew) {
    return 'duplicate';
  }

  await routeEvent(eventName, payload, store, conformance);
  return 'ok';
}
