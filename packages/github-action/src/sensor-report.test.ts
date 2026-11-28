import { describe, it, expect, vi } from 'vitest';
import { hashContent, EMPTY_TEXT_HASH, type SensorObservation } from '@a11y-fixer/core';
import {
  buildSensorReport,
  sensorConclusion,
  postSensorCheckRun,
  SENSOR_REPORT_SCHEMA,
  SENSOR_CHECK_RUN_NAME,
} from './sensor-report.js';
import type { OctokitLike } from './report.js';

function obs(flowName: string, overrides: Partial<SensorObservation['facts']> = {}): SensorObservation {
  return {
    flowName,
    facts: {
      fromLabel: '/',
      toLabel: flowName,
      settled: true,
      liveRegionsBefore: [],
      liveRegionsAfter: [],
      focusMovedIntoNewContent: false,
      ...overrides,
    },
  };
}

const announced = (flowName: string): SensorObservation =>
  obs(flowName, {
    liveRegionsBefore: [{ role: 'polite', nameHash: null, textHash: EMPTY_TEXT_HASH, childCount: 0, ariaBusy: false }],
    liveRegionsAfter: [{ role: 'polite', nameHash: null, textHash: hashContent('Loaded'), childCount: 1, ariaBusy: false }],
  });

describe('sensorConclusion — local CI signal', () => {
  it('failure when any transition is silent', () => {
    expect(sensorConclusion([announced('/a'), obs('/b')])).toBe('failure');
  });
  it('success when all announced', () => {
    expect(sensorConclusion([announced('/a')])).toBe('success');
  });
  it('neutral when nothing conclusive', () => {
    expect(sensorConclusion([obs('/x', { settled: false })])).toBe('neutral');
    expect(sensorConclusion([])).toBe('neutral');
  });
});

describe('buildSensorReport', () => {
  it('ships facts only under the versioned schema', () => {
    const report = buildSensorReport([obs('/b')], { sha: 'deadbeef', prNumber: 7 });
    expect(report.schema).toBe(SENSOR_REPORT_SCHEMA);
    expect(report.flows[0]).toMatchObject({ flowName: '/b', criterion: '4.1.3' });
    // No verdict field travels in the envelope — the backend judges from facts.
    expect(report.flows[0]).not.toHaveProperty('state');
  });
});

describe('postSensorCheckRun', () => {
  it('posts the sensor check with its own name, conclusion, and facts text', async () => {
    const create = vi.fn().mockResolvedValue({ data: { id: 1 } });
    const octokit = { rest: { checks: { create, update: vi.fn() }, issues: {} } } as unknown as OctokitLike;
    await postSensorCheckRun(octokit, { owner: 'o', repo: 'r', sha: 'sha1' }, [obs('/b')], { prNumber: 7 });
    expect(create).toHaveBeenCalledTimes(1);
    const arg = create.mock.calls[0][0];
    expect(arg.name).toBe(SENSOR_CHECK_RUN_NAME);
    expect(arg.conclusion).toBe('failure');
    expect(JSON.parse(arg.output.text).schema).toBe(SENSOR_REPORT_SCHEMA);
  });
});
