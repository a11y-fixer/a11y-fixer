// The runtime-sensor contract for `check_run.output.text`, and the poster that
// publishes it. The driver ships FACTS ONLY — it embeds raw route-change
// observations and NO signed verdict. The conclusion it sets on the check is a
// LOCAL, non-authoritative judgement (same pure `judgeObservation` the backend
// re-runs) so a silent route change reds the PR the moment it ships, while the
// signed ledger claim is minted server-side from the same facts.
//
// Keep this shape in sync with the parser in
// `packages/app/src/conformance/sensor-derive.ts`.
import { judgeObservation, type SensorObservation } from '@a11y-fixer/core';
import type { OctokitLike } from './report.js';

/** The sensor contract schema; must match `SENSOR_REPORT_SCHEMA` in the app. */
export const SENSOR_REPORT_SCHEMA = 'a11y-fixer.sensor/1';

/** The Check Run name the sensor posts; must match the app's handler. */
export const SENSOR_CHECK_RUN_NAME = 'a11y-fixer-runtime';

/** The browser engine the sensor drives. Provenance for the `runtime` claims. */
export const SENSOR_ENGINE = 'puppeteer';
/** KEEP IN SYNC with the `puppeteer-core` dependency version that actually runs. */
export const SENSOR_ENGINE_VERSION = '25.18.1';

/** The criterion this sensor observes. */
export const SENSOR_CRITERION = '4.1.3';

export interface SensorReport {
  schema: typeof SENSOR_REPORT_SCHEMA;
  sha: string;
  prNumber: number | null;
  engine: string;
  engineVersion: string;
  flows: Array<{ flowName: string; criterion: string; facts: SensorObservation['facts'] }>;
}

/** Build the facts-only sensor envelope from observed transitions. */
export function buildSensorReport(
  observations: SensorObservation[],
  meta: { sha: string; prNumber: number | null },
): SensorReport {
  return {
    schema: SENSOR_REPORT_SCHEMA,
    sha: meta.sha,
    prNumber: meta.prNumber,
    engine: SENSOR_ENGINE,
    engineVersion: SENSOR_ENGINE_VERSION,
    flows: observations.map(o => ({
      flowName: o.flowName,
      criterion: SENSOR_CRITERION,
      facts: o.facts,
    })),
  };
}

/**
 * The LOCAL check conclusion, judged with the shared `judgeObservation`:
 *  - `failure` if any observed transition is a silent route change (fail);
 *  - `success` if at least one announced (pass) and none failed;
 *  - `neutral` when nothing was conclusively observed (all not-evaluated / empty) —
 *    never red the build on an inconclusive run (A4).
 */
export function sensorConclusion(observations: SensorObservation[]): 'success' | 'failure' | 'neutral' {
  let anyPass = false;
  for (const o of observations) {
    const verdict = judgeObservation(o.facts);
    if (verdict === 'fail') return 'failure';
    if (verdict === 'pass') anyPass = true;
  }
  return anyPass ? 'success' : 'neutral';
}

function summaryMarkdown(observations: SensorObservation[]): string {
  const rows = observations.map(o => {
    const v = judgeObservation(o.facts);
    const icon = v === 'pass' ? '✅' : v === 'fail' ? '❌' : '➖';
    return `- ${icon} \`${o.flowName}\` — ${v}`;
  });
  return [
    `**Runtime sensor (${SENSOR_CRITERION} status messages)** — ${observations.length} route transition(s) observed.`,
    '',
    ...rows,
    '',
    '_Runtime results apply only to the auto-discovered flows observed, not the whole product._',
  ].join('\n');
}

/**
 * Post the runtime sensor's Check Run: a local conclusion for the fast CI signal,
 * plus the facts envelope in `output.text` for the backend to judge and sign.
 */
export async function postSensorCheckRun(
  octokit: OctokitLike,
  target: { owner: string; repo: string; sha: string },
  observations: SensorObservation[],
  opts: { prNumber?: number | null } = {},
): Promise<void> {
  const conclusion = sensorConclusion(observations);
  const report = buildSensorReport(observations, {
    sha: target.sha,
    prNumber: opts.prNumber ?? null,
  });
  const failed = observations.filter(o => judgeObservation(o.facts) === 'fail').length;
  await octokit.rest.checks.create({
    owner: target.owner,
    repo: target.repo,
    name: SENSOR_CHECK_RUN_NAME,
    head_sha: target.sha,
    status: 'completed',
    conclusion,
    output: {
      title:
        failed > 0
          ? `${failed} silent route change(s)`
          : `${observations.length} route transition(s) checked`,
      summary: summaryMarkdown(observations),
      text: JSON.stringify(report),
    },
  });
}
