import { describe, expect, it } from 'vitest';
import { handleTelemetryRequest, parseTelemetry } from './telemetry-request.js';
import { MemoryStore } from '../db/memory-store.js';

function request(body: string): Request {
  return new Request('https://app.example.com/api/telemetry', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
  });
}

const fullPayload = {
  actionVersion: 'v1',
  mode: 'fix',
  licensed: true,
  publicRepo: false,
  violationsBefore: 5,
  violationsAfter: 1,
  fixesApplied: 4,
  fixesReverted: 0,
  regressions: 0,
  usedUrl: false,
  usedHtml: true,
  usedMarkdown: false,
  usedComponents: false,
  platform: 'linux',
  arch: 'x64',
  nodeVersion: 'v20.11.0',
};

describe('parseTelemetry', () => {
  it('normalizes a well-formed payload', () => {
    expect(parseTelemetry(fullPayload)).toEqual(fullPayload);
  });

  it('rejects non-objects', () => {
    expect(parseTelemetry(null)).toBeNull();
    expect(parseTelemetry('x')).toBeNull();
    expect(parseTelemetry([1, 2])).toBeNull();
  });

  it('coerces an unknown mode and clamps/defaults counts and strings', () => {
    const e = parseTelemetry({ mode: 'bogus', violationsBefore: -3, fixesApplied: 1e9, platform: 123 });
    expect(e?.mode).toBe('unknown');
    expect(e?.violationsBefore).toBe(0); // negative floored to 0
    expect(e?.fixesApplied).toBe(1_000_000); // capped
    expect(e?.violationsAfter).toBe(0); // missing → 0
    expect(e?.licensed).toBe(false); // missing → false
    expect(e?.platform).toBe('unknown'); // wrong type → default
    expect(e?.actionVersion).toBeNull();
  });

  it('never trusts truthy-but-non-true values for booleans', () => {
    const e = parseTelemetry({ mode: 'check', licensed: 'yes', usedHtml: 1 });
    expect(e?.licensed).toBe(false);
    expect(e?.usedHtml).toBe(false);
  });

  it('truncates overlong strings', () => {
    const e = parseTelemetry({ mode: 'check', actionVersion: 'x'.repeat(200) });
    expect(e?.actionVersion?.length).toBe(64);
  });
});

describe('handleTelemetryRequest', () => {
  it('records a valid event and returns 202', async () => {
    const store = new MemoryStore();
    const res = await handleTelemetryRequest(request(JSON.stringify(fullPayload)), store);
    expect(res.status).toBe(202);
    expect(store.actionRuns).toHaveLength(1);
    expect(store.actionRuns[0]).toEqual(fullPayload);
  });

  it('returns 400 and records nothing on non-JSON', async () => {
    const store = new MemoryStore();
    const res = await handleTelemetryRequest(request('not json'), store);
    expect(res.status).toBe(400);
    expect(store.actionRuns).toHaveLength(0);
  });

  it('returns 400 on a JSON non-object body', async () => {
    const store = new MemoryStore();
    const res = await handleTelemetryRequest(request('42'), store);
    expect(res.status).toBe(400);
    expect(store.actionRuns).toHaveLength(0);
  });
});
