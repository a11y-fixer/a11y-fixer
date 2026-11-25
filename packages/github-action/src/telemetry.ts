// Opt-in anonymous usage telemetry.
//
// When a caller sets `telemetry: on`, the action sends ONE best-effort ping at
// the end of a run so the author can answer "how many / when did someone run
// the action". It is deliberately anonymous: it carries coarse counts and the
// runner environment, never the repo name, owner, actor, commit, or license
// identity. The ping is bounded by a short timeout and every failure is
// swallowed — telemetry must never fail or slow a run.
import * as core from '@actions/core';

const DEFAULT_ENDPOINT = 'https://a11y-fixer.com/api/telemetry';
const TIMEOUT_MS = 2000;

/** The exact, non-identifying payload sent to the telemetry endpoint. */
export interface TelemetryEvent {
  /** The Action ref the run used (e.g. `v1`), or null. Non-identifying. */
  actionVersion: string | null;
  /** `check` | `scan` | `fix`. */
  mode: string;
  /** Whether a valid license key authenticated the run (never which key). */
  licensed: boolean;
  /** Whether the run used the free public-repo tier. */
  publicRepo: boolean;
  violationsBefore: number;
  violationsAfter: number;
  fixesApplied: number;
  fixesReverted: number;
  regressions: number;
  usedUrl: boolean;
  usedHtml: boolean;
  usedMarkdown: boolean;
  usedComponents: boolean;
  platform: string;
  arch: string;
  nodeVersion: string;
}

/**
 * The non-identifying environment fields, read from the runner. `GITHUB_ACTION_REF`
 * is the version tag/sha the caller pinned — not repo identity.
 */
export function runtimeContext(): Pick<
  TelemetryEvent,
  'actionVersion' | 'platform' | 'arch' | 'nodeVersion'
> {
  return {
    actionVersion: process.env['GITHUB_ACTION_REF'] || null,
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
  };
}

/**
 * POST one telemetry event, best-effort. Resolves even on network/HTTP error or
 * timeout; it never throws. The endpoint is overridable via `A11Y_TELEMETRY_URL`
 * for testing.
 */
export async function sendTelemetry(event: TelemetryEvent): Promise<void> {
  const endpoint = process.env['A11Y_TELEMETRY_URL'] || DEFAULT_ENDPOINT;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
  } catch (err) {
    core.debug(`Telemetry ping skipped: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timer);
  }
}
