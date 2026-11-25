import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runtimeContext, sendTelemetry, type TelemetryEvent } from './telemetry.js';

const event: TelemetryEvent = {
  actionVersion: 'v1',
  mode: 'check',
  licensed: false,
  publicRepo: true,
  violationsBefore: 2,
  violationsAfter: 2,
  fixesApplied: 0,
  fixesReverted: 0,
  regressions: 0,
  usedUrl: false,
  usedHtml: false,
  usedMarkdown: false,
  usedComponents: false,
  platform: 'linux',
  arch: 'x64',
  nodeVersion: 'v20.0.0',
};

describe('runtimeContext', () => {
  it('reads non-identifying environment fields only', () => {
    const prev = process.env.GITHUB_ACTION_REF;
    process.env.GITHUB_ACTION_REF = 'v2';
    try {
      const ctx = runtimeContext();
      expect(ctx).toEqual({
        actionVersion: 'v2',
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      });
    } finally {
      if (prev === undefined) delete process.env.GITHUB_ACTION_REF;
      else process.env.GITHUB_ACTION_REF = prev;
    }
  });
});

describe('sendTelemetry', () => {
  beforeEach(() => {
    process.env.A11Y_TELEMETRY_URL = 'https://example.test/api/telemetry';
  });
  afterEach(() => {
    delete process.env.A11Y_TELEMETRY_URL;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('POSTs the event as JSON to the configured endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    await sendTelemetry(event);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.test/api/telemetry');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(event);
  });

  it('never throws when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
    await expect(sendTelemetry(event)).resolves.toBeUndefined();
  });
});
