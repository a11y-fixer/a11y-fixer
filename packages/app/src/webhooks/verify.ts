// Verify the HMAC-SHA256 signature GitHub puts on every webhook delivery.
//
// GitHub signs the RAW request body with the webhook secret and sends the hex
// digest in `X-Hub-Signature-256: sha256=<hex>`. We recompute it and compare in
// constant time. The comparison MUST run over the raw bytes GitHub sent: parse
// the JSON only after this returns true, or a re-serialized body will not match.
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface VerifyWebhookSignatureOptions {
  /** The shared webhook secret (env `GITHUB_WEBHOOK_SECRET`). */
  secret: string;
  /** The raw, unparsed request body exactly as received. */
  payload: string | Buffer;
  /** The `X-Hub-Signature-256` header value, e.g. `sha256=abc123`. */
  signatureHeader: string | null | undefined;
}

/**
 * Returns true only when `signatureHeader` is a well-formed `sha256=<hex>`
 * digest that matches `payload` under `secret`. Returns false (never throws)
 * for a missing, malformed, or mismatched signature.
 */
export function verifyWebhookSignature({
  secret,
  payload,
  signatureHeader,
}: VerifyWebhookSignatureOptions): boolean {
  if (!secret || !signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
  const expectedBuf = Buffer.from(expected, 'utf8');
  const actualBuf = Buffer.from(signatureHeader, 'utf8');

  // timingSafeEqual throws on length mismatch; guard first so an attacker
  // cannot learn the expected length from a thrown error vs. a false return.
  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, actualBuf);
}
