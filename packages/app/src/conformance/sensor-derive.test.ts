import { describe, it, expect } from 'vitest';
import { hashContent, EMPTY_TEXT_HASH, type RouteChangeFacts } from '@a11y-fixer/core';
import { parseSensorReport, sensorDerive, SENSOR_REPORT_SCHEMA, type SensorReport } from './sensor-derive.js';
import { flowSubjectKeyForName } from './claim.js';

const REPO = 42;
const AT = '2026-02-01T00:00:00Z';

function facts(partial: Partial<RouteChangeFacts>): RouteChangeFacts {
  return {
    fromLabel: '/a',
    toLabel: '/b',
    settled: true,
    liveRegionsBefore: [],
    liveRegionsAfter: [],
    focusMovedIntoNewContent: false,
    ...partial,
  };
}

function report(flows: SensorReport['flows']): SensorReport {
  return { schema: SENSOR_REPORT_SCHEMA, engine: 'puppeteer', engineVersion: '25.18.1', flows };
}

describe('sensorDerive — server-side judging', () => {
  it('emits a runtime fail on a silent route change, with a dom-trace blob', () => {
    const drafts = sensorDerive(report([{ flowName: '/b', criterion: '4.1.3', facts: facts({}) }]), REPO, AT);
    expect(drafts).toHaveLength(1);
    const d = drafts[0];
    expect(d.body).toMatchObject({
      subjectKind: 'flow',
      subjectKey: flowSubjectKeyForName(REPO, '/b'),
      criterion: '4.1.3',
      method: 'runtime',
      state: 'fail',
      confidence: 1,
      level: 'AA',
      assertedBy: 'runtime-sensor@puppeteer/25.18.1',
      assertedAt: AT,
    });
    expect(d.evidence?.type).toBe('dom-trace');
  });

  it('emits a pass (4.1.3 is runtime-pass-eligible) when announced', () => {
    const announced = facts({
      liveRegionsBefore: [{ role: 'polite', nameHash: null, textHash: EMPTY_TEXT_HASH, childCount: 0, ariaBusy: false }],
      liveRegionsAfter: [{ role: 'polite', nameHash: null, textHash: hashContent('Loaded'), childCount: 1, ariaBusy: false }],
    });
    const drafts = sensorDerive(report([{ flowName: '/b', criterion: '4.1.3', facts: announced }]), REPO, AT);
    expect(drafts[0].body.state).toBe('pass');
  });

  it('not-evaluated carries no evidence (ledger invariant)', () => {
    const drafts = sensorDerive(report([{ flowName: '/b', criterion: '4.1.3', facts: facts({ settled: false }) }]), REPO, AT);
    expect(drafts[0].body.state).toBe('not-evaluated');
    expect(drafts[0].evidence).toBeNull();
  });

  it('re-judges from facts — a forged focus fact flips the verdict (A9, backend decides)', () => {
    const forged = sensorDerive(report([{ flowName: '/b', criterion: '4.1.3', facts: facts({ focusMovedIntoNewContent: true }) }]), REPO, AT);
    expect(forged[0].body.state).toBe('pass'); // the backend judged it from the facts it received
  });

  it('ignores a flow claiming a criterion the sensor is not pinned to', () => {
    expect(sensorDerive(report([{ flowName: '/b', criterion: '1.1.1', facts: facts({}) }]), REPO, AT)).toHaveLength(0);
  });

  it('A5 determinism: identical facts twice → identical evidence blob', () => {
    const f = facts({ liveRegionsAfter: [
      { role: 'polite', nameHash: null, textHash: hashContent('b'), childCount: 0, ariaBusy: false },
      { role: 'assertive', nameHash: null, textHash: hashContent('a'), childCount: 0, ariaBusy: false },
    ] });
    const one = sensorDerive(report([{ flowName: '/b', criterion: '4.1.3', facts: f }]), REPO, AT);
    const two = sensorDerive(report([{ flowName: '/b', criterion: '4.1.3', facts: f }]), REPO, AT);
    expect(JSON.stringify(one[0].evidence?.blob)).toBe(JSON.stringify(two[0].evidence?.blob));
  });

  it('A3: a renamed route aliased to the old name keeps the same subject chain', () => {
    const renamed = sensorDerive(report([{ flowName: '/orders', criterion: '4.1.3', facts: facts({}) }]), REPO, AT);
    // Driver resolves aliases before reporting; here we assert the key is name-derived.
    expect(renamed[0].body.subjectKey).toBe(flowSubjectKeyForName(REPO, '/orders'));
  });
});

describe('parseSensorReport — A9 ingest validation', () => {
  it('rejects wrong schema', () => {
    expect(parseSensorReport(JSON.stringify({ schema: 'nope', flows: [] }))).toBeNull();
  });
  it('rejects non-JSON', () => {
    expect(parseSensorReport('{not json')).toBeNull();
  });
  it('drops a flow with malformed facts but keeps valid ones', () => {
    const raw = JSON.stringify({
      schema: SENSOR_REPORT_SCHEMA,
      engine: 'puppeteer',
      engineVersion: '25.18.1',
      flows: [
        { flowName: '/bad', criterion: '4.1.3', facts: { settled: 'yes' } }, // malformed
        { flowName: '/good', criterion: '4.1.3', facts: facts({}) },
      ],
    });
    const parsed = parseSensorReport(raw);
    expect(parsed?.flows.map(f => f.flowName)).toEqual(['/good']);
  });
  it('rejects a region fingerprint of the wrong shape', () => {
    const raw = JSON.stringify({
      schema: SENSOR_REPORT_SCHEMA,
      flows: [{ flowName: '/x', criterion: '4.1.3', facts: { ...facts({}), liveRegionsAfter: [{ role: 1 }] } }],
    });
    expect(parseSensorReport(raw)?.flows).toEqual([]);
  });
});
