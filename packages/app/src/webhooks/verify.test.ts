import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyWebhookSignature } from './verify.js';

const SECRET = 'test-webhook-secret';
const BODY = JSON.stringify({ action: 'created', hello: 'world' });

function sign(secret: string, body: string): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

describe('verifyWebhookSignature', () => {
  it('accepts a correct signature over the raw body', () => {
    expect(
      verifyWebhookSignature({ secret: SECRET, payload: BODY, signatureHeader: sign(SECRET, BODY) }),
    ).toBe(true);
  });

  it('accepts a Buffer payload', () => {
    expect(
      verifyWebhookSignature({
        secret: SECRET,
        payload: Buffer.from(BODY, 'utf8'),
        signatureHeader: sign(SECRET, BODY),
      }),
    ).toBe(true);
  });

  it('rejects a signature made with the wrong secret', () => {
    expect(
      verifyWebhookSignature({ secret: SECRET, payload: BODY, signatureHeader: sign('wrong', BODY) }),
    ).toBe(false);
  });

  it('rejects when the body was tampered with', () => {
    expect(
      verifyWebhookSignature({
        secret: SECRET,
        payload: `${BODY} `,
        signatureHeader: sign(SECRET, BODY),
      }),
    ).toBe(false);
  });

  it('rejects a missing signature header', () => {
    expect(verifyWebhookSignature({ secret: SECRET, payload: BODY, signatureHeader: null })).toBe(false);
    expect(verifyWebhookSignature({ secret: SECRET, payload: BODY, signatureHeader: undefined })).toBe(false);
  });

  it('rejects a header without the sha256= prefix', () => {
    const bare = createHmac('sha256', SECRET).update(BODY).digest('hex');
    expect(verifyWebhookSignature({ secret: SECRET, payload: BODY, signatureHeader: bare })).toBe(false);
  });

  it('rejects a differently-sized digest without throwing', () => {
    expect(verifyWebhookSignature({ secret: SECRET, payload: BODY, signatureHeader: 'sha256=abc' })).toBe(false);
  });

  it('rejects when the secret is empty', () => {
    expect(verifyWebhookSignature({ secret: '', payload: BODY, signatureHeader: sign('', BODY) })).toBe(false);
  });
});
